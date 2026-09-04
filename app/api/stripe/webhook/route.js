import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function mapStripeStatus(stripeStatus) {
  if (stripeStatus === 'active') return 'actif';
  if (stripeStatus === 'trialing') return 'essai';
  return 'suspendu'; // past_due, canceled, unpaid, incomplete, incomplete_expired
}

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide:', err.message);
    return Response.json({ error: 'Signature invalide' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Récupère le statut réel de l'abonnement (peut être 'trialing' si essai gratuit)
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await supabase
          .from('hosts')
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: subscription.status,
            statut_abonnement: mapStripeStatus(subscription.status),
          })
          .eq('id', session.client_reference_id);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await supabase
          .from('hosts')
          .update({
            subscription_status: sub.status,
            statut_abonnement: mapStripeStatus(sub.status),
            logements_quantity: sub.items.data[0]?.quantity ?? 0,
          })
          .eq('stripe_customer_id', sub.customer);
        break;
      }

      default:
        // événement non géré, on ignore
        break;
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}