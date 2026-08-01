/* ============================================================
   Marsa Moments — individual tour page runtime
   Hydrates chrome + tour content for the active language/currency.
   Static HTML ships English content (crawlable); this swaps to the
   chosen language and formats the price on the client.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.MARSA_CONFIG || {};
  var EX = window.MARSA_EXCURSIONS || [];
  var MM = window.MM;
  var LS_LANG = "mm_lang", LS_CUR = "mm_cur";

  var id = document.body.getAttribute("data-tour-id");
  var x = EX.find(function (e) { return e.id === id; });

  function initialLang() {
    var url = new URLSearchParams(location.search).get("lang");
    if (url && MM.langs.indexOf(url) > -1) return url;
    var s = localStorage.getItem(LS_LANG);
    return (s && MM.langs.indexOf(s) > -1) ? s : (CFG.defaultLang || "en");
  }
  function initialCur() {
    var s = localStorage.getItem(LS_CUR);
    return (s && MM.currencies.indexOf(s) > -1) ? s : ((CFG.currency && CFG.currency.default) || "USD");
  }
  var state = { lang: initialLang(), cur: initialCur() };
  function t(k) { return MM.t(k, state.lang); }

  function waLink(msg) {
    var num = String(CFG.whatsapp || "").replace(/\D/g, "");
    var greet = (CFG.whatsappGreeting && CFG.whatsappGreeting[state.lang]) || "Hi Marsa Moments!";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg || greet);
  }
  function waTripMsg(title) {
    return state.lang === "ar"
      ? 'مرحبًا مرسى مومنتس! أنا مهتم برحلة "' + title + '". هل يمكنكم إرسال التفاصيل؟'
      : 'Hi Marsa Moments! I\'m interested in the "' + title + '" excursion. Could you send me the details?';
  }

  function applyChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = MM.isRTL(state.lang) ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    ["footerWhatsapp", "fabWhatsapp"].forEach(function (fid) {
      var el = document.getElementById(fid); if (el) el.href = waLink();
    });
  }

  function fill(sel, val) { var el = document.querySelector(sel); if (el) el.textContent = val; }

  function renderTour() {
    if (!x) return;
    var c = MM.ex(x, state.lang);

    // Document title / meta stay tour-specific per language
    document.title = c.title + " — Marsa Moments";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", c.short);

    fill('[data-tour="title"]', c.title);
    fill('[data-tour="tag"]', c.tag || "");
    fill('[data-tour="duration"]', c.duration);
    fill('[data-tour="category"]', t("cat." + x.category));
    fill('[data-tour="pickup"]', t("tour.pickup"));
    fill('[data-tour="long"]', c.long);
    fill('[data-tour="price"]', MM.formatPrice(x.priceUSD, state.cur));
    fill('[data-tour="unit"]', t("card.from") + " · " + c.unit);
    fill('[data-tour="includedLabel"]', t("tour.included"));
    fill('[data-tour="highlightsLabel"]', t("tour.highlights"));

    var inc = document.querySelector('[data-tour="includes"]');
    if (inc) inc.innerHTML = c.includes.map(function (i) { return '<li>' + i + '</li>'; }).join("");
    var hi = document.querySelector('[data-tour="highlights"]');
    if (hi) hi.innerHTML = c.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join("");

    var ask = document.querySelector('[data-tour="wa"]');
    if (ask) { ask.href = waLink(waTripMsg(c.title)); ask.textContent = t("tour.ask"); }
    var req = document.querySelector('[data-tour="request"]');
    if (req) req.textContent = t("tour.request");

    // Related cards: swap titles + prices for the active language/currency
    document.querySelectorAll("[data-related-id]").forEach(function (a) {
      var rx = EX.find(function (e) { return e.id === a.getAttribute("data-related-id"); });
      if (!rx) return;
      var rc = MM.ex(rx, state.lang);
      var tt = a.querySelector("[data-related-title]"); if (tt) tt.textContent = rc.title;
      var pp = a.querySelector("[data-related-price]"); if (pp) pp.textContent = MM.formatPrice(rx.priceUSD, state.cur);
      var dd = a.querySelector("[data-related-dur]"); if (dd) dd.textContent = rc.duration;
    });
  }

  /* ---------- Switchers ---------- */
  function buildSwitchers() {
    document.querySelectorAll("[data-switchers]").forEach(function (host) {
      host.innerHTML =
        '<div class="lang-switch" role="group" aria-label="Language">' +
          '<button data-lang="en" type="button">EN</button><button data-lang="ar" type="button">ع</button></div>' +
        '<div class="cur-switch"><select aria-label="Currency">' +
          MM.currencies.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("") +
        '</select></div>';
      host.querySelectorAll("[data-lang]").forEach(function (b) {
        b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
      });
      var sel = host.querySelector("select");
      sel.value = state.cur;
      sel.addEventListener("change", function () { setCur(sel.value); });
    });
    sync();
  }
  function sync() {
    document.querySelectorAll("[data-switchers]").forEach(function (host) {
      host.querySelectorAll("[data-lang]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-lang") === state.lang);
      });
      var sel = host.querySelector("select"); if (sel) sel.value = state.cur;
    });
  }
  function setLang(l) { if (!l || l === state.lang || MM.langs.indexOf(l) < 0) return; state.lang = l; localStorage.setItem(LS_LANG, l); applyChrome(); renderTour(); sync(); }
  function setCur(c) { if (!c || c === state.cur || MM.currencies.indexOf(c) < 0) return; state.cur = c; localStorage.setItem(LS_CUR, c); renderTour(); sync(); }

  /* ---------- Nav / reveals ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () { if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 20); }, { passive: true });
  var burger = document.getElementById("burger"), mm = document.getElementById("mobileMenu");
  if (burger && mm) {
    var toggle = function (o) { burger.classList.toggle("is-open", o); mm.classList.toggle("is-open", o); burger.setAttribute("aria-expanded", String(o)); document.body.style.overflow = o ? "hidden" : ""; };
    burger.addEventListener("click", function () { toggle(!burger.classList.contains("is-open")); });
    mm.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyChrome();
    buildSwitchers();
    renderTour();
    var yr = document.getElementById("year"); if (yr) yr.textContent = new Date().getFullYear();
  });
})();
