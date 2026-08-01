/* ============================================================
   Marsa Moments — static build
   Generates crawlable per-tour pages, sitemap.xml and robots.txt
   from the single source of truth (data.js + i18n.js).

   Run:  node scripts/build.js
   Output is committed so the site deploys with no build step.
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const { CONFIG, EXCURSIONS } = require("./data.js");
const MM = require("./i18n.js");

const ROOT = path.join(__dirname, "..");
const TOURS_DIR = path.join(ROOT, "tours");
const SITE = (CONFIG.siteUrl || "").replace(/\/$/, "");

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const BRAND_SVG =
  '<svg viewBox="0 0 32 32" width="26" height="26" fill="none"><path d="M2 22c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3 3-3 6-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 27c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3 3-3 6-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/><circle cx="16" cy="10" r="4.5" stroke="currentColor" stroke-width="1.6"/></svg>';
const WA_SVG =
  '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.8L7 20.5A10 10 0 1 0 12 2z"/></svg>';

function navHTML() {
  return `
  <header class="nav" id="nav">
    <div class="nav__inner">
      <a href="../index.html" class="brand" aria-label="Marsa Moments home">
        <span class="brand__mark" aria-hidden="true">${BRAND_SVG}</span>
        <span class="brand__text">Marsa<em>Moments</em></span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <a href="../index.html#excursions" data-i18n="nav.excursions">Excursions</a>
        <a href="../index.html#why" data-i18n="nav.why">Why us</a>
        <a href="../index.html#how" data-i18n="nav.how">How it works</a>
        <a href="../index.html#faq" data-i18n="nav.faq">FAQ</a>
      </nav>
      <div class="switchers" data-switchers></div>
      <a href="../index.html#book" class="btn btn--pill nav__cta" data-i18n="nav.cta">Plan my trip</a>
      <button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>
  <div class="mobile-menu" id="mobileMenu">
    <a href="../index.html#excursions" data-i18n="nav.excursions">Excursions</a>
    <a href="../index.html#why" data-i18n="nav.why">Why us</a>
    <a href="../index.html#how" data-i18n="nav.how">How it works</a>
    <a href="../index.html#faq" data-i18n="nav.faq">FAQ</a>
    <div class="switchers switchers--mobile" data-switchers></div>
    <a href="../index.html#book" class="btn btn--pill" data-i18n="nav.cta">Plan my trip</a>
  </div>`;
}

function footerHTML() {
  return `
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <span class="brand brand--footer"><span class="brand__mark" aria-hidden="true">${BRAND_SVG}</span><span class="brand__text">Marsa<em>Moments</em></span></span>
        <p data-i18n="footer.tagline">Curated Red Sea excursions in Marsa Alam, Egypt.</p>
      </div>
      <div class="footer__col">
        <h4 data-i18n="footer.explore">Explore</h4>
        <a href="../index.html#excursions" data-i18n="nav.excursions">Excursions</a>
        <a href="../index.html#why" data-i18n="nav.why">Why us</a>
        <a href="../index.html#faq" data-i18n="nav.faq">FAQ</a>
      </div>
      <div class="footer__col">
        <h4 data-i18n="footer.contact">Get in touch</h4>
        <a id="footerWhatsapp" href="#" target="_blank" rel="noopener" data-i18n="footer.wa">WhatsApp us</a>
        <a href="mailto:${esc(CONFIG.email || "hello@marsamoments.com")}">${esc(CONFIG.email || "hello@marsamoments.com")}</a>
        <a href="../index.html#book" data-i18n="footer.request">Request a plan</a>
        <span class="footer__meta" data-i18n="footer.area">Marsa Alam · Port Ghalib · El Quseir</span>
      </div>
    </div>
    <div class="footer__bar">
      <span>© <span id="year"></span> Marsa Moments. <span data-i18n="footer.rights">All moments reserved.</span></span>
      <span data-i18n="footer.made">Made on the Red Sea coast 🌊</span>
    </div>
  </footer>
  <a class="fab" id="fabWhatsapp" href="#" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_SVG}</a>`;
}

function jsonLD(x) {
  const c = x.en;
  const data = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": c.title,
    "description": c.long,
    "url": `${SITE}/tours/${x.id}.html`,
    "image": x.img,
    "touristType": "Leisure",
    "provider": { "@type": "TravelAgency", "name": "Marsa Moments", "url": SITE + "/" },
    "itinerary": { "@type": "ItemList", "itemListElement": c.highlights.map((h, i) => ({ "@type": "ListItem", "position": i + 1, "name": h })) },
    "offers": {
      "@type": "Offer",
      "price": String(x.priceUSD),
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `${SITE}/tours/${x.id}.html`
    }
  };
  return JSON.stringify(data, null, 2);
}

function relatedHTML(current) {
  const others = EXCURSIONS.filter((e) => e.id !== current.id);
  // pick 3: prefer same category, then fill
  const sameCat = others.filter((e) => e.category === current.category);
  const rest = others.filter((e) => e.category !== current.category);
  const pick = sameCat.concat(rest).slice(0, 3);
  return pick.map((x) => {
    const c = x.en;
    return `
        <a class="rel-card" href="./${x.id}.html" data-related-id="${x.id}">
          <div class="rel-card__media"><img src="${x.img}" alt="${esc(c.title)}" loading="lazy" /></div>
          <div class="rel-card__body">
            <span class="rel-card__dur" data-related-dur>${esc(c.duration)}</span>
            <h3 data-related-title>${esc(c.title)}</h3>
            <span class="rel-card__price" data-related-price>$${x.priceUSD}</span>
          </div>
        </a>`;
  }).join("");
}

function tourPage(x) {
  const c = x.en;
  const url = `${SITE}/tours/${x.id}.html`;
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(c.title)} — Marsa Moments</title>
  <meta name="description" content="${esc(c.short)}" />
  <meta name="theme-color" content="#0a3a3a" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="ar" href="${url}?lang=ar" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Marsa Moments" />
  <meta property="og:title" content="${esc(c.title)} — Marsa Moments" />
  <meta property="og:description" content="${esc(c.short)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${x.img}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@300;400;500;600&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles/main.css" />
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <script type="application/ld+json">
${jsonLD(x)}
  </script>
</head>
<body data-tour-id="${x.id}">
  <div class="ribbon"><span data-i18n="ribbon">Small groups · Licensed guides · Free hotel pickup in Marsa Alam &amp; Port Ghalib</span></div>
  ${navHTML()}

  <main class="tour">
    <nav class="tour__crumb" aria-label="Breadcrumb">
      <a href="../index.html" data-i18n="tour.back">All excursions</a> <span aria-hidden="true">/</span> <span data-tour="title">${esc(c.title)}</span>
    </nav>

    <header class="tour__hero">
      <div class="tour__hero-media"><img src="${x.img}" alt="${esc(c.title)}" /><div class="tour__hero-scrim"></div>
        <span class="tour__hero-tag" data-tour="tag">${esc(c.tag || "")}</span>
      </div>
      <div class="tour__hero-copy">
        <h1 data-tour="title">${esc(c.title)}</h1>
        <div class="tour__meta">
          <span>⏱ <b data-tour="duration">${esc(c.duration)}</b></span>
          <span>🏷 <b data-tour="category">${esc(MM.t("cat." + x.category, "en"))}</b></span>
          <span>🚐 <b data-tour="pickup">${esc(MM.t("tour.pickup", "en"))}</b></span>
        </div>
      </div>
    </header>

    <div class="tour__grid">
      <article class="tour__body">
        <p class="tour__long" data-tour="long">${esc(c.long)}</p>
        <div class="tour__cols">
          <div>
            <h2 data-tour="includedLabel">${esc(MM.t("tour.included", "en"))}</h2>
            <ul class="tour__list" data-tour="includes">${c.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
          </div>
          <div>
            <h2 data-tour="highlightsLabel">${esc(MM.t("tour.highlights", "en"))}</h2>
            <ul class="tour__list tour__list--tags" data-tour="highlights">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          </div>
        </div>
      </article>

      <aside class="tour__card">
        <div class="tour__price"><b data-tour="price">$${x.priceUSD}</b> <span data-tour="unit">${esc(MM.t("card.from", "en"))} · ${esc(c.unit)}</span></div>
        <a class="btn btn--solid btn--full" data-tour="wa" href="#" target="_blank" rel="noopener">${esc(MM.t("tour.ask", "en"))}</a>
        <a class="btn btn--pill btn--full" href="../index.html#book" data-tour="request">${esc(MM.t("tour.request", "en"))}</a>
        <ul class="tour__assure">
          <li data-i18n="book.perk1">Reply within hours, 7 days a week</li>
          <li data-i18n="book.perk2">Free cancellation up to 24h before</li>
          <li data-i18n="book.perk3">Best-price guarantee vs. your hotel desk</li>
        </ul>
      </aside>
    </div>

    <section class="tour__related">
      <h2 class="tour__related-title" data-i18n="tour.other">More Red Sea moments</h2>
      <div class="rel-grid">${relatedHTML(x)}</div>
    </section>
  </main>

  ${footerHTML()}

  <script src="../scripts/data.js"></script>
  <script src="../scripts/i18n.js"></script>
  <script src="../scripts/tour.js"></script>
</body>
</html>
`;
}

/* ---------- sitemap + robots ---------- */
function sitemap() {
  const urls = [SITE + "/"].concat(EXCURSIONS.map((x) => `${SITE}/tours/${x.id}.html`));
  const body = urls.map((u) => {
    const alt =
      `\n    <xhtml:link rel="alternate" hreflang="en" href="${u}"/>` +
      `\n    <xhtml:link rel="alternate" hreflang="ar" href="${u}${u.indexOf("?") > -1 ? "&" : "?"}lang=ar"/>`;
    return `  <url>\n    <loc>${u}</loc>${alt}\n    <changefreq>weekly</changefreq>\n  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}
function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
}

/* ---------- write ---------- */
function main() {
  if (!fs.existsSync(TOURS_DIR)) fs.mkdirSync(TOURS_DIR, { recursive: true });
  EXCURSIONS.forEach((x) => {
    fs.writeFileSync(path.join(TOURS_DIR, x.id + ".html"), tourPage(x));
  });
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap());
  fs.writeFileSync(path.join(ROOT, "robots.txt"), robots());
  console.log(`✓ Generated ${EXCURSIONS.length} tour pages + sitemap.xml + robots.txt`);
}
main();
