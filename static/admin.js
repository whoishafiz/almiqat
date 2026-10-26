// Back-office helpers: unsaved-change warning, delete confirmation, date/length hint.
(() => {
  "use strict";

  // Warn before leaving a form with unsaved edits.
  document.querySelectorAll("form[data-dirty-guard]").forEach((form) => {
    let dirty = false;
    form.addEventListener("input", () => { dirty = true; });
    form.addEventListener("submit", () => { dirty = false; });
    window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
  });

  // Enable the delete button only when the slug is typed exactly.
  document.querySelectorAll("form[data-confirm-slug]").forEach((form) => {
    const input = form.querySelector("input[name=confirm]");
    const button = form.querySelector("button[type=submit]");
    input.addEventListener("input", () => { button.disabled = input.value.trim() !== form.dataset.confirmSlug; });
  });

  // One-click insert of a saved programme event as the next itinerary day.
  document.querySelectorAll(".chips-row[data-insert-target]").forEach((row) => {
    const area = document.getElementById(row.dataset.insertTarget);
    if (!area) return;
    row.querySelectorAll(".chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lines = area.value.split("\n").filter((l) => l.trim());
        const prev = lines.length ? lines[lines.length - 1].split("|") : [];
        const route = prev.length === 3 && prev[1].trim() ? prev[1].trim() : "-";
        area.value = lines.concat(`${lines.length + 1} | ${route} | ${btn.textContent}`).join("\n") + "\n";
        area.dispatchEvent(new Event("input", { bubbles: true })); // keep the unsaved-change warning honest
        area.focus();
      });
    });
  });

  // Show how many days the chosen dates cover, so Days can be matched before saving.
  const start = document.getElementById("f-start_date");
  const end = document.getElementById("f-end_date");
  const days = document.getElementById("f-days");
  const hint = document.getElementById("spanHint");
  function updateHint() {
    if (!start || !end || !hint) return;
    if (!start.value || !end.value) { hint.textContent = ""; return; }
    const span = Math.round((new Date(end.value) - new Date(start.value)) / 86400000) + 1;
    if (span < 1) { hint.textContent = "The end date is before the start date."; return; }
    const mismatch = days.value && Number(days.value) !== span;
    hint.textContent = `These dates cover ${span} days.` + (mismatch ? ` Days is set to ${days.value}, so saving will be refused until they match.` : "");
  }
  [start, end, days].forEach((el) => el?.addEventListener("input", updateHint));
  updateHint();
})();
