import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function syncLogementQuantity(hostId) {
  const { count, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', hostId)
    .eq('actif', true);

  if (countError) {
    console.error('Erreur comptage properties:', countError);
    throw countError;
  }

  const { data: host, error: hostError } = await supabase
    .from('hosts')
    .select('stripe_subscription_id')
    .eq('id', hostId)
    .single();

  if (hostError || !host?.stripe_subscription_id) {
    return null; // pas d'abonnement actif — rien à synchroniser
  }

  const subscription = await stripe.subscriptions.retrieve(host.stripe_subscription_id);
  const itemId = subscription.items.data[0].id;

  return stripe.subscriptionItems.update(itemId, {
    quantity: count,
    proration_behavior: 'create_prorations',
  });
}