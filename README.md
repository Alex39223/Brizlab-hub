# 🌉 Bridge OnRamp SaaS

A full-stack crypto onramp SaaS built on **Bridge.xyz** infrastructure. Accept USD via ACH/Wire and EUR via SEPA. Convert automatically to USDC on-chain.

---

## 🏗️ Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| ORM | Prisma |
| Onramp | Bridge.xyz API |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Notifications | Sonner |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (dashboard)/      # Protected: Dashboard, Onramp, Transactions, Admin
│   ├── api/
│   │   ├── auth/         # Registration endpoint
│   │   ├── bridge/       # Customers, Virtual Accounts, Webhooks
│   │   ├── admin/        # API key management
│   │   └── v1/           # B2B API (API-key authenticated)
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── dashboard/        # KYCBanner, LogoutButton
│   ├── onramp/           # CreateVirtualAccountForm, VirtualAccountCard
│   └── admin/            # ApiKeyManager
├── lib/
│   ├── bridge.ts         # Bridge.xyz API client
│   ├── prisma.ts         # Prisma singleton
│   ├── supabase.ts       # Supabase clients
│   ├── apiAuth.ts        # B2B API key auth middleware
│   └── utils.ts          # Helpers
├── types/
│   └── index.ts          # All TypeScript types
└── middleware.ts          # Route protection
```

---

## 🚀 Setup Guide

### Step 1 — Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **Settings > Database** → Copy the connection strings
3. Go to **Settings > API** → Copy `URL` and `anon key` and `service_role key`

### Step 2 — Bridge.xyz

1. Apply at [bridge.xyz](https://www.bridge.xyz)
2. Once approved, get your API key from the Bridge Dashboard
3. Set up a webhook endpoint pointing to:
   ```
   https://your-app.vercel.app/api/bridge/webhooks
   ```
4. Copy the webhook secret from Bridge dashboard

### Step 3 — Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres

BRIDGE_API_KEY=your-bridge-api-key
BRIDGE_API_URL=https://api.bridge.xyz
BRIDGE_WEBHOOK_SECRET=your-webhook-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_SECRET=generate-with-openssl-rand-hex-32
DEVELOPER_FEE_PERCENT=1.0
```

### Step 4 — Database Setup

```bash
npm install
npx prisma generate
npx prisma db push
```

### Step 5 — Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

Follow prompts. Then add env vars:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add BRIDGE_API_KEY
vercel env add BRIDGE_API_URL
vercel env add BRIDGE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_APP_URL
vercel env add APP_SECRET
vercel env add DEVELOPER_FEE_PERCENT
```

Then deploy to production:
```bash
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add all environment variables in the **Environment Variables** tab
4. Deploy

### Important: Update `NEXT_PUBLIC_APP_URL`

After deploying, update this env var to your actual Vercel URL:
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🔗 Bridge Webhook Setup

After deploying, go to your **Bridge Dashboard** and add the webhook:

- **URL**: `https://your-app.vercel.app/api/bridge/webhooks`
- **Events to subscribe**:
  - `virtual_account.deposit.pending`
  - `virtual_account.deposit.completed`
  - `virtual_account.deposit.failed`
  - `customer.kyc.approved`
  - `customer.kyc.rejected`

Copy the webhook secret and set it as `BRIDGE_WEBHOOK_SECRET`.

---

## 🔑 B2B API Reference

All B2B API routes require:
```
Authorization: Bearer brk_your_api_key
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/customers` | Create Bridge customer + get KYC URL |
| `POST` | `/api/v1/virtual-accounts` | Create USD or EUR virtual account |
| `GET` | `/api/v1/virtual-accounts` | List virtual accounts |
| `GET` | `/api/v1/transactions` | List transactions |

### Create Customer

```bash
curl -X POST https://your-app.vercel.app/api/v1/customers \
  -H "Authorization: Bearer brk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@example.com"}'
```

### Create Virtual Account

```bash
curl -X POST https://your-app.vercel.app/api/v1/virtual-accounts \
  -H "Authorization: Bearer brk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-from-create-customer",
    "currency": "usd",
    "destinationAddress": "0xYourWalletAddress",
    "destinationCurrency": "usdc",
    "destinationRail": "ethereum"
  }'
```

---

## 💰 Revenue Model

You earn fees on every transaction. Set `DEVELOPER_FEE_PERCENT` to your desired rate (e.g. `1.0` = 1%).

Bridge handles the rest — KYC, compliance, settlement, fraud.

---

## 🛡️ Make First User Admin

After signing up, run this in your Supabase SQL editor:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 🗺️ Roadmap

- [ ] Email notifications on deposit received
- [ ] Offramp support (crypto → fiat)
- [ ] Multi-user organizations
- [ ] Stripe subscription billing for SaaS tiers
- [ ] BRL (PIX) and GBP (FPS) support
- [ ] Analytics dashboard with charts
- [ ] Webhook retries and dead letter queue
