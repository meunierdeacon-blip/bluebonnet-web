// Settings for the builder app. Everything account-specific comes from environment variables, so the same code
// runs on your laptop (nothing set: free publishing, emails printed in the terminal) and on Railway (variables set).
// The full list, and how to set each one, is in LAUNCH.md.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/site.mjs';

const env = process.env;
const port = Number(env.PORT) || 4330;

export const CONFIG = {
  port,
  dataDir: env.BLUEBONNET_DATA || join(dirname(fileURLToPath(import.meta.url)), 'data'),
  // e.g. bluebonnetsites.com. Set: customer sites live at <slug>.bluebonnetsites.com. Empty: at /s/<slug>/ (local).
  baseDomain: (env.BASE_DOMAIN || '').toLowerCase(),
  appUrl: (env.APP_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  contactEmail: env.CONTACT_EMAIL || SITE.email,
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY || '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    prices: { monthly: env.STRIPE_PRICE_MONTHLY || '', yearly: env.STRIPE_PRICE_YEARLY || '' },
  },
  email: { resendKey: env.RESEND_API_KEY || '', from: env.EMAIL_FROM || '' },
};

// What customers see on the plan picker. Keep these in sync with the Prices you create in Stripe.
export const PLAN_LABELS = {
  monthly: { name: 'Monthly', price: '$15', per: 'month' },
  yearly: { name: 'Yearly', price: '$150', per: 'year', note: '2 months free' },
};

// No Stripe key = billing off: anyone can publish for free (local testing, or before launch)
export const billingEnabled = () => !!CONFIG.stripe.secretKey;

export const siteUrl = (slug) => (CONFIG.baseDomain ? `https://${slug}.${CONFIG.baseDomain}/` : `${CONFIG.appUrl}/s/${slug}/`);

// Subdomains customers can't take, because we use them or they'd look official
export const RESERVED_SLUGS = new Set(['www', 'app', 'api', 'admin', 'mail', 'email', 'help', 'support', 'billing', 'blog', 'status', 'dashboard', 'login', 'signup', 'bluebonnet', 'static', 'assets', 'cdn']);
