# SNLRICH

Multi-merchant marketplace with **points, cashback, referral rewards**, wishlist, reviews, coupons, merchant portal and admin panel.
Built with Next.js 15 (App Router), Prisma, Tailwind CSS. UI/UX follows the Nebula-style mockup (navy + sand).

## Features

| Area | What's included |
|------|-----------------|
| Storefront | Home (hero, categories, trending, banners, collections), shop with search/filter/sort/pagination, product page, store pages, wishlist, reviews (verified buyers) |
| Cart & checkout | Local cart, multi-merchant checkout (one order per merchant), coupons, free-shipping threshold, pay with points and/or wallet |
| Rewards | **Points** (per-store rate), **cashback wallet** (per-store %), **referral** (code + link + tracking), full transaction ledger |
| Merchants | Apply → admin approval, product CRUD, stock, order fulfilment, own reward rates, sales & net earnings |
| Admin | Platform stats, approve/suspend merchants, per-merchant commission, manual point/wallet adjustments, all orders, coupons |
| Security | bcrypt passwords, signed JWT httpOnly cookie, server-side price recalculation, role checks in every action |

### Reward rules (edit in [`lib/config.ts`](lib/config.ts))
- 100 points = 1.00 at checkout
- Signup bonus 100 pts; **300 pts** if you join with a referral code
- Referrer gets **500 pts** once the friend's *first order is delivered*
- Points + cashback are earned on the cash-paid part of an order, credited when status = `DELIVERED`, and reversed (redeemed points/wallet refunded) if cancelled

## Run locally

Requires Node 18.18+.

```bash
npm install
npm run setup     # creates SQLite DB + demo data
npm run dev       # http://localhost:3000
```

Demo accounts (password shown):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@snlrich.com | Admin@12345 |
| Merchant | tech@snlrich.com | Demo@12345 |
| Customer | demo@snlrich.com | Demo@12345 |

Reset the DB any time with `npm run db:reset`.

### Replace the logo
Overwrite `public/logo.svg` (for white backgrounds) and `public/logo-light.svg` (for the dark footer), plus `public/icon.svg` (favicon). PNG works too: change the file names in [`components/Logo.tsx`](components/Logo.tsx).

## Database provider (SQLite ⇄ PostgreSQL)

[`scripts/prepare-db.mjs`](scripts/prepare-db.mjs) reads `DATABASE_URL` and sets the Prisma provider automatically:
- `file:./dev.db` → SQLite (local)
- `postgresql://…` → PostgreSQL (Vercel / VPS)

It runs on `postinstall`, `dev` and `build`. Commit the schema as-is; no manual edits.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "SNLRICH initial"
git branch -M main
git remote add origin https://github.com/<you>/snlrich.git
git push -u origin main
```
`.env` and `*.db` are git-ignored.

## 2. Demo on Vercel

Vercel's filesystem is read-only, so SQLite can't be used. Use a free Postgres (Neon or Supabase):

1. Create a Postgres DB, copy its connection string.
2. Create the tables + demo data **from your computer** (one time):
   ```powershell
   $env:DATABASE_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"
   npm run setup
   ```
3. Import the GitHub repo in Vercel. Add Environment Variables:
   - `DATABASE_URL` = the Postgres URL
   - `AUTH_SECRET` = a long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
4. Deploy. (Build command `npm run build` is already the default.)

> Tip: use Neon's *pooled* connection string for serverless.

## 3. Production on 1Byte VPS

Assumes Ubuntu with SSH access.

```bash
# Node 20 + tools
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git postgresql
sudo npm i -g pm2

# Database
sudo -u postgres psql -c "CREATE USER snl WITH PASSWORD 'STRONG_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE snlrich OWNER snl;"

# App
git clone https://github.com/<you>/snlrich.git /var/www/snlrich && cd /var/www/snlrich
cat > .env <<'EOF'
DATABASE_URL="postgresql://snl:STRONG_PASSWORD@localhost:5432/snlrich"
AUTH_SECRET="PASTE_LONG_RANDOM_STRING"
NEXT_PUBLIC_SITE_NAME="SNLRICH"
NEXT_PUBLIC_CURRENCY_SYMBOL="$"
EOF
npm ci
npm run db:push
npm run db:seed        # optional: demo data (then change/remove demo accounts!)
npm run build
pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
```

Nginx (`/etc/nginx/sites-available/snlrich`):
```nginx
server {
  server_name yourdomain.com www.yourdomain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/snlrich /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
**HTTPS is required** (session cookie is `Secure` in production). Update later: `git pull && npm ci && npm run build && pm2 restart snlrich`.

If your 1Byte plan is cPanel shared hosting instead of a VPS, use *Setup Node.js App* with `npm run build` and `npm start` as the entry, and a MySQL/Postgres DB (MySQL needs `provider = "mysql"` support added to `prepare-db.mjs`).

## Before going live
- Change/remove seeded demo accounts; set a strong `AUTH_SECRET`.
- Payments are **simulated**. Integrate a real gateway (Stripe/2C2P/Omise…) in `lib/orders.ts` / checkout and mark `paymentStatus` from its webhook.
- Product images use URLs (serverless has no persistent disk). Add S3/Cloudinary/UploadThing for uploads.
- Add email (order confirmation, password reset) and rate limiting on login.
- Case-insensitive search: on PostgreSQL add `mode: "insensitive"` to the `contains` filters in `app/shop/page.tsx`.
