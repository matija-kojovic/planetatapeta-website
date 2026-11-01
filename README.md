# PLANETATAPETA

Web shop for PLANETATAPETA (Belgrade): made-to-measure photo wallpaper, wall stickers, canvas and plexiglass prints, and custom printed stickers. Customers choose a design, enter dimensions, see the price and send an order. There is no online payment: the business contacts the customer to confirm each order.

Customer-facing copy is in Serbian (Latin script). Code and documentation are in English.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 + design tokens and component classes in `app/globals.css` |
| Fonts | EB Garamond (display) and Schibsted Grotesk (UI), self-hosted with `next/font` |
| E-mail | `nodemailer` over Gmail SMTP |
| Storage | JSON files in `data/database/` (see [Deployment limitations](#deployment-limitations)) |
| Tests | Node's built-in test runner (`node --test`) |

Requires Node.js 20.9 or newer.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

The shop works without any environment variables. The admin stays locked until `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are set, and e-mails are skipped until `EMAIL_USER` and `EMAIL_PASS` are set.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | for the admin | Admin login password, at least 12 characters. |
| `ADMIN_SESSION_SECRET` | for the admin | HMAC key for the session cookie, at least 32 characters. Changing it logs everyone out. |
| `EMAIL_USER`, `EMAIL_PASS` | for e-mail | Gmail address and [app password](https://support.google.com/accounts/answer/185833) for order and contact e-mails. |
| `ORDER_NOTIFY_EMAIL` | no | Inbox for order and contact notifications. Defaults to `planetatapeta20@gmail.com`. |
| `NEXT_PUBLIC_SITE_URL` | in production | Public origin for canonical URLs, `sitemap.xml`, `robots.txt` and JSON-LD. Defaults to `http://localhost:3000`. |

`.env*` files are git-ignored, except `.env.example`, which must never contain real values.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. |
| `npm test` | Unit tests for pricing, option validation, admin auth, CSRF guard, form validation and HTML escaping. |
| `npm run lint` | ESLint (`eslint-config-next`). |
| `npm run build` | Production build. Category, collection and design pages are statically generated. |
| `npm start` | Serves the production build (run `npm run build` first). |
| `npm run seed:orders` | Adds clearly fake test orders to the git-ignored `data/database/orders.json`, so the admin can be tried with data (`-- 20` for more). Refuses to run in production. |
| `npm run catalog` | Regenerates `data/designs.json` from the image folders in `public/` (uses `sharp`, installed with Next.js). Run it after adding or removing design images, and commit the result. |

## How the code is organised

```
app/
  (shop)/              Storefront: home, categories, collections, design pages, cart, checkout, contact
  admin/               Admin: login, dashboard, orders, products and prices, site content
  api/                 Orders, order quotes, products, content, uploads, contact, admin login/logout
  uploads/[file]/      Serves images uploaded in the admin
  sitemap.js, robots.js
components/
  shop/                Header, footer, cards, design page, cart, checkout, contact form
  configurators/       Price configurators for each product type
  admin/               Admin navigation, tables and forms
lib/
  pricing.js           The only source of prices and option rules, shared by browser and server
  catalog.js           Categories, collections and designs (reads data/designs.json)
  orders.js            Builds and prices order items on the server
  db.js                JSON file storage with atomic writes
  auth.js              Admin password check and signed session cookie
  validation.js        Customer, contact, content and product validation
  security.js, mail.js, format.js, site.js, faq.js, uploads.js
data/
  designs.json         Generated design catalog (do not edit by hand)
  database/            content.json, products.json; orders.json is created on the first order and git-ignored
proxy.js               Sends signed-out /admin requests to the login page
next.config.mjs        Security headers, CSP, redirects from the old URLs
```

### Prices

`lib/pricing.js` defines the products, options, size limits and **default** prices. The configurators use it to show prices, and the order API uses it to recalculate every line on the server; prices sent by the browser are ignored.

Prices can be changed in the admin under **Proizvodi i cene** (every amount listed in `PRICE_FIELDS`). Only amounts that differ from the defaults are stored, in `data/database/prices.json`. The server applies them before rendering or pricing an order (`lib/prices.js`), and `<PricingSync>` in the root layout applies the same amounts in the browser, so the configurators, cart and server always agree. Saving revalidates the static pages. Orders already received keep the prices they were placed with. Products, options and size limits are not editable; change those in `lib/pricing.js` and run `npm test`.

Some limits did not exist on the original site and are marked `ASSUMPTION` in `lib/pricing.js` (size limits, the custom sticker quantity range, and the provisional sticker printing rate of 0,35 RSD/cm²). They need confirmation from the business.

### Admin

`/admin` (login with `ADMIN_PASSWORD`):

- **Pregled**: order counts and the latest orders.
- **Porudžbine**: search, filter, status changes, order details and CSV export.
- **Proizvodi i cene**: add, edit and delete fixed-price products (shown on their category page and at `/product/{id}`), edit the prices of the made-to-measure products, and see the size and quantity limits (read-only).
- **Sadržaj sajta**: homepage headline, announcement bar, contact details and SEO title and description.

Security: the session cookie is HttpOnly, SameSite=Strict, Secure in production, signed with HMAC-SHA256 and expires after 8 hours. Login is rate-limited. Every admin page checks the session on the server, and every admin API handler checks the session and, for writes, that the request comes from the site's own origin. Uploads accept only JPG, PNG and WebP up to 5 MB, detected from the file contents.

## Testing

```bash
npm test
npm run lint
npm run build
```

To try the admin and order flow locally, set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local` with test values. Orders placed locally are written to `data/database/orders.json` (git-ignored). Do not place test orders on the production site.

Admin edits locally change `data/database/content.json` and `data/database/products.json`, which are committed. Revert them with `git checkout -- data/database` if they were only a test.

## Deployment

The site is hosted on Vercel. `vercel.json` pins functions to the `fra1` (Frankfurt) region. Set the environment variables above in the Vercel project settings before deploying.

### Deployment limitations

These are known and need a decision before or soon after the next production deploy:

- **Read-only storage on Vercel.** Vercel functions cannot write to the deployment's files, so on Vercel:
  - orders are not saved to `orders.json`. An order is still accepted if the notification e-mail is sent, so `EMAIL_USER` and `EMAIL_PASS` must be set. If both saving and e-mail fail, the customer is asked to call or e-mail instead;
  - the admin's order list, status changes, product edits, price edits, content edits and image uploads do not persist. The admin shows a notice when storage is read-only.

  A persistent store is needed for these to work on Vercel (for example a hosted Postgres database or blob storage), or the site can run on a server with a writable disk. This needs the owner's decision; nothing has been set up.
- **Customer file upload** is not built, because it needs object storage. Customers send design files by e-mail with their order number.
- **Rate limits** are kept in memory per server instance, so they are best-effort on serverless hosting.
- **Legal pages** (privacy policy, terms of sale) show their structure only and are `noindex`. The texts must be written or approved by the business before launch.
- **Design images** are watermarked stock previews. Licensed files or the business's own photos are needed; the watermarks must not be removed or hidden.
- **Domain**: set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical URLs and the sitemap are correct.

### Old URLs

The old `/category/...`, `/product/...`, `/privacy` and `/terms` URLs redirect permanently (308) to the new pages, so existing links and search results keep working.
