// Stripe, called over its HTTP API with fetch (no SDK to install). Only three things are needed:
// a Checkout page to start a subscription, the Billing Portal so customers can change cards or cancel,
// and the webhook that tells us when a subscription starts, changes, or ends.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { CONFIG } from './config.mjs';

// Stripe takes form-encoded bodies with nested keys: { line_items: [{ price: 'x' }] } → line_items[0][price]=x
const encode = (obj, prefix = '', out = new URLSearchParams()) => {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') encode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
};

async function call(path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${CONFIG.stripe.secretKey}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: encode(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe: ${data.error?.message || res.status}`);
  return data;
}

export const createCheckout = ({ user, plan }) => call('checkout/sessions', {
  mode: 'subscription',
  line_items: [{ price: CONFIG.stripe.prices[plan], quantity: 1 }],
  ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
  client_reference_id: user.id,
  subscription_data: { metadata: { user_id: user.id } },
  allow_promotion_codes: true,
  success_url: `${CONFIG.appUrl}/build?paid=1`,
  cancel_url: `${CONFIG.appUrl}/build`,
});

export const createPortal = ({ user }) => call('billing_portal/sessions', {
  customer: user.stripeCustomerId,
  return_url: `${CONFIG.appUrl}/build`,
});

// Checks the Stripe-Signature header the way Stripe's own libraries do:
// HMAC-SHA256 of "<timestamp>.<raw body>" with the webhook secret, and the timestamp within 5 minutes.
export function verifyWebhook(rawBody, header, secret = CONFIG.stripe.webhookSecret, now = Date.now()) {
  if (!secret || !header) return false;
  const parts = header.split(',').map((p) => p.split('='));
  const t = Number(parts.find(([k]) => k === 't')?.[1]);
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length || Math.abs(now / 1000 - t) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  return sigs.some((s) => {
    const got = Buffer.from(s, 'hex');
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

// Turns a webhook event into what the database needs to know, or null for events we ignore
export function subscriptionChange(event) {
  const o = event.data?.object || {};
  if (event.type === 'checkout.session.completed' && o.mode === 'subscription') {
    return { userId: Number(o.client_reference_id) || null, customerId: o.customer, subId: o.subscription, status: 'active' };
  }
  if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
    return {
      userId: Number(o.metadata?.user_id) || null,
      customerId: o.customer,
      subId: o.id,
      status: o.status,
      periodEnd: o.items?.data?.[0]?.current_period_end || o.current_period_end || null,
    };
  }
  return null;
}
