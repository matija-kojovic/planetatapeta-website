# PLANETATAPETA — Project handoff

Written 2026-11-01 so a new Claude Code session (different Claude account, no access to the previous conversation) can continue the redesign without losing context. Everything below was checked against the codebase at the time of writing. Where something is planned but not built, it says so.

---

## 0. Read this first

| What | Where / state |
|---|---|
| **Work folder (the only one to edit)** | `~/Desktop/planetatapeta-website` |
| **Original project, do not touch** | `~/Desktop/SajtZaStampariju-main`. The original developer's (Djordje Todorovic's) project, restored to exactly how it was received. The owner explicitly asked that it not be modified. Contains the only copy of local customer orders (`data/database/orders.json`) and the source folders `Slike shutterstock/`, `slike/`, `Za sajt.xlsx`. Read it for reference only. |
| **GitHub repo** | https://github.com/matija-kojovic/planetatapeta-website (private). GitHub CLI `gh` is authenticated on this machine as `matija-kojovic` (repo scope). This is independent of the Claude account. |
| **Branches** | `main` = baseline commit `3e6b607` (original source, minus customer data). `redesign` = all work below, **all uncommitted** at handoff time. |
| **Remote state** | Only `main` (baseline) has been pushed. Nothing from `redesign` is on GitHub yet. |
| **Original developer's GitHub repo** | Never touched, and must not be. |
| **Production site** | Live on Vercel (per the browser report). Not deployed to, and must not be without the owner's explicit authorisation. |

**First actions for the new session**

1. `cd ~/Desktop/planetatapeta-website && git status`. Expect a large uncommitted diff on `redesign`.
2. `npm install` (if `node_modules` is missing), then `npm test` (18 tests should pass).
3. Ask the owner whether to commit the work in progress (suggested split in §9) before continuing.
4. Continue with the remaining work in §8.

---

## 1. Project overview

**PLANETATAPETA** is a Serbian (Belgrade) business selling made-to-measure photo wallpaper (*tapete*), decorative wall stickers (*zidni stikeri*), canvas prints (*slike na platnu*), plexiglass prints (*slike na pleksiglasu*) and custom printed stickers (*izrada nalepnica*). Customers choose a design, enter dimensions, see the price, and send an order. **There is no online payment**: orders are submitted and the business contacts the customer to confirm.

Goal of this project: take ownership of the site from the original developer and turn it into a premium, secure, fast, accessible, maintainable e-commerce site in a new private repository.

### Technology stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.1.6**, App Router, Turbopack (build) |
| UI | React 19.2.3 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + design tokens and component classes in `app/globals.css` |
| Fonts | `next/font/google`: **EB Garamond** (display) + **Schibsted Grotesk** (UI/body), both with `latin-ext` for Serbian diacritics |
| E-mail | `nodemailer` via Gmail SMTP (`EMAIL_USER`, `EMAIL_PASS`) |
| Storage | JSON files in `data/database/` (see limitations in §8) |
| Images | `next/image` (AVIF/WebP), `sharp` used by the catalog script |
| Tests | Node built-in test runner (`node --test`), no extra dependencies |
| Hosting | Vercel (existing). `vercel.json` now pins the function region to `fra1` (Frankfurt) |
| Package type | `"type": "module"` in package.json |

Next.js 16 specifics already applied: `params`/`searchParams` are Promises (awaited), the request gate is **`proxy.js`** (not `middleware.js`), and the Tailwind classes in `globals.css` are in `@layer base`/`@layer components` so utilities can override them.

### Commands

```bash
npm install          # dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build (last successful build: 230 static pages)
npm start            # serve the production build
npm test             # node --test tests/  (pricing, auth, validation)
npm run lint         # eslint (not yet run on the new code)
npm run catalog      # regenerate data/designs.json after adding/removing design images
```

### Environment variables (no `.env.example` exists yet — create it, see §8)

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Admin login password, **≥ 12 chars**. Without it the admin stays locked (fail closed). |
| `ADMIN_SESSION_SECRET` | HMAC key for the admin session cookie, **≥ 32 chars**. Rotating it logs everyone out. |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail account + app password for order and contact e-mails. Without them, e-mails are skipped. |
| `ORDER_NOTIFY_EMAIL` | Inbox for order/contact mail. Default `planetatapeta20@gmail.com` (the original hardcoded recipient). |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and JSON-LD (e.g. the production domain). Defaults to `http://localhost:3000`. |

### Directory map (current working tree)

