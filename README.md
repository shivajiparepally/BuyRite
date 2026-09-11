# North Brunswick Bottle Shop — E-Commerce Platform

A real, deployable full-stack project: Django + Django REST Framework + PostgreSQL backend,
React (Vite) frontend, JWT auth, and a full admin dashboard.

**Pay-at-pickup only — no payment gateway in this phase.**

## What's included

- Product catalog with categories and per-size variants (SKU, price, sale price, stock)
- Search with autosuggest, category filtering
- Cart → order submission (pay at pickup), with live store-hours check and next-day scheduling
- Out-of-stock substitution choice, enforced both in the UI and on the server
- Customer accounts with age verification (21+) at signup, enforced server-side
- Admin dashboard: Orders (status flow, cancel, archive/restore/undo), Products (full CRUD),
  Promotions (homepage carousel banners), Store Hours
- Sound + visual notification banner in the admin when a new order comes in (polling-based)
- A `seed_demo_data` management command that loads ~80 real sample products across all
  10 standard liquor-store categories, since CSV import isn't built yet

## What's intentionally NOT included yet

- **CSV bulk import** — not built. `catalog/views.py` has a comment marking where the
  import endpoint will go once the CSV format is finalized. Use `seed_demo_data` for now.
- Payment gateway / online payment
- Delivery (planned as a future phase via a third-party service)
- Fraud tools, loyalty program, volume/quantity discounts — all removed per current scope

## Project structure

```
liquor-store/
├── backend/                 Django + DRF + PostgreSQL
│   ├── config/               Project settings, root urls
│   ├── accounts/             Custom User model (age verification), JWT auth
│   ├── catalog/               Category, Product, ProductVariant + seed_demo_data command
│   ├── orders/                Order, OrderItem, status flow, substitution enforcement
│   ├── promotions/            Homepage carousel banners
│   ├── storehours/            Store hours per weekday
│   └── requirements.txt
├── frontend/                 React (Vite) + Tailwind
│   └── src/
│       ├── api/               Axios client with JWT auto-refresh
│       ├── context/            Auth + Cart state
│       ├── components/         Header, ProductCard, CartDrawer, etc.
│       └── pages/
│           ├── Home.jsx         Customer catalog + cart
│           ├── Login.jsx / Signup.jsx
│           └── admin/           Admin dashboard (Orders, Products, Promotions, Hours)
├── docker-compose.yml
└── README.md   (you are here)
```

## Local development setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit .env with real values
```

You'll need a local PostgreSQL running. Quickest way:

```bash
docker run --name liquor-postgres -e POSTGRES_DB=liquor_store \
  -e POSTGRES_USER=liquor_store -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 -d postgres:16
```

Then match those values in `backend/.env`. With Postgres running:

```bash
python manage.py migrate
python manage.py createsuperuser      # this becomes your admin login
python manage.py seed_demo_data       # loads ~80 sample products
python manage.py runserver            # http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL should point at your backend + /api
npm run dev                     # http://localhost:5173
```

Log in with the superuser account you created — since `is_staff` doubles as "is admin"
for this project, that account will see the **Admin** button in the header.

### Everything at once with Docker

```bash
cp backend/.env.example backend/.env   # edit as needed
docker compose up --build
```

## Deploying for real

- **Backend + Postgres**: Render, Railway, or DigitalOcean App Platform all work well and
  are inexpensive for a single store's traffic. Set the same environment variables from
  `.env.example` in your host's dashboard — never commit `.env` to version control.
- **Frontend**: Vercel or Netlify — point `VITE_API_URL` at your deployed backend's URL.
- Set `DJANGO_DEBUG=False` and a real `DJANGO_SECRET_KEY` before going live.
- Update `CORS_ALLOWED_ORIGIN` to your real frontend domain once deployed.

## Notes on decisions baked into this code

- **Admin = `is_staff`.** There's only one admin account for now (per current scope), so
  this project doesn't build a separate roles/permissions system — any `is_staff` user can
  fully manage the store. Django's own `/admin/` panel is also available as a fallback for
  direct database editing if ever needed.
- **Orders are never deleted**, only status-changed / archived / restored — matches the
  "cancel, archive, undo" requirement discussed.
- **Substitution choice is enforced server-side**, not just in the UI — an API call trying
  to order an out-of-stock item without a substitution choice gets rejected with a 400.
- **Product images**: the `Product.image_url` field exists and is ready to use, but is
  intentionally left empty in the seed data. Populate it later with real manufacturer/
  distributor-provided images — not scraped photos — to avoid copyright issues.
