# 🌊 Marsa Moments

A minimalist, editorial-style website for selling **Red Sea excursions in Marsa Alam, Egypt** — built to turn visitors into leads.

Swim with wild dolphins, drift over sea turtles, dive the legendary Elphinstone, and roam the desert under the stars. Marsa Moments presents a curated collection of experiences with a clean, distinctive design and a friction-free way to enquire.

## ✨ Features

- **Curated excursion collection** — 12 real Marsa Alam trips with durations, indicative pricing, highlights and "what's included", filterable by category (Sea & snorkel · Diving · Desert · Culture).
- **Detail modal** for every excursion with a direct "Ask on WhatsApp" and "Request this trip" action.
- **Lead-capture form** with client-side validation and a success state that hands the enquiry straight to WhatsApp, pre-filled with all the details.
- **WhatsApp everywhere** — floating button, nav, form and footer all deep-link to a pre-filled chat.
- **Unique minimalist design** — Red Sea palette, large editorial typography (Fraunces + Inter), asymmetric layout, subtle scroll reveals and micro-interactions.
- **Fully responsive** with a mobile menu, and respects `prefers-reduced-motion`.
- **Zero build step** — plain HTML/CSS/JS. Deploy anywhere.

## 📁 Structure

```
Marsa-moments/
├── index.html          # Page markup & content
├── styles/main.css     # Design system & all styling
├── scripts/
│   ├── data.js         # Excursion catalogue + business config  ← edit this
│   └── main.js         # Rendering, filtering, modal, form logic
└── assets/favicon.svg
```

## 🚀 Run it locally

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## ⚙️ Make it yours (before going live)

Open **`scripts/data.js`** and edit `window.MARSA_CONFIG`:

```js
window.MARSA_CONFIG = {
  whatsapp: "201000000000",   // ← your real WhatsApp number, digits only, incl. country code
  whatsappGreeting: "Hi Marsa Moments! ...",
  email: "hello@marsamoments.com"
};
```

- **Add / edit excursions** in the `MARSA_EXCURSIONS` array (title, category, price, images, includes, highlights).
- **Update the email** in the footer link inside `index.html` (`mailto:`) to match.
- **Images** currently hotlink Unsplash for a quick start — swap in your own photos of Marsa Alam for the strongest impression (place them in `assets/` and update the `img` paths).

## 📨 Connecting the form to a backend (optional)

Right now the form validates and forwards the enquiry to WhatsApp — perfect for a lead-gen MVP with no server. To also store leads or email them, POST the `data` object in `scripts/main.js` (see the `TODO (backend)` marker) to a service like Formspree, Getform, a Google Apps Script, or your own API.

## 🌐 Deploy

Works out of the box on **GitHub Pages, Netlify, Vercel, or Cloudflare Pages** — no configuration needed. For GitHub Pages, enable Pages on this branch and point it at the root.

---

_Made on the Red Sea coast 🌊_
