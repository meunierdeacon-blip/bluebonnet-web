# Launching the Bluebonnet builder

The code is ready. Launching it takes accounts that only you (and, for Stripe, a parent) can create.
Do the steps in order. Each one says what to tell Claude when you're done, so it can do the next part.

**Cost:** Railway Hobby is $5/month, which includes $5 of usage, and this app fits inside it. A domain is about $10–15/year. Stripe takes ~2.9% + 30¢ per payment. Email (Resend) is free at this size.

> Why Railway and not Fly.io: this laptop's school web filter (Securly) blocks `api.fly.io`, which every Fly command needs. Railway works from here.

---

## Step 1. Railway (hosting): you

1. Sign up at **railway.com**. "Sign in with GitHub" is easiest; use the `meunierdeacon-blip` account.
2. Choose the **Hobby** plan ($5/month) and add a card. The free trial can't hold a domain plus customer subdomains.

**Then tell Claude:** "Railway is set up." Claude will install Railway's command-line tool (the `@railway/cli` npm package) and start the login. A browser page asks you to approve it. Then Claude creates the project and its storage (a 5 GB volume at `/data`), deploys, and gives you a working `….up.railway.app` link.

## Step 2. Domain: you

1. Buy a domain, like `bluebonnetsites.com`, at Cloudflare Registrar, Namecheap, or Porkbun (~$10–15/year).
2. Leave its DNS settings page open.

**Then tell Claude:** "My domain is ____." Claude will add two custom domains in Railway, your domain and `*.yourdomain` for customer sites (Hobby allows exactly 2), and tell you exactly which DNS records to copy in. There's a CNAME for each, plus a TXT and an `_acme-challenge` CNAME so Railway can issue the HTTPS certificate. Then Claude switches the app to the new addresses. If your domain is on Cloudflare, turn **off** the orange-cloud proxy on the `_acme-challenge` record.

DNS changes usually work within an hour but can take up to 72.

## Step 3. Stripe (payments): you and a parent

Stripe requires an adult as the account owner if you're under 18.

1. Create an account at **stripe.com**. Use **Test mode** (toggle at the top) for everything below until Step 5.
2. **Product catalog → Add product:** name it "Bluebonnet website". Add two **recurring** prices:
   - **$15.00 monthly**
   - **$150.00 yearly**

   Copy each price's ID (`price_...`).
3. **Settings → Billing → Customer portal:** turn it on, and allow customers to **cancel** and **update payment methods**.
4. **Developers → Webhooks → Add endpoint:**
   - URL: `https://YOUR-DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

   Copy the **signing secret** (`whsec_...`).
5. **Developers → API keys:** copy the **secret key** (`sk_test_...`).
6. Save them in Railway yourself. Don't paste keys into chat. In the Railway dashboard, open the **bluebonnet** service, go to **Variables → New Variable**, and add:

   | Name | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_...` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
   | `STRIPE_PRICE_MONTHLY` | `price_...` (the $15 one) |
   | `STRIPE_PRICE_YEARLY` | `price_...` (the $150 one) |

   Railway redeploys on its own when you save.

**Then tell Claude:** "Stripe test keys are set." Claude will check that billing is on and walk you through a test purchase with Stripe's fake card: `4242 4242 4242 4242`, any future date, any CVC.

## Step 4. Email (password reset): you

1. Sign up at **resend.com** (free). Under **Domains**, add your domain and copy the DNS records it shows into your domain's DNS settings.
2. Create an **API key**. In Railway **Variables**, add:
   - `RESEND_API_KEY` = `re_...`
   - `EMAIL_FROM` = `Bluebonnet <hello@YOUR-DOMAIN>`

**Then tell Claude:** "Email is set." Claude will help you send yourself a test reset email.

## Step 5. Before real customers: you and a parent

- [ ] Read `/terms` and `/privacy` on the live site together and change anything that isn't right. They're written plainly, but they aren't legal advice.
- [ ] Ask a parent or tax preparer about **Texas sales tax** on website subscriptions. Stripe Tax can collect it if needed.
- [ ] In Stripe, switch to **Live mode** and repeat Step 3 parts 2–6 with the live keys (`sk_live_...`). Test mode and live mode have separate products, webhooks, and keys.
- [ ] Do one real purchase on your own card, then cancel it from the **Billing** link to confirm everything works.

---

## Reference: all settings (Railway → service → Variables)

| Setting | What it is | Example |
|---|---|---|
| `BASE_DOMAIN` | Your domain. Customer sites go on its subdomains. | `bluebonnetsites.com` |
| `APP_URL` | Where the builder lives | `https://bluebonnetsites.com` |
| `CONTACT_EMAIL` | Shown on Terms/Privacy and in emails (defaults to the one in `src/site.mjs`) | `hello@bluebonnetsites.com` |
| `STRIPE_SECRET_KEY` | Turns billing on. Without it, publishing is free. | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Proves webhook calls really come from Stripe | `whsec_...` |
| `STRIPE_PRICE_MONTHLY` / `_YEARLY` | The two prices from Step 3 | `price_...` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sends password reset emails. Without them, emails print in the deploy logs. | `re_...` |

Railway sets `PORT` itself. The Dockerfile sets `BLUEBONNET_DATA=/data`, which is where the volume is mounted.

The displayed prices ($15 / $150) are in `app/config.mjs` (`PLAN_LABELS`). Change them there if you change them in Stripe.

**Backups:** the app saves a full copy of the database every day to `/data/backups/` and keeps 14 days. Those copies live on the same volume, so they protect against mistakes, not against the volume being deleted. Railway's own volume backups (service → **Backups** tab) are worth turning on if your plan shows them.

**Useful commands** (from this folder, after Step 1):
```bash
~/.npm-global/bin/railway up --detach   # publish code changes
~/.npm-global/bin/railway logs          # watch what the app is doing
~/.npm-global/bin/railway open          # open the project dashboard
```

Run only **one** replica. All accounts and sites are in one SQLite file on one volume.