```
app/
  layout.js                      Root: <html lang="sr-Latn">, fonts, metadata from CMS SEO fields
  globals.css                    Design system (tokens, buttons, forms, choice controls, dimension lines, boards)
  not-found.js                   Serbian 404 with storefront chrome
  sitemap.js, robots.js          Technical SEO
  icon.png, apple-icon.png, opengraph-image.jpg   Generated from the logo
  (shop)/                        Storefront route group (header/footer/cart)
    layout.js                    Wraps pages in SiteChrome
    page.js                      Homepage
    [category]/page.js           /tapete, /zidni-stikeri, /slike-na-platnu, /slike-na-pleksiglasu, /izrada-nalepnica
    [category]/[collection]/page.js          Collection page (e.g. /tapete/cvetne) OR canvas design page (/slike-na-platnu/motiv-03)
    [category]/[collection]/[design]/page.js Design page (e.g. /tapete/cvetne/cvetna-tapeta-09)
    cart/, checkout/, contact/   Cart, checkout, contact
    product/[productId]/page.js  Admin fixed-price products + permanent redirects for all old /product/... URLs
    politika-privatnosti/, uslovi-koriscenja/   Legal page STRUCTURE only (text missing, noindex)
  admin/
    layout.js                    Admin root (noindex, no storefront chrome)
    login/page.js                Login (or "not configured" notice)
    (panel)/layout.js            Server-side session check + AdminNav + read-only-storage warning
    (panel)/page.js              Dashboard with real numbers
    (panel)/orders/page.js       Orders table
    (panel)/products/            EMPTY — page not written yet
    (panel)/content/             EMPTY — page not written yet
  api/
    orders/route.js              GET (admin), POST (public, server-priced), PATCH status (admin)
    orders/quote/route.js        POST: server prices the cart without creating an order (checkout summary)
    products/route.js            GET public; POST/PUT/DELETE admin (fixed-price products)
    content/route.js             GET/POST admin
    upload/route.js              POST admin; image type sniffed from bytes, 5 MB limit
    contact/route.js             POST public; validated, rate-limited, honeypot
    admin/login, admin/logout    Session cookie
  uploads/[file]/route.js        Serves admin-uploaded images from data/uploads
components/
  CartProvider.js                Cart context (localStorage key planetatapeta-cart-v1; stores choices, never prices)
  icons.js                       One SVG icon family (1.5px stroke)
  configurators/                 WallConfigurator (tapete + zidni-stikeri), CanvasConfigurator, PlexiglassConfigurator,
                                 StickerPrintConfigurator, DesignStage (viewer + lightbox), fields.js (form primitives)
  shop/                          Header (+HeaderClient), Footer, SiteChrome, Breadcrumbs (+JSON-LD), JsonLd, DesignCard,
                                 DesignPage, Dimension (dimension lines/Elevation), PageHeader, RateTable, ProductGlyph,
                                 CartView, CartThumb, Checkout, ContactForm, FormField, FixedProducts,
                                 FixedProductActions, LegalPlaceholder
  admin/                         AdminNav, LoginForm, OrdersTable
lib/
  pricing.js     THE single source of pricing rules + option validation + price calculation (shared client/server)
  catalog.js     Categories, collections, design lookup, featured list, legacy URL maps
  orders.js      Server-side order item building/validation (server-only)
  db.js          JSON-file storage, atomic writes, StorageUnavailableError, isStorageWritable (server-only)
  auth.js        Admin password check, signed session tokens, requireAdmin, same-origin check
  security.js    escapeHtml, rate limiter, size-capped JSON body reader, client IP
  validation.js  Customer, contact and content validation (shared)
  mail.js        nodemailer wrapper with escaped HTML templates (server-only)
  format.js      RSD/area/number/date formatting (sr-RS)
  faq.js, site.js, uploads.js
data/
  designs.json   GENERATED catalog: 197 designs, 8 collections, with image width/height/dominant colour
  database/content.json   CMS content (hero, announcement, contact, SEO) — migrated to new structure
  database/products.json  Fixed-price products (now [] — the 15 legacy seed entries were retired, see §2)
  database/orders.json    NOT in git (customer data). Created on first order.
scripts/build-catalog.mjs  Generates data/designs.json from /public image folders
tests/                     pricing.test.mjs, auth-and-validation.test.mjs (18 tests, all passing)
public/                    Design images (tapete/, stikeri/, slike-na-platnu/), logoZaSajt.jpeg, brand/mark.webp
proxy.js                   Redirects unauthenticated /admin requests to /admin/login
next.config.mjs            Security headers, CSP, legacy redirects, image formats, poweredByHeader off
vercel.json                regions: ["fra1"]
```

---

## 2. Work completed

Status legend: ✅ done and present in code · 🟡 partially done · ⬜ planned, not started.

### Repository and safety
- ✅ New private GitHub repo `matija-kojovic/planetatapeta-website` created. Baseline commit `3e6b607` pushed to `main`.
- ✅ Baseline excludes `data/database/orders.json` (25 orders; mixed test and gmail addresses, treated as real PII), `.claude/settings.local.json`, the duplicate `Slike shutterstock/` folder, `slike/` and `Za sajt.xlsx`. No secrets or `.env` files were found in the source.
- ✅ `.gitignore` covers node_modules, .next, env files (except `.env.example`), orders.json, `data/uploads/`, `public/uploads/`, local tooling, the business files above.
- ✅ Work moved to a copy at the owner's request. The original folder was restored byte-for-byte from the baseline. Its `.gitignore` was rewritten to the original 548-byte content, and the added `.git`/`node_modules` were removed.
- ⚠️ The baseline commit on GitHub contains the **new** `.gitignore`, not the original one. Harmless, but note it if anyone compares.
- ⚠️ The original project has **no LICENSE**. Fine in a private repo, but the owner should confirm their agreement with the original developer before ever making it public.

