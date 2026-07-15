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
          <div class="appt-card-actions">
            <button type="button" class="appt-reschedule-btn" data-appt-id="${appt.id}">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Reschedule
            </button>
            <button type="button" class="appt-cancel-btn" data-appt-id="${appt.id}">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  lookupResult.querySelectorAll('.appt-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.appt-found-card');
      const dateTime = card.querySelector('.appt-found-row strong')?.textContent || '';
      openCancelModal(card, dateTime, false);
    });
  });

  lookupResult.querySelectorAll('.appt-reschedule-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.appt-found-card');
      const dateTime = card.querySelector('.appt-found-row strong')?.textContent || '';
      openCancelModal(card, dateTime, true);
    });
  });
}

/* ─── Cancel confirmation modal ───────────────────────────────────
   Opens a styled modal asking the patient to confirm before
   cancelling. The actual cancel (card removal) only fires on
   "Yes, Cancel It". */
const cancelModalBackdrop = document.getElementById('cancelModalBackdrop');
const cancelModalBody = document.getElementById('cancelModalBody');
const cancelModalKeep = document.getElementById('cancelModalKeep');
const cancelModalConfirm = document.getElementById('cancelModalConfirm');

let pendingCancelCard = null;
let pendingReschedule = false;

const cancelModalTitle = document.getElementById('cancelModalTitle');

function openCancelModal(card, dateTime, isReschedule) {
  pendingCancelCard = card;
  pendingReschedule = isReschedule;

  if (isReschedule) {
    cancelModalTitle.textContent = 'Reschedule Appointment?';
    cancelModalBody.textContent = dateTime
      ? `This will cancel your appointment on ${dateTime} and take you to the booking page to select a new time.`
      : 'This will cancel your existing appointment and take you to the booking page to select a new time.';
    cancelModalConfirm.textContent = 'Yes, Reschedule';
  } else {
    cancelModalTitle.textContent = 'Cancel Appointment?';
    cancelModalBody.textContent = dateTime
      ? `Are you sure you want to cancel your appointment on ${dateTime}? This action cannot be undone.`
      : 'Are you sure you want to cancel this appointment? This action cannot be undone.';
    cancelModalConfirm.textContent = 'Yes, Cancel It';
  }

  cancelModalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  cancelModalConfirm.focus();
}

function closeCancelModal() {
  cancelModalBackdrop.hidden = true;
  document.body.style.overflow = '';
  pendingCancelCard = null;
  pendingReschedule = false;
}

if (cancelModalKeep) {
  cancelModalKeep.addEventListener('click', closeCancelModal);
}

if (cancelModalConfirm) {
  cancelModalConfirm.addEventListener('click', () => {
    if (pendingCancelCard) {
      pendingCancelCard.innerHTML = `<p class="appt-cancelled-msg">${pendingReschedule ? 'Your appointment has been cancelled. Redirecting to booking…' : 'Your appointment has been cancelled.'}</p>`;
    }
    const goReschedule = pendingReschedule;
    closeCancelModal();
    if (goReschedule) {
      setTimeout(() => { window.location.href = 'appointments.html'; }, 1200);
    }
  });
}

if (cancelModalBackdrop) {
  cancelModalBackdrop.addEventListener('click', (e) => {
    if (e.target === cancelModalBackdrop) closeCancelModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cancelModalBackdrop && !cancelModalBackdrop.hidden) closeCancelModal();
});

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
