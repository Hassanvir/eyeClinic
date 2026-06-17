/* ════════════════════════════════════════════════════════════════
   APPOINTMENT FORM — LOCATION PRE-SELECT & LOCK

   This logic is fully working today and does NOT depend on any
   backend — it just reads the page's own URL and updates the
   Clinic Location dropdown on this page.

   How it's triggered: on the Locations page, each clinic's
   "Book Appointment" button links here as:
     appointments.html?location=edm-ne&locked=1
   When this page loads with that query string, the matching
   location is selected and the dropdown is disabled (locked),
   with a "Change location" link to unlock it if needed.

   IF ITFRONTDESK HOSTS THIS FORM: this same logic can keep working
   as-is, as long as the URL used to reach the booking page still
   carries a location parameter your system recognizes. Two options:
     1. Keep using a "location" query param with these same clinic
        codes (edm-ne, edm-nw, edm-s, edm-w, st-albert, cal-ne,
        cal-s, cal-nw, sherwood-park, red-deer, okotoks) — in which
        case nothing in this file needs to change.
     2. Use your own existing parameter name/codes instead — in
        which case just update the `location` query-string key
        and/or the <option value="..."> codes in appointments.html
        to match what your system expects.
   ════════════════════════════════════════════════════════════════ */

/* ─── Footer year ─────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const apptFormForLocation = document.getElementById('apptForm');

if (apptFormForLocation) {
  // Pre-select & optionally lock the location from a query param,
  // e.g. appointments.html?location=edm-ne&locked=1 (set by Locations page cards)
  const locationParams = new URLSearchParams(window.location.search);
  const presetLocation = locationParams.get('location');
  const locationSelect = document.getElementById('location');

  if (presetLocation && locationSelect) {
    const matchedOption = Array.from(locationSelect.options)
      .find(opt => opt.value === presetLocation);

    if (matchedOption) {
      locationSelect.value = presetLocation;

      if (locationParams.get('locked') === '1') {
        locationSelect.disabled = true;

        // Disabled selects don't submit their value, so mirror it into a hidden input
        const hiddenLocation = document.createElement('input');
        hiddenLocation.type = 'hidden';
        hiddenLocation.name = 'location';
        hiddenLocation.value = presetLocation;
        apptFormForLocation.appendChild(hiddenLocation);

        const changeLink = document.createElement('button');
        changeLink.type = 'button';
        changeLink.className = 'location-change-link';
        changeLink.textContent = 'Change location';
        changeLink.addEventListener('click', () => {
          locationSelect.disabled = false;
          hiddenLocation.remove();
          changeLink.remove();
        });
        locationSelect.insertAdjacentElement('afterend', changeLink);
      }
    }
  }

  /* TO GO LIVE: replace this handler with real submission logic
     (e.g. POST to your booking API) once this form is wired to a
     real backend. Right now it just stops the browser's default
     submit (which would otherwise reload the page / hit no endpoint),
     since there is nowhere for the data to go yet. */
  apptFormForLocation.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}
