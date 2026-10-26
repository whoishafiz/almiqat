// Public page behaviour: tabs, group-size pricing, copy button, WhatsApp enquiry.
// No data leaves the browser except through the WhatsApp link the visitor opens.
(() => {
  "use strict";

  const WA_NUMBER = (document.body.dataset.wa || "").replace(/\D/g, "");
  const GREETING = "Assalamualaikum Al-Miqat, ";
  const waUrl = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(GREETING + msg)}`;
  const money = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

  /* ---------- tabs ---------- */
  const TABS = ["home", "about", "packages", "blogs", "contact"];
  const SUBS = ["umrah", "hajj", "tours"]; // sub-tabs inside the packages view
  const nav = document.getElementById("tabs");
  const menuBtn = document.getElementById("menuBtn");
  let currentSub = "umrah";

  function showSub(id) {
    currentSub = id;
    SUBS.forEach((s) => {
      document.getElementById("sub-" + s).hidden = s !== id;
      const tab = document.querySelector(`.subtab[data-go="${s}"]`);
      if (tab) tab.setAttribute("aria-selected", String(s === id));
    });
  }

  function show(id, updateHash) {
    const sub = SUBS.includes(id) ? id : null;
    if (sub) id = "packages";
    if (!TABS.includes(id)) id = "home";
    TABS.forEach((t) => {
      document.getElementById(t).hidden = t !== id;
      const tab = document.querySelector(`.tab[data-tab="${t}"]`);
      if (tab) tab.setAttribute("aria-selected", String(t === id));
    });
    if (id === "packages") showSub(sub || currentSub);
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    if (updateHash) history.replaceState(null, "", "#" + (sub || id));
    window.scrollTo({ top: 0 });
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-tab],[data-go]");
    if (!el) return;
    e.preventDefault();
    show(el.dataset.tab || el.dataset.go, true);
    if (el.dataset.scroll) document.getElementById(el.dataset.scroll)?.scrollIntoView();
  });
  menuBtn.addEventListener("click", () => {
    menuBtn.setAttribute("aria-expanded", String(nav.classList.toggle("open")));
  });
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));

  /* ---------- group-size pricing for Brunei tours ---------- */
  function tierIndex(tiers, pax) {
    let idx = -1;
    tiers.forEach((t, i) => { if (pax >= t.qty) idx = i; });
    return idx;
  }

  function updateCard(card, pax) {
    let tiers;
    try { tiers = JSON.parse(card.dataset.tiers); } catch { return; }
    if (!Array.isArray(tiers) || !tiers.length) return;
    const idx = tierIndex(tiers, pax);
    const tier = tiers[Math.max(idx, 0)];
    card.querySelector('[data-role="price"]').textContent = `BND ${money(tier.amount)}`;
    const note = card.querySelector('[data-role="note"]');
    note.textContent = idx >= 0 ? `per guest for ${pax} guests`
      : `from ${card.dataset.min} guests. Ask us about smaller groups.`;
    note.classList.toggle("warn", idx < 0);
    card.querySelectorAll(".tiers tr").forEach((tr, i) => tr.classList.toggle("on", i === idx));
    card.querySelector('[data-role="wa"]').href =
      waUrl(`I would like to book the ${card.dataset.name} for ${pax} guests.`);
  }

  const sizeInput = document.getElementById("groupSize");
  if (sizeInput) {
    sizeInput.addEventListener("input", () => {
      const pax = Math.max(1, Math.min(200, parseInt(sizeInput.value, 10) || 1));
      document.querySelectorAll(".pkg[data-tiers]").forEach((c) => updateCard(c, pax));
    });
  }

  /* ---------- copy number ---------- */
  const copyBtn = document.getElementById("copyNum");
  copyBtn?.addEventListener("click", () => {
    const span = document.getElementById("waNumber");
    const done = () => { copyBtn.textContent = "Copied"; setTimeout(() => { copyBtn.textContent = "Copy"; }, 1600); };
    const select = () => {
      const r = document.createRange(); r.selectNodeContents(span);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(span.textContent).then(done, select);
    else select();
  });

  /* ---------- enquiry form -> WhatsApp ---------- */
  document.getElementById("enquiry")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (id) => document.getElementById(id).value.trim();
    const msgEl = document.getElementById("formMsg");
    if (!v("fName")) { msgEl.textContent = "Please add your name so we know who we are speaking with."; return; }
    const lines = [
      `Name: ${v("fName")}`, `Package: ${v("fPkg")}`,
      v("fDate") && `Preferred date: ${v("fDate")}`, `Travellers: ${v("fPax") || "-"}`,
      v("fNote") && `Notes: ${v("fNote")}`,
    ].filter(Boolean);
    msgEl.textContent = "Opening WhatsApp with your message. Press send in WhatsApp to reach us.";
    window.open(waUrl("\n" + lines.join("\n")), "_blank", "noopener,noreferrer");
  });

  show(location.hash.slice(1) || "home");
})();