### Security (all ✅ in code; verified with unit tests, not yet by live HTTP requests)
| Original problem (verified in source) | Fix |
|---|---|
| `GET /api/orders` returned every customer's name, address, phone, e-mail and notes to anyone | Admin session required (`requireAdmin`). |
| Admin pages public | `proxy.js` gate, **plus** server-side session check in `app/admin/(panel)/layout.js`, **plus** `requireAdmin` in every admin API handler. |
| Products POST/PUT/DELETE, content POST, upload POST unauthenticated | All require admin session + same-origin `Origin` header for writes (CSRF), cookie is `HttpOnly`, `SameSite=Strict`, `Secure` in production, 8 h expiry, HMAC-SHA256 signed. |
| No hardcoded credentials allowed | Credentials only from env; admin fails closed if unset. Password compared via HMAC, constant-time. Login rate-limited (5 / 15 min / IP). |
| Server trusted browser prices and totals (0 RSD items possible) | `lib/orders.js` rebuilds every line from catalog + `lib/pricing.js`; client price/title/image ignored; unknown fields dropped. |
| No dimension validation (0, 99999, 5000 cm accepted) | Whole-cm integers within per-product limits, enforced client- and server-side. |
| HTML injection into order/contact e-mails | All values escaped (`escapeHtml`). |
| Upload accepted any file into `public/uploads` (stored XSS risk) | Admin only; JPG/PNG/WebP detected from magic bytes; 5 MB cap; random filename; stored in `data/uploads`, served by a route with `nosniff`. |
| Admin content POST saved arbitrary JSON | Field whitelist + length/format validation (Instagram must be https). |
| No security headers, `x-powered-by` exposed | CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS; `poweredByHeader: false`. |
| Spam / abuse | Per-IP rate limits (orders 5/10 min, contact 5/10 min, quote 60/min — best effort, per instance), honeypot field, body-size caps. |
| CSV export injection (new feature) | Cells starting with `= + - @` are prefixed. |

### Architecture and data
- ✅ **One product model.** The two overlapping systems (15 emoji "API products" with prices that affected nothing, and ~197 image designs reached via `?img=&title=` URLs that let anyone change the title in the cart) are replaced by:
  - `lib/catalog.js` + generated `data/designs.json` (categories → collections → designs), and
  - `lib/pricing.js` as the **only** source of prices, used by configurators, cart, and server.
  - Admin-managed **fixed-price products** (`products.json`) are kept as an optional extra product type (`category: "proizvod"`), priced server-side from the file.
- ✅ **Pricing rules preserved unchanged** from the original configurators: wallpaper 700/900/1100 RSD/m², installation 500 RSD/m² + 2 000 RSD call-out below 20 m²; stickers 1 500/2 200/2 800 RSD/m², contour cut +400/m², minimum 1 000 RSD; canvas presets per layout (1/3/5 panels) with fixed prices, custom = area × rate + base, rounded to 100 RSD; plexiglass 90×100 = 8 260, 105×117 = 10 500, 120×134 = 12 800; sticker printing 0,35 RSD/cm² × pieces, +2 RSD/pc individual packaging.
- ✅ Cart stores configuration only. Prices are always recomputed. The old `printshop_cart` key is cleared (it carried client prices). Identical configurations merge.
- ✅ Checkout shows **server-quoted** totals (`/api/orders/quote`) before submitting.
- ✅ Content is read on the server (no more 2–3 client fetches of `/api/content` per page; `ThemeProvider` removed).
- ✅ Admin no longer inherits storefront chrome (route groups `(shop)` vs `admin`).
- ✅ Storage writes are atomic and fail **explicitly** on read-only filesystems. An order is accepted if it was either stored **or** e-mailed. It fails with a clear message (call/e-mail us) only if both fail.
- ✅ Removed (in the copy): old `app/category/*`, `app/product/*` configurators, old cart/checkout/contact/admin pages, all old `components/*`, `ThemeProvider`, `ProductSlider`, `DropdownMenu`, `MenuData`, `menu.css`, `menu-schema.json`, `layout-home.js`, `data/mockProducts.js`, `seed-products.mjs`, `app/favicon.ico` (replaced by `app/icon.png`). All are recoverable from the baseline commit.

### URLs and redirects (✅)
| Old | New |
|---|---|
| `/category/tapete`, `/category/tapete/:sub` | `/tapete`, `/tapete/:sub` (308) |
| `/category/zidni_stikeri[/:sub]` | `/zidni-stikeri[/:sub]` |
| `/category/slike_na_platnu` | `/slike-na-platnu` |
| `/category/slike_na_pleksiglasu`, `/category/izrada_nalepnica` | `/slike-na-pleksiglasu`, `/izrada-nalepnica` |
| any other `/category/*` | `/` |
| `/product/tapeta?img=…`, `/product/stiker?img=…`, `/product/slika-na-platnu?img=…` | matching design page (looked up by image), else the category |
| `/product/tapeta-1…10`, `platno-1`, `stiker-1/2` | matching design page (mapped by image) |
| `/product/nalepnica-1`, `/product/pleksiglas-1` | `/izrada-nalepnica`, `/slike-na-pleksiglasu` |
| `/privacy`, `/terms` | `/politika-privatnosti`, `/uslovi-koriscenja` |

New design URLs: `/tapete/{collection}/{slug}` (e.g. `/tapete/cvetne/cvetna-tapeta-09`), `/zidni-stikeri/{collection}/{slug}`, `/slike-na-platnu/motiv-NN`. Slugs use the image's file number, so they stay stable if other files are removed. `/cart`, `/checkout`, `/contact` were deliberately kept unchanged.

