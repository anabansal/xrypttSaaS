# Xryptt — All-in-One Ethereum Monitoring

Xryptt is a full-stack SaaS for tracking Ethereum wallets: portfolio balances, transaction alerts, and wallet analytics, with a subscription billing layer on top.

> Internally this project is still named `wallet-monitor` in `package.json`.

## Features

- **Wallet tracking** — add and monitor Ethereum wallet addresses, view balances and transaction history
- **Portfolio viewer** — aggregated portfolio value across tracked wallets
- **Stealth wallets** — a dedicated flow for privacy-focused wallet tracking
- **AI News** — a curated crypto news feed
- **Auth & accounts** — email/password auth via Supabase, protected routes, user dashboard, settings
- **Payments** — subscription checkout via Paddle
- **Transactional email** — via Resend

## Tech stack

**Frontend** — React 18, Vite, React Router, Tailwind CSS, Web3.js, Supabase JS client

**Backend** — Node.js, Express, Redis-backed sessions, Ethereum data via Etherscan + Moralis + Infura, Paddle Node SDK, Resend

**Data** — Supabase (Postgres + Auth), with SQL migrations in [`supabase/migrations`](./supabase/migrations)

## Project structure

```
xrypttSaaS/
├── frontend/            # React + Vite web app
│   ├── src/
│   │   ├── components/  # Pages & UI (WalletTracking, PortfolioViewer, StealthWallet, ...)
│   │   ├── services/, hooks/, context/, utils/
│   │   └── App.jsx
│   └── public/
├── backend/             # Express API
│   └── src/
│       ├── routes/       # auth, wallet, balance, user, stealth, email, webhook, sitemap
│       ├── services/
│       ├── middlewares/
│       └── config/
└── supabase/
    └── migrations/      # Database schema history
```

## Getting started

### Prerequisites

- Node.js 18+
- A Redis instance (local or hosted, e.g. Upstash)
- Accounts/API keys for: Supabase, Etherscan, Moralis, Infura, Paddle, Resend

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

Create `frontend/.env.local`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PADDLE_SANDBOX_CLIENT_TOKEN=
VITE_ETHERSCAN_API_KEY=
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

Create `backend/.env`:

```
PORT=3000
NODE_ENV=development
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
INFURA_PROJECT_ID=
ETHERSCAN_API_KEY=
ETHERSCAN_API_KEY1=
MORALIS_API_KEY_1=
MORALIS_API_KEY_2=
PADDLE_API_KEY=
RESEND_API_KEY=
SESSION_SECRET=
WEBHOOK_SANDBOX_SECRET_KEY=
FRONTEND_URL=http://localhost:5173
```

> Note: both `.env.local` and `.env` are gitignored — never commit real keys.

### 3. Run it

```bash
# backend (Express API on :3000)
cd backend && npm run dev     # auto-restarts on file changes (node --watch)
# or: npm start               # plain node, no watch

# frontend (Vite dev server on :5173)
cd frontend && npm run dev
```

## Deployment (Render)

This repo includes a [`render.yaml`](./render.yaml) Blueprint that provisions two services:

- **`xryptt-backend`** — Node web service, root `backend/`, build `npm install`, start `npm start`
- **`xryptt-frontend`** — static site, root `frontend/`, build `npm install && npm run build`, publish `dist/`, with SPA rewrite to `index.html`

To deploy:

1. In the [Render dashboard](https://dashboard.render.com), choose **New → Blueprint** and point it at this repo. Render will read `render.yaml` and create both services.
2. Fill in the env vars marked `sync: false` in the dashboard (Supabase, Etherscan, Moralis, Infura, Paddle, Resend keys, etc.) — Render never reads secret values from the repo.
3. Add a Redis instance (Render's Key Value service, or an external one like Upstash) and set `REDIS_URL` on the backend.
4. Once both services are live, set `VITE_API_BASE_URL` on the frontend to the backend's `https://xryptt-backend.onrender.com`-style URL, and `FRONTEND_URL` on the backend to the frontend's URL (needed for CORS) — then redeploy.

If you already have live services under different names (this product has previously been deployed on Render), either reuse those exact names when applying the Blueprint, or update `FRONTEND_URL`/CORS in `backend/src/app.js` and `VITE_API_BASE_URL` in the frontend env to match your real URLs — this Blueprint intentionally doesn't touch any existing deployment.

## Related projects

- [`AI`](https://github.com/anabansal/AI) — a fork of this codebase that pivoted into the Lumaya AI companion product
- [`frontend-ai`](https://github.com/anabansal/frontend-ai) — the further-rebranded standalone web frontend for Lumaya
