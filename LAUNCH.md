# Launching the Bluebonnet builder

The code is ready. Launching it takes accounts that only you (and, for Stripe, a parent) can create.
Do the steps in order. Each one says what to send Claude when you're done, so it can do the next part.

**Cost:** about $2–3/month for Fly.io, about $10–15/year for the domain, and Stripe takes ~2.9% + 30¢ per payment. Email (Resend) is free at this size.

---

## Step 1. Fly.io (hosting): you

1. Sign up at **fly.io** and add a card. Fly needs one even for small apps.
2. Install Fly's command-line tool by pasting this in Terminal:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
3. Log in. This opens your browser:
   ```bash
   ~/.fly/bin/flyctl auth login
   ```

**Then tell Claude:** "Fly is set up." Claude will create the app and its storage, deploy it, and show you the address (`https://bluebonnet-builder.fly.dev`). Claude asks you before anything that adds to your bill.

## Step 2. Domain: you

1. Buy a domain, like `bluebonnetsites.com`, at Cloudflare Registrar, Namecheap, or Porkbun (~$10–15/year).
2. Leave its DNS settings page open.

**Then tell Claude:** "My domain is ____." Claude will tell you exactly which DNS records to add, set up HTTPS for the domain and every customer subdomain (`juarez-lawn.yourdomain.com`), and switch the app over.

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
6. Save them into the app yourself. Don't paste keys into chat. Run this in Terminal from this folder, with your values filled in:
   ```bash
   ~/.fly/bin/flyctl secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... STRIPE_PRICE_MONTHLY=price_... STRIPE_PRICE_YEARLY=price_...
   ```

**Then tell Claude:** "Stripe test keys are set." Claude will run a test purchase with Stripe's fake card: `4242 4242 4242 4242`, any future date, any CVC.

## Step 4. Email (password reset): you

1. Sign up at **resend.com** (free). Under **Domains**, add your domain and copy the DNS records it shows into your domain's DNS settings.
2. Create an **API key**, then run:
   ```bash
   ~/.fly/bin/flyctl secrets set RESEND_API_KEY=re_... EMAIL_FROM="Bluebonnet <hello@YOUR-DOMAIN>"
   ```

**Then tell Claude:** "Email is set." Claude will send a test reset email.

## Step 5. Before real customers: you and a parent

- [ ] Read `/terms` and `/privacy` on the live site together and change anything that isn't right. They're written plainly, but they aren't legal advice.
- [ ] Ask a parent or tax preparer about **Texas sales tax** on website subscriptions. Stripe Tax can collect it if needed.
- [ ] In Stripe, switch to **Live mode** and repeat Step 3 parts 2–6 with the live keys (`sk_live_...`). Test mode and live mode have separate products, webhooks, and keys.
- [ ] Do one real purchase on your own card, then cancel it from the **Billing** link to confirm everything works.

---

## Reference: all settings

| Setting | What it is | Example |
|---|---|---|
| `BASE_DOMAIN` | Your domain. Customer sites go on its subdomains. | `bluebonnetsites.com` |
| `APP_URL` | Where the builder lives | `https://bluebonnetsites.com` |
| `CONTACT_EMAIL` | Shown on Terms/Privacy and in emails (defaults to the one in `src/site.mjs`) | `hello@bluebonnetsites.com` |
| `STRIPE_SECRET_KEY` | Turns billing on. Without it, publishing is free. | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Proves webhook calls really come from Stripe | `whsec_...` |
| `STRIPE_PRICE_MONTHLY` / `_YEARLY` | The two prices from Step 3 | `price_...` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sends password reset emails. Without them, emails print in the server log. | `re_...` |

The displayed prices ($15 / $150) are in `app/config.mjs` (`PLAN_LABELS`). Change them there if you change them in Stripe.

**Useful commands** (from this folder):
```bash
~/.fly/bin/flyctl deploy            # publish code changes
~/.fly/bin/flyctl logs              # watch what the app is doing
~/.fly/bin/flyctl volumes snapshots list bluebonnet_data   # daily backups
```

Run only **one** machine. All accounts and sites are in one SQLite file on one volume.
