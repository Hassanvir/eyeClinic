/* ════════════════════════════════════════════════════════════════
   EXISTING APPOINTMENT LOOKUP — PLACEHOLDER LOGIC

   There is no backend here. Submitting the lookup form below shows a
   static placeholder message instead of real appointment data.

   TO GO LIVE: replace the submit handler below with a real lookup
   against your booking system (e.g. an API call using phone + DOB),
   then render the matching appointment(s) with details and a real
   cancel action instead of the placeholder message.
   ════════════════════════════════════════════════════════════════ */

/* ─── Footer year ─────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const lookupForm = document.getElementById('lookupForm');
const lookupResult = document.getElementById('lookupResult');

if (lookupForm && lookupResult) {
  lookupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    lookupResult.hidden = false;
    lookupResult.innerHTML = `
      <p>We couldn't automatically look up your appointment online yet — this feature is still being set up.</p>
      <p>Please call us at <a href="tel:18883812677" class="link-primary">1-888-381-2677</a> and our front desk team will help you view or cancel your appointment directly.</p>
    `;
  });
}