### Visual design (✅ implemented; ⬜ not yet reviewed in a browser)
Direction: **"elevation drawing / pattern book"**. The site reads like an interior-architecture catalogue built from the logo's own palette. The one signature device is the **architectural dimension line** (gold hairline with end ticks and a `300 cm` label). It is used around the hero wall and around the live preview in the configurators, where it updates as the customer types. Everything else stays quiet.

Design tokens (`app/globals.css`, Tailwind v4 `@theme`):

| Token | Value | Use / contrast |
|---|---|---|
| `paper` | `#f9f0e5` | Page ground, sampled from the logo background |
| `board` | `#efe4d4` | Sample boards, quiet panels |
| `field` | `#fffcf7` | Inputs, selected options |
| `ink` | `#1c3436` | Text (11.7:1 on paper) |
| `ink-2` | `#4d5f5e` | Secondary text (6.0:1) |
| `teal` / `teal-deep` | `#2f6466` / `#234c4d` | Actions (white text 6.7:1) |
| `gold` | `#9c7a3a` | Dimension lines, hairline accents (3.5:1, non-text) |
| `line` | `#d9c9b3` | Decorative separators |
| `edge` | `#8c8273` | Form control borders (3.35:1) |
| `error` | `#a13a2c` | Errors (5.9:1) |

- Type: EB Garamond 400/500 (+italic) for headings; Schibsted Grotesk 400/500/600 for UI and body. Fluid scale classes `.t-hero .t-page .t-section .t-title .t-lead .t-small .t-micro`; `.tabular` for prices and measurements (no monospace).
- Components: `.btn` (+`-primary/-secondary/-quiet/-block`), `.link`, `.field/.label/.hint/.error-text/.input`, `.unit-input` (cm suffix), `.choice` (real radio/checkbox inside a label), `.dim/.dim-h/.dim-v`, `.board` (designs mounted **uncropped** on a square board), `.notice-*`, `.skeleton`, `.sheet` dialog, `.skip-link`. 3px control radius, flat surfaces, hairlines instead of shadows, no gradients, no glass, no blur.
- Logo: globe mark cropped from `public/logoZaSajt.jpeg` → `public/brand/mark.webp`, with the lowercase wordmark set in EB Garamond, mirroring the logo.
- Hero wall uses **Mermerna tapeta 12** (teal onyx), drawn in the image's own proportions (300 × 160 cm), so nothing is cropped. The caption shows a real computed price example.
- Avoided on purpose: eyebrow labels, ALL-CAPS labels, numbered sections (except the genuinely sequential "Kako poručiti" steps), identical icon cards, emoji, gradient text, `→` appended to links, monospace labels.

### UX / pages (✅ implemented)
- **Header**: sticky, solid paper background. Desktop category nav with `aria-current`, Kontakt, Korpa with count. Mobile: cart + "Meni" opening a native `<dialog>` sheet (focus trap, Esc, backdrop click, closes on navigation, body scroll locked). Optional CMS announcement bar. Skip link.
- **Homepage**: elevation hero (CMS headline/subtitle/button) → category index list (thumbnail, summary, price teaser computed from pricing rules) → 8 hand-picked designs → "Kako poručiti" 4 steps → "Imate svoj motiv?" band (keeps the existing Shutterstock-gallery offer) → FAQ with native `<details>` → footer. LocalBusiness JSON-LD using the address and phone already published on the site.
- **Category pages**: H1, intro, per-m² rate table (from pricing rules), collection grid; canvas shows all 25 motifs; plexiglass and sticker printing show their configurator next to a line-drawing placeholder (no product photography exists).
- **Collection pages**: count, rate table, grid of designs as real `<Link>`s (keyboard-, crawler- and new-tab-friendly; the old `div onClick` is gone).
- **Design pages**: breadcrumbs, H1, configurator, "Još iz kolekcije". Viewer toggles "Ceo dizajn" (full, uncropped) / "Na zidu" or "Dimenzije" or "Raspored" (dimensioned preview), and has an "Uvećaj" lightbox (`<dialog>`, Esc closes).
- **Configurators**: native radios styled as option rows, whole-cm inputs with range hints, errors after blur or submit, focus moves to the first invalid field, itemised price breakdown whose total always equals the sum of lines, and a total + "Dodaj u korpu" bar that sticks to the bottom on mobile. Adding to the cart shows an inline confirmation with a "Pregledaj korpu (n)" link instead of forcing a redirect.
  - Wallpaper: material, width/height (50–1500 / 50–600 cm), installation with an explained call-out fee and the original note about extra travel costs outside Belgrade.
  - Wall sticker: foil, 10–300 cm, contour cut, minimum price.
  - Canvas: layout glyphs (1/3/5), presets with fixed prices, custom size (30–300 × 20–200 cm), edge style. The preview splits a single optimised image into panels with overlay gaps (the old card loaded 5 full-size `<img>` per motif).
  - Plexiglass: size, optional motif note, quantity, and instructions to e-mail the photo with the order number.
  - Sticker printing: size, quantity tiers + a working custom quantity (50–10 000), material, cut, packaging, design option, lead time, note, per-piece price. The broken "Start Design" button was removed.
