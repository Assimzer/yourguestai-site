import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { data: host } = await supabase
      .from("hosts")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    // Réutilise le customer Stripe existant s'il y en a déjà un (évite
    // les doublons si l'hôte relance un checkout après une tentative
    // annulée), sinon en crée un nouveau.
    let customerId = host?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_host_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      managed_payments: { enabled: false },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_LOGEMENTS,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/compte?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/compte?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Erreur create-subscription:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}