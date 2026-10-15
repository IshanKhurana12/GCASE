# CaseCrate: wholesale phone covers

React + Vite storefront with a Firebase admin panel, Cloudinary photos, and WhatsApp ordering.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill it in:
   - **Firebase**: console.firebase.google.com → new project → add a Web app → copy the config. Enable **Firestore** and **Authentication → Email/Password**.
   - **Admin user**: Authentication → Users → Add user (this is your admin login at `/admin`).
   - **Cloudinary**: Settings → Upload → add an **unsigned** upload preset; put the cloud name and preset in `.env`.
   - **WhatsApp**: country code + number, digits only (e.g. `919876543210`).
3. Set `VITE_ADMIN_EMAIL` in `.env` to your admin user's email. Edit `firestore.rules`: replace `admin@yourshop.com` with your admin email, then publish the rules (`firebase deploy --only firestore:rules`). **Do this before going live**, otherwise anyone could edit your catalog.
4. `npm run dev`, then open `/admin` to add products.
5. Deploy: `npm run build && firebase deploy --only hosting`. Change the store name in `src/lib/config.js`.

## How it is organised
- `src/lib`: Firebase, Cloudinary, WhatsApp, formatting, cover and category logic
- `src/context`: cart (saved in localStorage) and admin auth
- `src/components`: each component has its own `.css` next to it
- `src/styles`: design tokens, reset, and shared button, form and modal styles
- `src/pages`: storefront, admin dashboard, admin login

## Product shape (Firestore `products`)
`coverType: 'choice' | 'lot'`. Choice covers have `models: [{ name, stock }]` and `stock` is their sum. Lots use `stock` (lots available), `lotSize` and `lotDetails`. Also: `name, sku, price, mrp, category, description, images[], order`.

## Access control
The whole store sits behind `withAccessGate` (`src/hoc`). Visitors see two options: admin sign-in, or a phone number. A number gets in only if the admin added it under **Admin panel → Customer access** (add, edit, pause with the switch, delete). Removing a number logs that visitor out live.
Wrap any page with `withAccessGate(Page)`, or `withAccessGate(Page, { adminOnly: true })` for admin-only pages.
# GCASE