- **Cart**: thumbnails, full configuration per line, quantity stepper (1–99), remove with **undo**, invalid-line handling, summary, empty state, loading skeleton.
- **Checkout**: empty cart cannot reach the form; labelled fields with autocomplete; blur validation; a focusable error summary linking to fields; honeypot; submit loading state; server errors shown inline (no `alert()`); server-quoted summary; success screen with order number and how to send design files.
- **Contact**: contact details (tel/mailto/WhatsApp/Viber/Instagram), validated form with the same error pattern; on failure it offers the direct e-mail.
- **404**: Serbian, with category links. **Legal pages**: structure only, see §8.
- **Admin**: login; dashboard with real counts (the old hardcoded "1,284 orders / 8.4M RSD / 24 products" is gone); orders table with search, status filter, expandable details, status change, CSV export (the old buttons did nothing). Works with old-format orders.

### SEO (✅)
- Unique titles (`%s | PLANETATAPETA` template) and descriptions per category, collection and design; canonical URLs; Open Graph (design image on design pages; default OG image from the logo).
- `lang="sr-Latn"`, one H1 per page, crawlable links everywhere, server-rendered content (the homepage H1 and products are in the HTML; previously they were client-fetched).
- `sitemap.xml` (home, categories, collections, 197 designs, fixed products, contact). `robots.txt` disallows `/admin`, `/api/`, `/cart`, `/checkout`. Cart, checkout, admin, 404 and legal placeholders are `noindex`.
- JSON-LD: LocalBusiness (home), CollectionPage (categories), BreadcrumbList (all crumbs), Product + Offer on design pages. Offers use only real data: per-m² `UnitPriceSpecification` (MTK) for wallpaper and stickers, and `AggregateOffer` over preset prices for canvas. No ratings, reviews or availability were invented.
- Copy fixed: diacritics ("Oživite" etc.), "Gradski pejzaži and" → Serbian, "Grad/Mermer tapete" → "Gradske/Mermerne tapete", "poliptisi" removed, design names "sobu #1" → "Stiker za sobu 01", "Moderna Štamparija" template title removed, consistent "RSD" (no "din").

### Performance (✅ implemented; ⬜ not yet measured)
- 230 pages statically generated (`generateStaticParams`, `dynamicParams = false`). Only APIs, uploads and `/product/[id]` are dynamic. The old site rendered every page per request with `no-store`.
- `next/image` everywhere with `sizes`, AVIF/WebP, lazy loading below the fold, `priority` only on LCP images, intrinsic width/height from the catalog (no CLS).
- No client fetches for page content; client JS limited to the cart, header islands, configurators and forms.
- Fonts self-hosted via `next/font` with `display: swap` and only the weights in use.
- Vercel region `fra1` (the report found `iad1` while visitors connect via Frankfurt).

### Accessibility (✅ implemented; ⬜ not yet audited in a browser)
Semantic landmarks and skip link; visible focus rings (`:focus-visible`); native controls (radio/checkbox/`<dialog>`/`<details>`); every input has a `<label>` with `aria-describedby` hints/errors and `aria-invalid`; error summary with `role="alert"` and focus; `aria-live`/`role="status"` for the price, cart and add-to-cart confirmation; `aria-current` in nav and breadcrumbs; 44–48 px touch targets; 16 px inputs (no iOS zoom); `prefers-reduced-motion` respected; contrast verified numerically (table above); decorative images `alt=""`, meaningful images described.

---

## 3. Original requirements and design direction (keep honouring these)

From the owner's brief (condensed, nothing dropped that affects decisions):

- **Premium editorial e-commerce**: interior-design catalogue / architectural publication / curated European design store. *Not* a SaaS landing page, Tailwind showcase or tech company.
- **No AI slop**: no glassmorphism, frosted glass, backdrop blur, translucent panels, excessive gradients, neon, glows, decorative blobs, purple/blue schemes, over-rounded cards, pills everywhere, heavy shadows, repetitive bento grids, floating cards, gradient headline text, generic oversized heroes, unnecessary icons or illustrations, excessive animation, parallax, artificial whitespace, generic slogans, or repetitive section compositions. Prefer typography over decoration, composition over effects, product imagery over illustration, restrained colour, subtle borders.
- **Mobile-first and fully responsive**: test at 320, 375, 390, 768, 1024 and 1440 px plus intermediate widths; no horizontal overflow, clipped nav or overlap; touch-friendly; CSS over JS for responsiveness.
- **UX**: the whole journey must be frictionless: understand the offer → find a category → browse designs → understand options → configure → see the correct price → add to cart → review → order. Clear feedback, labels, progressive disclosure, error prevention, useful loading/empty/success/error states, keyboard and touch support.
- **Keep Next.js**. KISS / SRP / DRY / pragmatic SOLID; no new database, CMS or backend without clear justification; simplify rather than rebuild.
- **Security and data integrity have the highest priority**: server-side auth, server-side pricing, validated input and uploads, protected customer data. Never inspect real customer data unnecessarily, never submit real production orders, never deploy.
- **SEO**: Metadata API, canonical URLs, OG, sitemap, robots, structured data with **only accurate** information, Serbian Latin throughout, no exaggerated copy.
- **Performance**: real, measured improvements (LCP, CLS, INP); Server Components by default.
- **Accessibility**: WCAG 2.2 AA.
- **Preserve business functionality and rules**: do not invent pricing, delivery, payment, legal text, addresses, reviews or ratings. Document missing business information instead.
- **Shutterstock assets**: never remove, hide or modify watermarks; do not assume they are licensed; list what needs replacing; no AI-generated or unrelated stock images; use honest placeholders where photography is missing.
- **Git**: dedicated `redesign` branch, focused commits, clear messages, push to the new repo, no force-push, never touch the original developer's repo. Commit trailer used in this project: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (use your own model's trailer if your environment specifies one).
- **Deliverables**: redesigned site, design system, responsive layouts, optimised images, SEO, performance, accessibility, simplified architecture, consistent pricing, documented security fixes or blockers, successful build, **desktop and mobile screenshots**, private repo with commits, README, a summary of changes, and a list of remaining issues.

