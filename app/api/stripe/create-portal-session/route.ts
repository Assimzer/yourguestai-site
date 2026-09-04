import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: host } = await supabase
    .from("hosts")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!host?.stripe_customer_id) {
    return NextResponse.json({ error: "Aucun abonnement trouvé" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: host.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/compte`,
  });

  return NextResponse.json({ url: session.url });
}
