/* ════════════════════════════════════════════════════════════════
   EXISTING APPOINTMENT LOOKUP — PLACEHOLDER LOGIC

   There is no backend here. Submitting the lookup form below renders
   FAKE mock appointment(s) built from whatever name/phone/age range the
   patient types in, purely to demonstrate the intended "view & cancel"
   UI. Nothing here is looked up against a real booking record.

   TO GO LIVE: replace generateMockAppointments() and the submit handler
   below with a real lookup against your booking system (matching on
   phone + age range, or a real date-of-birth field if more precision is
   needed), then render the real matching appointment(s) and wire the
   "Cancel Appointment" button to a real cancel API call instead of the
   current cosmetic-only removal.
   ════════════════════════════════════════════════════════════════ */

/* ─── Footer year ─────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Eye FAQ navbar dropdown (all screen sizes) ─────────────────
   Clicking "Eye FAQ" in the navbar reveals a dropdown panel with
   links to each eye FAQ topic page. */
const navEyeFaqToggle = document.getElementById('navEyeFaqToggle');
const navEyeFaqPanel = document.getElementById('navEyeFaqPanel');

if (navEyeFaqToggle && navEyeFaqPanel) {
  const openNavPanel = () => {
    navEyeFaqToggle.setAttribute('aria-expanded', 'true');
    navEyeFaqPanel.hidden = false;
    navEyeFaqPanel.classList.remove('is-closing');
  };

  const closeNavPanel = () => {
    navEyeFaqToggle.setAttribute('aria-expanded', 'false');
    navEyeFaqPanel.classList.add('is-closing');
    setTimeout(() => {
      navEyeFaqPanel.hidden = true;
      navEyeFaqPanel.classList.remove('is-closing');
    }, 220);
  };

  navEyeFaqToggle.addEventListener('click', () => {
    if (navEyeFaqPanel.hidden) {
      openNavPanel();
    } else {
      closeNavPanel();
    }
  });

  document.addEventListener('click', (e) => {
    if (navEyeFaqPanel.hidden) return;
    if (!navEyeFaqPanel.contains(e.target) && !navEyeFaqToggle.contains(e.target)) {
      closeNavPanel();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !navEyeFaqPanel.hidden) closeNavPanel();
  });
}

/* ─── FAKE mock appointment data ──────────────────────────────────
   No backend exists, so results are generated locally from the
   patient's entered name. Deterministic (same name always produces
   the same mock appointment) so the demo feels stable across
   repeated lookups, rather than reshuffling randomly each time. */
const MOCK_LOCATIONS = ['Edmonton North East', 'Edmonton South', 'Calgary North East', 'St. Albert', 'Sherwood Park'];
const MOCK_DOCTORS = ['Doctor 1', 'Doctor 2', 'Doctor 3', 'Doctor 4'];
const MOCK_EXAMS = ['Complete Eye Exam', 'Follow Up Exam', 'Pupil Dilation', 'Visual Fields'];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function generateMockAppointments(firstName, lastName) {
  const seed = hashString(`${firstName.toLowerCase()}${lastName.toLowerCase()}`);
  const daysAhead = 3 + (seed % 25);
  const apptDate = new Date();
  apptDate.setDate(apptDate.getDate() + daysAhead);

  const hour = 9 + (seed % 8);
  const minute = (seed % 2) * 30;
  const time = new Date(apptDate);
  time.setHours(hour, minute);

  return [{
    id: `mock-${seed}`,
    friendlyDate: apptDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    friendlyTime: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    location: MOCK_LOCATIONS[seed % MOCK_LOCATIONS.length],
    doctor: MOCK_DOCTORS[seed % MOCK_DOCTORS.length],
    exam: MOCK_EXAMS[seed % MOCK_EXAMS.length]
  }];
}

function renderAppointmentCards(appointments, firstName) {
  if (!appointments.length) {
    lookupResult.innerHTML = `
      <p>We couldn't find any upcoming appointments matching that information.</p>
      <p>Please call us at <a href="tel:18883812677" class="link-primary">1-888-381-2677</a> and our front desk team will help you directly.</p>
    `;
    return;
  }

  lookupResult.innerHTML = `
    <p class="appt-found-intro">Hi ${firstName}, here ${appointments.length > 1 ? 'are your upcoming appointments' : 'is your upcoming appointment'}:</p>
    <div class="appt-found-list">
      ${appointments.map(appt => `
        <div class="appt-found-card" data-appt-id="${appt.id}">
          <div class="appt-found-row"><span>Date &amp; Time</span><strong>${appt.friendlyDate} at ${appt.friendlyTime}</strong></div>
          <div class="appt-found-row"><span>Location</span><strong>${appt.location}</strong></div>
          <div class="appt-found-row"><span>Doctor</span><strong>${appt.doctor}</strong></div>
          <div class="appt-found-row"><span>Exam</span><strong>${appt.exam}</strong></div>
          <button type="button" class="submit-btn-outline submit-btn-inline appt-cancel-btn" data-appt-id="${appt.id}">Cancel Appointment</button>
        </div>
      `).join('')}
    </div>
    <p class="appt-lookup-note">Need to reschedule instead? Call us at <a href="tel:18883812677" class="link-primary">1-888-381-2677</a>.</p>
  `;

  lookupResult.querySelectorAll('.appt-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.appt-found-card');
      if (card) {
        card.innerHTML = `<p class="appt-cancelled-msg">This appointment has been cancelled.</p>`;
      }
    });
  });
}

const lookupForm = document.getElementById('lookupForm');
const lookupResult = document.getElementById('lookupResult');

if (lookupForm && lookupResult) {
  lookupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('lookupFirstName').value.trim();
    const lastName = document.getElementById('lookupLastName').value.trim();

    lookupResult.hidden = false;
    renderAppointmentCards(generateMockAppointments(firstName, lastName), firstName);
  });
}