### The three design skills (use exactly these, no others)

| Skill | Role | Location on this machine | How it was used so far / how to use it next |
|---|---|---|---|
| `frontend-design` (Anthropic plugin) | **Primary design authority**: visual direction, typography, composition, implementation | Plugin skill, invoked as `frontend-design:frontend-design`. It was loaded from the previous account's plugin directory (`~/Library/Application Support/Claude/local-agent-mode-sessions/…/rpm/plugin_…/skills/frontend-design`), which **may not be available to a new account**. If it isn't listed, install the official Anthropic `frontend-design` plugin; don't swap in a different skill without asking the owner. | Used to set the direction in §2. Its key rules: one memorable element and everything else quiet; avoid default typographic tells (eyebrows, ALL-CAPS labels, single accented word, `→` on links, mono labels, middle-dot meta strings); structural devices must encode information; sentence-case, active-voice copy; critique with screenshots. |
| `ui-ux-pro-max` | UX/UI decisions, forms, navigation, accessibility, responsive usability | `~/.claude/skills/ui-ux-pro-max` (CLI: `python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux`) | Its `--design-system` output recommended "Liquid Glass" + Cormorant/Montserrat. That style was **rejected** because it contradicts the brief. It is used only for UX rules: visible labels, error summary + focus, blur validation, 44 px targets, no horizontal scroll, CLS-safe media, predictable nav, breadcrumbs. Run its Quick Reference §1–§3 checklist in the final QA. |
| `impeccable` (v4.8.0) | **Final visual refinement and QA**, on real browser screenshots | `~/.claude/skills/impeccable` (`SKILL.md`, `reference/`, `scripts/impeccable`) | Only `reference/craft-floor.md` has been read and followed so far (bans: eyebrow labels, gradient text, glass, coloured side borders, hard offset shadows, emoji icons; checks: contrast, spacing, type measure, states, themed browser surfaces). **Not yet run for the review pass.** Next session: run `~/.claude/skills/impeccable/scripts/impeccable context` from the project root once, then follow `reference/critique.md` and `reference/polish.md` against actual screenshots at desktop and mobile. |

---

## 4. Findings from the original browser inspection (summary)

The owner provided a browser inspection report of the live site (made with the Claude in Chrome extension). Its findings, and what the source review added:

**Security**: public admin; `GET /api/orders` exposing 25 orders with full personal data; open write endpoints; client-controlled prices; no security headers; `x-powered-by` visible. *Source review confirmed all of these and added:* unescaped customer input in notification e-mails, unrestricted upload type/size into `public/`, and that the original repo **committed `orders.json` with customer data**. On Vercel's read-only filesystem, order **submission probably fails** in production, because `saveOrder` writes to disk before e-mailing (inferred, not tested; no production orders may be submitted). ⚠️ **The live production site still exposes customer data until this redesign (or at least the API auth fix) is deployed. The owner must be told this is urgent.**

**Architecture**: two overlapping product systems; up to four different prices for the same product (homepage, API/admin, product page, checkout); parameter-based configurator URLs allowing arbitrary titles in the cart; every page dynamically rendered with `no-store`; content fetched 2–3× per page in the browser; admin rendered inside the shop layout; hardcoded admin dashboard numbers.

**Functional bugs**: 0-width items at 0 RSD; 99999 cm accepted; stickers said 10–300 cm but accepted 5000; broken images `/slike/slika1.jpg` and `/slike/slika2.jpg` (files were never in `public/`); no cart quantity controls; cart hid the configuration; checkout form shown with an empty cart; `alert()` errors; no order summary; FAQ (online payment) contradicting the absence of a payment step; cart "free delivery" vs a product page "free over 6 000 RSD"; plexiglass "A3" offering 90×100 cm; misleading sticker price breakdown; lightbox not closable with Esc and covered by the header; clickable `div`s; English default 404; template leftovers ("Moderna Štamparija", Cyan/Fuchsia labels, `paperType`); typos; unlabelled form fields; mobile menu button clipped at ≤ 390 px; non-functional customer design upload and "Start Design" button.

**SEO**: no robots, sitemap, canonical, OG or structured data; no H1 in the homepage HTML; admin SEO fields unused; duplicate parameter URLs.

**Performance**: uncached server rendering in the US region; homepage content waiting on 4 API calls; canvas page loading 125 `<img>` (6.95 MB) without lazy loading.

**Accessibility**: 16 unlabelled form controls, placeholders used as labels, non-keyboard gallery tiles, no Esc on overlays.

All of the above are addressed in code (§2), except the items in §8 that need business input or infrastructure.

---

## 5. Key decisions (and why)

