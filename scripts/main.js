/* ============================================================
   Marsa Moments — interactions
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.MARSA_CONFIG || {};
  const EXCURSIONS = window.MARSA_EXCURSIONS || [];

  /* ---------- WhatsApp helpers ---------- */
  function waLink(message) {
    const num = (CFG.whatsapp || "").replace(/\D/g, "");
    const text = encodeURIComponent(message || CFG.whatsappGreeting || "Hi Marsa Moments!");
    return `https://wa.me/${num}?text=${text}`;
  }

  function setWhatsappLinks() {
    const base = waLink();
    ["whatsappLink", "fabWhatsapp", "footerWhatsapp"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = base;
    });
  }

  /* ---------- Render excursion cards ---------- */
  const grid = document.getElementById("grid");

  function cardHTML(x) {
    return `
      <article class="card reveal" data-category="${x.category}" data-id="${x.id}" tabindex="0" role="button" aria-label="View details for ${x.title}">
        <div class="card__media">
          <img src="${x.img}" alt="${x.title}" loading="lazy" />
          ${x.tag ? `<span class="card__tag">${x.tag}</span>` : ""}
        </div>
        <div class="card__body">
          <div class="card__meta"><span>${x.duration}</span><span class="card__dot"></span><span>${categoryLabel(x.category)}</span></div>
          <h3 class="card__title">${x.title}</h3>
          <p class="card__short">${x.short}</p>
          <div class="card__foot">
            <div class="card__price"><b>$${x.price}</b><span>from · ${x.unit}</span></div>
            <span class="card__cta">View trip →</span>
          </div>
        </div>
      </article>`;
  }

  function categoryLabel(c) {
    return { sea: "Sea & snorkel", dive: "Diving", desert: "Desert", culture: "Culture" }[c] || c;
  }

  function renderGrid(filter) {
    if (!grid) return;
    const items = filter && filter !== "all"
      ? EXCURSIONS.filter((x) => x.category === filter)
      : EXCURSIONS;
    grid.innerHTML = items.length
      ? items.map(cardHTML).join("")
      : `<p class="grid__empty">No excursions in this category yet — check back soon.</p>`;
    observeReveals();
  }

  /* ---------- Filters ---------- */
  const filters = document.getElementById("filters");
  if (filters) {
    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderGrid(chip.dataset.filter);
    });
  }

  /* ---------- Populate the form's tour <select> ---------- */
  (function fillTourSelect() {
    const sel = document.getElementById("tour");
    if (!sel) return;
    EXCURSIONS.forEach((x) => {
      const opt = document.createElement("option");
      opt.value = x.title;
      opt.textContent = x.title;
      sel.appendChild(opt);
    });
  })();

  /* ---------- Modal ---------- */
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modalBody");
  let lastFocused = null;

  function openModal(id) {
    const x = EXCURSIONS.find((e) => e.id === id);
    if (!x || !modal) return;
    lastFocused = document.activeElement;

    modalBody.innerHTML = `
      <div class="modal__hero">
        <img src="${x.img}" alt="${x.title}" />
        ${x.tag ? `<span class="modal__hero-tag">${x.tag}</span>` : ""}
      </div>
      <div class="modal__content">
        <h2 class="modal__title" id="modalTitle">${x.title}</h2>
        <div class="modal__meta">
          <span>⏱ <b>${x.duration}</b></span>
          <span>🏷 <b>${categoryLabel(x.category)}</b></span>
          <span>🚐 <b>Hotel pickup included</b></span>
        </div>
        <p class="modal__long">${x.long}</p>
        <div class="modal__cols">
          <div>
            <h4>What's included</h4>
            <ul class="modal__list">${x.includes.map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
          <div>
            <h4>Highlights</h4>
            <ul class="modal__list modal__list--tags">${x.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="modal__actions">
          <div class="modal__price"><b>$${x.price}</b> <span>from · ${x.unit}</span></div>
          <a class="btn btn--solid" href="${waLink(`Hi Marsa Moments! I'm interested in the "${x.title}" excursion. Could you send me the details?`)}" target="_blank" rel="noopener">Ask on WhatsApp</a>
          <button class="btn btn--pill" data-book="${x.title}">Request this trip</button>
        </div>
      </div>`;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) openModal(card.dataset.id);
    });
    grid.addEventListener("keydown", (e) => {
      const card = e.target.closest(".card");
      if (card && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openModal(card.dataset.id);
      }
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
      const bookBtn = e.target.closest("[data-book]");
      if (bookBtn) {
        closeModal();
        const sel = document.getElementById("tour");
        if (sel) sel.value = bookBtn.dataset.book;
        document.getElementById("book").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => document.getElementById("name")?.focus(), 600);
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  /* ---------- Lead form ---------- */
  const form = document.getElementById("leadForm");
  if (form) {
    const showError = (name, msg) => {
      const input = form.querySelector(`[name="${name}"]`);
      const err = form.querySelector(`.error[data-for="${name}"]`);
      if (input) input.classList.toggle("is-invalid", !!msg);
      if (err) err.textContent = msg || "";
    };

    const validate = () => {
      let ok = true;
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();

      if (!name) { showError("name", "Please tell us your name."); ok = false; } else showError("name", "");
      if (!email) { showError("email", "We need an email to reply."); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("email", "That email doesn't look right."); ok = false; }
      else showError("email", "");
      if (phone && !/^[+()\d\s-]{6,}$/.test(phone)) { showError("phone", "Check the phone number."); ok = false; } else showError("phone", "");
      return ok;
    };

    ["name", "email", "phone"].forEach((n) => {
      const el = form.querySelector(`[name="${n}"]`);
      if (el) el.addEventListener("input", () => { if (el.classList.contains("is-invalid")) validate(); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        tour: form.tour.value,
        guests: form.guests.value,
        dates: form.dates.value.trim(),
        hotel: form.hotel.value.trim(),
        message: form.message.value.trim(),
      };

      // Build a ready-to-send WhatsApp message from the enquiry
      const summary =
        `New trip request via Marsa Moments%0A` +
        `— Name: ${data.name}%0A` +
        `— Guests: ${data.guests}%0A` +
        `— Excursion: ${data.tour}%0A` +
        (data.dates ? `— Dates: ${data.dates}%0A` : "") +
        (data.hotel ? `— Hotel: ${data.hotel}%0A` : "") +
        (data.message ? `— Notes: ${data.message}%0A` : "") +
        `— Contact: ${data.email}${data.phone ? " / " + data.phone : ""}`;
      const num = (CFG.whatsapp || "").replace(/\D/g, "");
      const wa = `https://wa.me/${num}?text=${summary}`;

      // TODO (backend): POST `data` to your CRM / email endpoint here.
      // For now the enquiry is captured client-side and handed off to WhatsApp/email.

      const btn = document.getElementById("submitBtn");
      if (btn) { btn.textContent = "Sending..."; btn.disabled = true; }

      setTimeout(() => {
        const success = document.getElementById("formSuccess");
        const successWa = document.getElementById("successWhatsapp");
        const successMsg = document.getElementById("successMsg");
        if (successWa) successWa.href = wa;
        if (successMsg) successMsg.textContent =
          `Thanks ${data.name.split(" ")[0]} — we'll be in touch within a few hours. Want a faster answer?`;
        if (success) success.hidden = false;
      }, 500);
    });
  }

  /* ---------- Nav scroll state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });

  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    const toggle = (open) => {
      burger.classList.toggle("is-open", open);
      mobileMenu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle(!burger.classList.contains("is-open")));
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observeReveals() {
    const els = document.querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Init ---------- */
  function markReveals() {
    document.querySelectorAll(
      ".intro__text, .section-head, .why__item, .step, .quote, .book__copy, .book__form, .faq__item, .cta-final__content"
    ).forEach((el) => el.classList.add("reveal"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    setWhatsappLinks();
    renderGrid("all");
    markReveals();
    observeReveals();
    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
