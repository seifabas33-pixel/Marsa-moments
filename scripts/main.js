/* ============================================================
   Marsa Moments — runtime
   i18n + currency control, card/modal rendering, lead backend
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.MARSA_CONFIG || {};
  var EXCURSIONS = window.MARSA_EXCURSIONS || [];
  var MM = window.MM;

  var LS_LANG = "mm_lang", LS_CUR = "mm_cur";

  /* ---------- State ---------- */
  function initialLang() {
    var url = new URLSearchParams(location.search).get("lang");
    if (url && MM.langs.indexOf(url) > -1) return url;
    var saved = localStorage.getItem(LS_LANG);
    if (saved && MM.langs.indexOf(saved) > -1) return saved;
    return CFG.defaultLang || "en";
  }
  function initialCur() {
    var saved = localStorage.getItem(LS_CUR);
    if (saved && MM.currencies.indexOf(saved) > -1) return saved;
    return (CFG.currency && CFG.currency.default) || "USD";
  }
  var state = { lang: initialLang(), cur: initialCur() };

  /* ---------- WhatsApp ---------- */
  function waLink(message) {
    var num = String(CFG.whatsapp || "").replace(/\D/g, "");
    var greeting = (CFG.whatsappGreeting && CFG.whatsappGreeting[state.lang]) || "Hi Marsa Moments!";
    var text = encodeURIComponent(message || greeting);
    return "https://wa.me/" + num + "?text=" + text;
  }
  function setWhatsappLinks() {
    var base = waLink();
    ["whatsappLink", "fabWhatsapp", "footerWhatsapp"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = base;
    });
  }

  /* ---------- Apply translations to static DOM ---------- */
  function t(key) { return MM.t(key, state.lang); }

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = MM.isRTL(state.lang) ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });

    var title = document.querySelector("title");
    if (title) title.textContent = t("meta.title");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.desc"));
  }

  /* ---------- Cards ---------- */
  var grid = document.getElementById("grid");

  function cardHTML(x) {
    var c = MM.ex(x, state.lang);
    return '' +
      '<a class="card reveal" href="tours/' + x.id + '.html" data-category="' + x.category + '" data-id="' + x.id + '" aria-label="' + c.title + '">' +
        '<div class="card__media">' +
          '<img src="' + x.img + '" alt="' + c.title + '" loading="lazy" />' +
          (c.tag ? '<span class="card__tag">' + c.tag + '</span>' : '') +
        '</div>' +
        '<div class="card__body">' +
          '<div class="card__meta"><span>' + c.duration + '</span><span class="card__dot"></span><span>' + t("cat." + x.category) + '</span></div>' +
          '<h3 class="card__title">' + c.title + '</h3>' +
          '<p class="card__short">' + c.short + '</p>' +
          '<div class="card__foot">' +
            '<div class="card__price"><b>' + MM.formatPrice(x.priceUSD, state.cur) + '</b><span>' + t("card.from") + ' · ' + c.unit + '</span></div>' +
            '<span class="card__cta">' + t("card.view") + ' →</span>' +
          '</div>' +
        '</div>' +
      '</a>';
  }

  var currentFilter = "all";
  function renderGrid(filter) {
    if (!grid) return;
    currentFilter = filter || currentFilter;
    var items = (currentFilter && currentFilter !== "all")
      ? EXCURSIONS.filter(function (x) { return x.category === currentFilter; })
      : EXCURSIONS;
    grid.innerHTML = items.length
      ? items.map(cardHTML).join("")
      : '<p class="grid__empty">' + t("card.empty") + '</p>';
    observeReveals();
  }

  /* ---------- Filters ---------- */
  var filters = document.getElementById("filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      filters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      renderGrid(chip.getAttribute("data-filter"));
    });
  }

  /* ---------- Tour <select> ---------- */
  function fillTourSelect() {
    var sel = document.getElementById("tour");
    if (!sel) return;
    var chosen = sel.value;
    sel.innerHTML = '<option value="' + t("form.tourAny") + '">' + t("form.tourAny") + '</option>';
    EXCURSIONS.forEach(function (x) {
      var c = MM.ex(x, state.lang);
      var opt = document.createElement("option");
      opt.value = c.title; opt.textContent = c.title;
      sel.appendChild(opt);
    });
    if (chosen) sel.value = chosen;
  }

  /* ---------- Modal ---------- */
  var modal = document.getElementById("modal");
  var modalBody = document.getElementById("modalBody");
  var lastFocused = null;

  function openModal(id) {
    var x = EXCURSIONS.find(function (e) { return e.id === id; });
    if (!x || !modal) return;
    var c = MM.ex(x, state.lang);
    lastFocused = document.activeElement;

    modalBody.innerHTML = '' +
      '<div class="modal__hero"><img src="' + x.img + '" alt="' + c.title + '" />' +
        (c.tag ? '<span class="modal__hero-tag">' + c.tag + '</span>' : '') + '</div>' +
      '<div class="modal__content">' +
        '<h2 class="modal__title" id="modalTitle">' + c.title + '</h2>' +
        '<div class="modal__meta">' +
          '<span>⏱ <b>' + c.duration + '</b></span>' +
          '<span>🏷 <b>' + t("cat." + x.category) + '</b></span>' +
          '<span>🚐 <b>' + t("tour.pickup") + '</b></span>' +
        '</div>' +
        '<p class="modal__long">' + c.long + '</p>' +
        '<div class="modal__cols">' +
          '<div><h4>' + t("tour.included") + '</h4><ul class="modal__list">' + c.includes.map(function (i) { return '<li>' + i + '</li>'; }).join("") + '</ul></div>' +
          '<div><h4>' + t("tour.highlights") + '</h4><ul class="modal__list modal__list--tags">' + c.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join("") + '</ul></div>' +
        '</div>' +
        '<div class="modal__actions">' +
          '<div class="modal__price"><b>' + MM.formatPrice(x.priceUSD, state.cur) + '</b> <span>' + t("card.from") + ' · ' + c.unit + '</span></div>' +
          '<a class="btn btn--solid" href="' + waLink(waTripMsg(c.title)) + '" target="_blank" rel="noopener">' + t("tour.ask") + '</a>' +
          '<button class="btn btn--pill" data-book="' + c.title + '">' + t("tour.request") + '</button>' +
          '<a class="btn btn--ghost btn--dark" href="tours/' + x.id + '.html">' + t("tour.overview") + ' →</a>' +
        '</div>' +
      '</div>';

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }
  function waTripMsg(title) {
    return state.lang === "ar"
      ? 'مرحبًا مرسى مومنتس! أنا مهتم برحلة "' + title + '". هل يمكنكم إرسال التفاصيل؟'
      : 'Hi Marsa Moments! I\'m interested in the "' + title + '" excursion. Could you send me the details?';
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (card) { e.preventDefault(); openModal(card.getAttribute("data-id")); }
    });
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeModal();
      var bookBtn = e.target.closest("[data-book]");
      if (bookBtn) {
        closeModal();
        var sel = document.getElementById("tour");
        if (sel) sel.value = bookBtn.getAttribute("data-book");
        var book = document.getElementById("book");
        if (book) book.scrollIntoView({ behavior: "smooth" });
        setTimeout(function () { var n = document.getElementById("name"); if (n) n.focus(); }, 600);
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  /* ---------- Lead form ---------- */
  var form = document.getElementById("leadForm");
  if (form) {
    var showError = function (name, msg) {
      var input = form.querySelector('[name="' + name + '"]');
      var err = form.querySelector('.error[data-for="' + name + '"]');
      if (input) input.classList.toggle("is-invalid", !!msg);
      if (err) err.textContent = msg || "";
    };
    var validate = function () {
      var ok = true;
      var name = form.name.value.trim(), email = form.email.value.trim(), phone = form.phone.value.trim();
      if (!name) { showError("name", t("form.err.name")); ok = false; } else showError("name", "");
      if (!email) { showError("email", t("form.err.emailReq")); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("email", t("form.err.emailBad")); ok = false; }
      else showError("email", "");
      if (phone && !/^[+()\d\s-]{6,}$/.test(phone)) { showError("phone", t("form.err.phone")); ok = false; } else showError("phone", "");
      return ok;
    };
    ["name", "email", "phone"].forEach(function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      if (el) el.addEventListener("input", function () { if (el.classList.contains("is-invalid")) validate(); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var data = {
        name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
        tour: form.tour.value, guests: form.guests.value, dates: form.dates.value.trim(),
        hotel: form.hotel.value.trim(), message: form.message.value.trim(),
        _language: state.lang, _source: "Marsa Moments website"
      };

      var summary =
        "New trip request via Marsa Moments%0A" +
        "— Name: " + data.name + "%0A" +
        "— Guests: " + data.guests + "%0A" +
        "— Excursion: " + data.tour + "%0A" +
        (data.dates ? "— Dates: " + data.dates + "%0A" : "") +
        (data.hotel ? "— Hotel: " + data.hotel + "%0A" : "") +
        (data.message ? "— Notes: " + data.message + "%0A" : "") +
        "— Contact: " + data.email + (data.phone ? " / " + data.phone : "");
      var num = String(CFG.whatsapp || "").replace(/\D/g, "");
      var wa = "https://wa.me/" + num + "?text=" + summary;

      var btn = document.getElementById("submitBtn");
      var origText = btn ? btn.textContent : "";
      if (btn) { btn.textContent = t("form.sending"); btn.disabled = true; }

      var finish = function () { showSuccess(data, wa); };
      var fail = function () {
        if (btn) { btn.textContent = origText; btn.disabled = false; }
        showError("email", t("form.err.network"));
      };

      if (CFG.formEndpoint) {
        // Real backend submit (Formspree or any endpoint accepting JSON)
        fetch(CFG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (res.ok) finish(); else fail();
        }).catch(fail);
      } else {
        // No backend configured — capture client-side & hand off to WhatsApp
        setTimeout(finish, 450);
      }
    });

    function showSuccess(data, wa) {
      var success = document.getElementById("formSuccess");
      var successWa = document.getElementById("successWhatsapp");
      var successMsg = document.getElementById("successMsg");
      if (successWa) successWa.href = wa;
      if (successMsg) successMsg.textContent = t("success.msg").replace("{name}", data.name.split(" ")[0]);
      if (success) success.hidden = false;
    }
  }

  /* ---------- Language & currency switchers ---------- */
  function buildSwitchers() {
    document.querySelectorAll("[data-switchers]").forEach(function (host) {
      host.innerHTML =
        '<div class="lang-switch" role="group" aria-label="Language">' +
          '<button data-lang="en" type="button">EN</button>' +
          '<button data-lang="ar" type="button">ع</button>' +
        '</div>' +
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
    syncSwitchers();
  }
  function syncSwitchers() {
    document.querySelectorAll("[data-switchers]").forEach(function (host) {
      host.querySelectorAll("[data-lang]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-lang") === state.lang);
      });
      var sel = host.querySelector("select");
      if (sel) sel.value = state.cur;
    });
  }

  function setLang(lang) {
    if (!lang || lang === state.lang || MM.langs.indexOf(lang) < 0) return;
    state.lang = lang;
    localStorage.setItem(LS_LANG, lang);
    applyI18n(); fillTourSelect(); renderGrid(); setWhatsappLinks(); syncSwitchers();
  }
  function setCur(cur) {
    if (!cur || cur === state.cur || MM.currencies.indexOf(cur) < 0) return;
    state.cur = cur;
    localStorage.setItem(LS_CUR, cur);
    renderGrid(); syncSwitchers();
  }

  /* ---------- Nav / mobile menu ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });

  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    var toggle = function (open) {
      burger.classList.toggle("is-open", open);
      mobileMenu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () { toggle(!burger.classList.contains("is-open")); });
    mobileMenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
  }

  /* ---------- Reveal on scroll ---------- */
  var io;
  function observeReveals() {
    var els = document.querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    els.forEach(function (el) { io.observe(el); });
  }
  function markReveals() {
    document.querySelectorAll(
      ".intro__text, .section-head, .why__item, .step, .quote, .book__copy, .book__form, .faq__item, .cta-final__content"
    ).forEach(function (el) { el.classList.add("reveal"); });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyI18n();
    buildSwitchers();
    setWhatsappLinks();
    fillTourSelect();
    renderGrid("all");
    markReveals();
    observeReveals();
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
