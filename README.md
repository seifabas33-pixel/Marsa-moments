# 🌊 Marsa Moments

A minimalist, editorial-style website for selling **Red Sea excursions in Marsa Alam, Egypt** — built to turn visitors into leads.

Swim with wild dolphins, drift over sea turtles, dive the legendary Elphinstone, and roam the desert under the stars. Marsa Moments presents a curated collection of experiences with a clean, distinctive design, **bilingual English/Arabic**, live **currency switching**, individual **SEO tour pages**, and a friction-free way to enquire.

## ✨ Features

- **Curated excursion collection** — 12 real Marsa Alam trips (durations, pricing, highlights, "what's included"), filterable by category, with a quick-view detail modal.
- **Bilingual EN / AR** with full right-to-left (RTL) support and an Arabic (Cairo) typeface. Choice is remembered across visits and pages.
- **Live currency switcher** — USD / EUR / EGP, converted from a single price source and remembered.
- **Lead-capture form** with validation. Posts to a backend when configured (Formspree or any endpoint), and always offers a WhatsApp hand-off pre-filled with the full enquiry.
- **WhatsApp everywhere** — floating button, nav, form and footer deep-link to a pre-filled chat (localised per language).
- **Individual tour pages + SEO** — a static, crawlable page per excursion with unique `<title>`/meta, canonical + `hreflang`, Open Graph, and **JSON-LD structured data** (`TouristTrip` + `Offer`). Plus `sitemap.xml`, `robots.txt`, and homepage `TravelAgency` structured data.
- **Unique minimalist design** — Red Sea palette, large editorial typography (Fraunces + Inter), scroll reveals, mobile menu, responsive, `prefers-reduced-motion` friendly.
- **Deploys to GitHub Pages** via an included Actions workflow — no server needed.

## 📁 Structure

```
Marsa-moments/
├── index.html              # Homepage
├── tours/<id>.html         # Generated SEO tour pages (built)
├── sitemap.xml, robots.txt # Generated
├── styles/main.css         # Design system, RTL, tour + switcher styles
├── scripts/
│   ├── data.js             # Excursions (EN/AR) + site config   ← edit this
│   ├── i18n.js             # UI strings (EN/AR) + currency engine
│   ├── main.js             # Homepage runtime
│   ├── tour.js             # Tour-page runtime
│   └── build.js            # Generates tours/, sitemap.xml, robots.txt
├── .github/workflows/deploy.yml  # GitHub Pages deployment
└── .nojekyll
```

## 🚀 Run locally

```bash
python3 -m http.server 8000    # then open http://localhost:8000
```

## 🛠 Rebuild the tour pages after editing content

The tour pages, sitemap and robots are generated from `scripts/data.js`. After changing excursions, regenerate them:

```bash
node scripts/build.js
```

(The deploy workflow also runs this automatically on every push.)

## ⚙️ Make it yours (before going live)

Everything you need to configure lives in **`scripts/data.js` → `MARSA_CONFIG`**:

```js
var CONFIG = {
  siteUrl: "https://seifabas33-pixel.github.io/marsa-moments", // for canonical/sitemap/OG
  whatsapp: "201000000000",       // ← your real WhatsApp number (digits only, incl. country code)
  email: "hello@marsamoments.com",
  formEndpoint: "",               // ← paste a Formspree URL to store & email leads (see below)
  currency: { rates: { USD: 1, EUR: 0.92, EGP: 49 }, ... } // edit exchange rates any time
};
```

- **Add / edit excursions** in `MARSA_EXCURSIONS` — each has `en` and `ar` content. Then run `node scripts/build.js`.
- **Images** currently hotlink Unsplash for a quick start. Swap in your own Marsa Alam photos for the strongest impression (drop them in `assets/` and update each `img` path), then rebuild.

## 📨 Connecting the lead form to a backend

By default the form validates and forwards the enquiry to WhatsApp — a complete no-server lead flow. To also **store and email** every lead:

1. Create a free form at [Formspree](https://formspree.io) (or use any endpoint that accepts a JSON `POST`).
2. Paste its URL into `formEndpoint` in `scripts/data.js`, e.g. `"https://formspree.io/f/xxxxxxxx"`.

Leads then POST as JSON (name, email, phone, tour, guests, dates, hotel, message, language). If the request fails, the form falls back to the WhatsApp hand-off.

## 🌐 Deploy to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which builds and publishes the site on every push. **One-time setup** in your repository:

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it — the next push (or a manual run from the **Actions** tab → *Deploy Marsa Moments to GitHub Pages* → *Run workflow*) publishes to:

```
https://seifabas33-pixel.github.io/marsa-moments/
```

> **Simplest alternative (no Actions):** Settings → Pages → Source → **Deploy from a branch** → pick this branch and `/ (root)`. The site is fully static with relative paths, so it serves directly.

If you use a different repo name or a custom domain, update `siteUrl` in `scripts/data.js` and rerun `node scripts/build.js` so canonical links and the sitemap match.

---

_Made on the Red Sea coast 🌊_
