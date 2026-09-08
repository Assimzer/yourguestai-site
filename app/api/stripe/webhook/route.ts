import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { notifyN8nToggle } from "@/lib/n8n/notifyToggle";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status) {
  if (stripeStatus === "active") return "actif";
  if (stripeStatus === "trialing") return "essai";
  return "suspendu"; // past_due, canceled, unpaid, incomplete, incomplete_expired
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Signature webhook invalide:", (err as Error).message);
    return Response.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Récupère le statut réel de l'abonnement (peut être 'trialing' si essai gratuit)
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await supabase
          .from("hosts")
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: subscription.status,
            statut_abonnement: mapStripeStatus(subscription.status),
          })
          .eq("id", session.client_reference_id);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const newStatus = mapStripeStatus(sub.status);

        const { data: updatedHosts } = await supabase
          .from("hosts")
          .update({
            subscription_status: sub.status,
            statut_abonnement: newStatus,
            logements_quantity: sub.items.data[0]?.quantity ?? 0,
          })
          .eq("stripe_customer_id", sub.customer as string)
          .select("id");

        const hostId = updatedHosts?.[0]?.id;

        // Si l'abonnement n'est plus payant (paiement refusé, résilié...),
        // on désactive tous les logements actifs de cet hôte : sinon LÉO
        // continuerait à répondre gratuitement après un incident de paiement.
        if (hostId && newStatus !== "actif" && newStatus !== "essai") {
          const { data: properties } = await supabase
            .from("properties")
            .select("id, cle_unique_airtable")
            .eq("host_id", hostId)
            .eq("actif", true);

          if (properties && properties.length > 0) {
            await supabase
              .from("properties")
              .update({ actif: false })
              .eq("host_id", hostId)
              .eq("actif", true);

            for (const property of properties) {
              try {
                await notifyN8nToggle(property.cle_unique_airtable, false);
              } catch {
                // Statut déjà à jour côté Supabase ; échec de notification n8n à surveiller.
              }
            }
          }
        }
        break;
      }

      default:
        // événement non géré, on ignore
        break;
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Erreur traitement webhook:", err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