1. **Keep Next.js**, simplify within it (the report also recommended this; Astro only pays off with a full rewrite).
2. **Pricing in code (`lib/pricing.js`)**, not editable data: one reviewed, tested, version-controlled source, shared by browser and server. Editable prices need persistent storage first (§8).
3. **Fixed-price products kept** as an admin feature (the original admin could add products customers could buy). The 15 legacy seed products were retired because they duplicated the configurable products with conflicting prices. Their URLs redirect.
4. **Theme-colour editing removed** from the CMS: the design system owns colour, and arbitrary colours break contrast. Hero, announcement, contact and SEO remain editable.
5. **No delivery-cost line** in cart or checkout, because the original site contradicted itself (always free vs free over 6 000 RSD). Neutral copy instead: "Na sajtu se ne plaća karticom. … javljamo vam se radi potvrde i dogovora oko dostave." The "Besplatna dostava za porudžbine preko 6.000 rsd" claim was not carried over.
6. **No online payment invented**. The FAQ payment answer is kept as originally written, pending confirmation.
7. **Customer file upload not built**: it needs object storage (Vercel functions cap request bodies at about 4.5 MB). Customers are told to e-mail files with their order number, which is consistent with the existing FAQ.
8. **Watermarked images shown uncropped** in grids and the hero (sample-board treatment). Only the optional live "on the wall" preview crops to the entered proportions; the full image is always one click away.
9. **Designs showing trademarks or real people are not featured** (see §8) but remain in the catalogue. Removing them is the owner's decision.
10. **Kept `/cart`, `/checkout`, `/contact`** URLs; changed only the category/product URLs, where the SEO case was clear.
11. **Order acceptance rule**: accepted if stored **or** e-mailed (so it works on Vercel with e-mail configured), with an explicit 503 and fallback contact advice otherwise.

---

## 6. Assumptions that need the owner's confirmation

The original code had no rule for these, so conservative values were chosen. They are marked `ASSUMPTION` in `lib/pricing.js`:
- Wallpaper size limits 50–1500 cm wide, 50–600 cm high.
- Canvas custom size limits 30–300 × 20–200 cm.
- Sticker printing size limits 1–100 cm; custom quantity 50–10 000.
- Sticker printing rate **0,35 RSD/cm²** — the original code itself called this "fiktivna" (provisional).
- No surcharge for "Hitna izrada" or for design help (the original showed 0,00 RSD for both).
- Wallpaper totals use per-line rounding (can differ by ±1 RSD from the old single rounding).
- Sticker printing totals are rounded to whole RSD (the original showed decimals).

---

## 7. Verification status (be precise about this)

| Check | Status |
|---|---|
| `npm test` (18 tests: pricing rules, dimension rejection, option whitelisting, auth tokens, CSRF guard, validation, HTML escaping) | ✅ passing |
| `next build` | ✅ passed **before** the admin pages were added. ⬜ Re-run now (admin dashboard, login, orders and AdminNav were added afterwards). |
| `npm run lint` | ⬜ not run on the new code |
| Dev server / browser rendering | ⬜ **nothing has been viewed in a browser yet** |
| Responsive checks (320–1440 px), keyboard, screen-reader spot checks | ⬜ |
| Live HTTP checks (e.g. `GET /api/orders` → 401, redirects 308, headers present) | ⬜ |
| Lighthouse / Core Web Vitals measurements | ⬜ (do not claim improvements until measured) |
| `impeccable` critique and polish on screenshots | ⬜ |
| Screenshots of key pages (desktop + mobile) for the owner | ⬜ |

---

## 8. Remaining work

### To build (in order)
1. ⬜ **Admin › Proizvodi i cene** (`app/admin/(panel)/products/page.js`): list/add/edit/delete fixed-price products via `/api/products` (fields: title, category from `CATEGORIES`, integer price, description, image via `/api/upload` → `/uploads/<hex>.ext`), with confirm-before-delete, plus a **read-only price list** rendered from `PRICING` so staff can see the authoritative prices. The folder exists and is empty; the nav already links to it.
2. ⬜ **Admin › Sadržaj sajta** (`app/admin/(panel)/content/page.js`): form for `hero.title/subtitle/buttonText`, `header.announcement`, `contact.*`, `seo.title/description`; POST to `/api/content`; show `fieldErrors` keyed `section.field`; success message (no `alert()`). The folder exists and is empty.
3. ⬜ `.env.example` (variables in §1, no real values) and a full **README.md** (overview, stack, setup, commands, env, build, tests, deployment notes incl. Vercel read-only storage, catalog script). The README is still the create-next-app default.
4. ⬜ Re-run `npm run build`, `npm run lint`, `npm test`; fix anything found.
5. ⬜ Run the dev server and **review every page in the browser** (Claude's built-in browser pane) at 320/375/390/768/1024/1440 px: home, categories, collections, design pages (all 3 configurator types), plexiglass, sticker printing, cart (empty/filled/undo), checkout (errors, success — **locally only**), contact, 404, admin (login, dashboard, orders). Check the console and network.
6. ⬜ Known small fixes spotted while writing, not yet done:
   - `CartView`: when the last item is removed, the empty `<ul>` with its top border still renders; render the list only when `items.length > 0`.
   - `LoginForm` uses `useSearchParams`; wrap it in `<Suspense>` if the build complains.
   - Confirm the vertical `.dim-v` label renders bottom-to-top correctly in Safari/Chrome.
   - Confirm `.choice` overrides (`flex-col items-start`) in the canvas layout picker now apply (component classes were moved into `@layer components` for this).
7. ⬜ **`impeccable` pass** on screenshots (critique → polish), then fix and re-check. Ask the brief's questions: generic? intentional typography? balanced? product imagery dominant? credible and premium? mobile genuinely designed?
8. ⬜ Verify security live with `curl` against `npm start`: `/api/orders` GET → 401; products/content/upload writes → 401 unauthenticated and 403 cross-origin; headers present; old URLs → 308 to the right places; `/admin` → login redirect.
9. ⬜ Measure performance (Lighthouse in the browser pane, or `next build` output) and report actual numbers.
10. ⬜ Screenshots for the owner, then commits (§9) and push `redesign`. Ask the owner whether to open a PR or merge into `main`. **Do not deploy.**

### Blockers and business decisions (document; do not invent)
- **Persistent storage on Vercel**: orders, admin edits and uploads cannot be saved on Vercel's read-only filesystem. Options: Vercel Postgres/Neon, Supabase, Vercel Blob/KV, or hosting on a VPS. Until then, production orders rely on e-mail delivery (`EMAIL_USER`/`EMAIL_PASS` must be set).
- **Credentials to set** in Vercel: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `NEXT_PUBLIC_SITE_URL`.
- **Urgent for production**: the live site still exposes customer data via `GET /api/orders`, and the original repo contains `orders.json`. Remediation needs a deploy (owner's decision) and cleaning that data out of the original repository's history (owner and original developer).
- **Image licensing**: all ~197 design images are watermarked Shutterstock *previews* (watermark plus an ID strip). Licensed files or the business's own photos are needed. The duplicate source folder `Slike shutterstock/` stays in the original project only.
- **Trademark / personality rights**: `zidni-stikeri` designs include the Real Madrid crest, a Messi/FC Barcelona shirt, a Cristiano Ronaldo portrait and Lamborghini cars (`stikeri/decije/stikerDeca10`–`stikerDeca15`). Only the first 8 images of each sticker set were reviewed; check the rest too. These need a legal decision (remove, or license separately).
- **Product photography** missing for plexiglass and sticker printing (line-drawing placeholders in use).
- **Legal texts**: privacy policy (ZZPL) and terms of sale (Zakon o zaštiti potrošača; distance-selling information, withdrawal rules for made-to-measure goods, complaints). The pages show structure only, are `noindex`, and checkout currently has no consent checkbox.
- **Business rules to confirm**: §6 assumptions; delivery pricing; payment method (the FAQ says "putem interneta"); whether "Hitna izrada" and design help cost extra; contact e-mail (`djoletodorovic20@gmail.com` is published as the business contact) vs the order inbox (`planetatapeta20@gmail.com`).
- **Domain** for `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, JSON-LD).
- **Customer file upload** (needs object storage; see decision 7).
- **Licence/ownership** of the original source (no LICENSE file).

---

## 9. Suggested commits for the current uncommitted work

On branch `redesign`, from `~/Desktop/planetatapeta-website`:

1. `Secure APIs and admin: server-side auth, validation, escaped e-mails, safe uploads` — `lib/auth.js`, `lib/security.js`, `lib/validation.js`, `lib/mail.js`, `lib/uploads.js`, `lib/db.js`, `app/api/**`, `app/uploads/**`, `proxy.js`, `next.config.mjs`, `vercel.json`, `.gitignore`, `tests/auth-and-validation.test.mjs`
2. `Single product model and authoritative server-side pricing` — `lib/pricing.js`, `lib/catalog.js`, `lib/orders.js`, `lib/format.js`, `scripts/build-catalog.mjs`, `data/designs.json`, `data/database/products.json`, `tests/pricing.test.mjs`, `package.json`, `package-lock.json`
3. `Redesign storefront: design system, catalog pages, configurators, cart and checkout` — `app/globals.css`, `app/layout.js`, `app/(shop)/**`, `app/not-found.js`, `components/**` (except admin), `lib/site.js`, `lib/faq.js`, `data/database/content.json`, `public/brand/`, `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.jpg`, and the removal of the old pages/components
4. `SEO: sitemap, robots, canonical URLs, structured data` — `app/sitemap.js`, `app/robots.js` (if not already included above)
5. `Admin: login, dashboard and order management` — `app/admin/**`, `components/admin/**`
6. `Add handoff notes` — this file

Each commit ends with the trailer from §3. Push with `git push -u origin redesign` (never `--force`).

---

## 10. Working conventions for the next session

- Serbian Latin for all customer-facing copy; plain, specific language; no marketing filler; "RSD" for currency; `sr-RS` number formatting.
- Never read customer order values unless strictly necessary; never submit orders to production; never deploy; never push to or modify the original developer's repository.
- Keep changes small and reviewable; match the existing code style (2-space indent, double quotes, short explanatory comments only where intent isn't obvious).
- New prices or options go **only** in `lib/pricing.js`, with a test in `tests/pricing.test.mjs`.
- After adding or removing design images, run `npm run catalog` and commit `data/designs.json`.
- When unsure about a business rule, legal text or ownership question, ask the owner instead of inventing an answer.
