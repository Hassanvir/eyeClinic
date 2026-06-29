/* ════════════════════════════════════════════════════════════════
   APPOINTMENT BOOKING FLOW — all page logic for the 2-step flow

   Loaded on both appointment/appointments.html (step 1) and
   appointment/appointment-details.html (step 2). Each section below
   guards itself on the elements that only exist on its own page, so
   this single file is safe to include on both without errors.

   Sections:
     1. Footer year + Eye FAQ navbar dropdown — both pages
     2. Location pre-select/lock (step 1) — REAL logic, no backend needed
     3. Date + time availability (step 1) — FAKE dummy data, see notes
     4. Step 1 → Step 2 handoff (step 1)  — builds query string, navigates
     5. Step 2 summary + submit (step 2)  — reads query string, renders
                                             summary, handles final submit,
                                             redirects to confirmation page
     6. Confirmation page (appointment-confirmation.html) — renders the
                                             final confirmation table

   PLACEHOLDER LOGIC for ITFrontDesk's developers to confirm/replace:
     - Section 3: isDateAvailable() and generateDummySlots() return FAKE
       availability/time slots (calendar days are colored green/grey based
       on this). Replace both with real calls to your availability API.
     - Section 2: confirm whether your hosted booking URL can accept a
       "location" (or equivalent) query param to pre-select a clinic.
     - The Doctor labels in section 5 (DOCTOR_LABELS) are generic
       placeholders (Doctor 1, Doctor 2, etc.) — there is no real
       doctor roster in this site. Replace with the real list.
     - Section 5's submit handler currently just builds a query string and
       redirects to the confirmation page. Replace with a real POST to
       your booking API, and only redirect to confirmation on success.
     - Section 6 generates a random placeholder confirmation number
       client-side. Once a real backend exists, use the real confirmation
       number/ID it returns instead.
   ════════════════════════════════════════════════════════════════ */

/* ─── 1. Footer year ──────────────────────────────────────────── */
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

/* ─── 2. City → Location filtering, plus pre-select/lock (step 1) ──
   The City field filters which optgroup of the Location dropdown is
   shown (Edmonton / Calgary / Other), built from each option's parent
   optgroup data-city attribute — no separate data source to maintain.

   How pre-select/lock is triggered: on the Locations page, each
   clinic's "Book Appointment" button links here as:
     appointments.html?location=edm-ne&locked=1
   When step 1 loads with that query string, the matching city is
   derived from the location's optgroup and both City and Location
   are selected and disabled (locked), with a "Change location" link
   to unlock them if needed. */
const apptStep1FormForLocation = document.getElementById('apptStep1Form');

if (apptStep1FormForLocation) {
  const citySelect = document.getElementById('city');
  const locationSelect = document.getElementById('location');
  const locationPlaceholder = document.getElementById('locationPlaceholder');
  const allLocationOptgroups = Array.from(locationSelect.querySelectorAll('optgroup'));

  function filterLocationsByCity(cityValue) {
    allLocationOptgroups.forEach(group => {
      group.hidden = group.dataset.city !== cityValue;
    });
    locationSelect.value = '';
    locationSelect.disabled = !cityValue;
    locationPlaceholder.textContent = cityValue ? 'Select a location…' : 'Select a city first…';
  }

  citySelect.addEventListener('change', () => {
    filterLocationsByCity(citySelect.value);
  });

  const locationParams = new URLSearchParams(window.location.search);
  const presetLocation = locationParams.get('location');

  if (presetLocation) {
    const matchedOption = Array.from(locationSelect.options)
      .find(opt => opt.value === presetLocation);

    if (matchedOption) {
      const presetCity = matchedOption.closest('optgroup').dataset.city;
      citySelect.value = presetCity;
      filterLocationsByCity(presetCity);
      locationSelect.value = presetLocation;
      locationSelect.disabled = false;

      if (locationParams.get('locked') === '1') {
        citySelect.disabled = true;
        locationSelect.disabled = true;

        // Disabled selects don't submit their value, so mirror them into hidden inputs
        const hiddenCity = document.createElement('input');
        hiddenCity.type = 'hidden';
        hiddenCity.name = 'city';
        hiddenCity.value = presetCity;
        apptStep1FormForLocation.appendChild(hiddenCity);

        const hiddenLocation = document.createElement('input');
        hiddenLocation.type = 'hidden';
        hiddenLocation.name = 'location';
        hiddenLocation.value = presetLocation;
        apptStep1FormForLocation.appendChild(hiddenLocation);

        const changeLink = document.createElement('button');
        changeLink.type = 'button';
        changeLink.className = 'location-change-link';
        changeLink.textContent = 'Change location';
        changeLink.addEventListener('click', () => {
          citySelect.disabled = false;
          locationSelect.disabled = false;
          hiddenCity.remove();
          hiddenLocation.remove();
          changeLink.remove();
        });
        locationSelect.insertAdjacentElement('afterend', changeLink);
      }
    }
  }
}


/* ─── 3. Date + time availability picker (step 1) — FAKE DATA ────
   The time slots below are NOT real clinic availability — there is
   no backend here. Replace generateDummySlots() with a real call to
   the booking vendor's availability API once available. */
const calDays = document.getElementById('calDays');
const calMonthLabel = document.getElementById('calMonthLabel');
const calPrevMonth = document.getElementById('calPrevMonth');
const calNextMonth = document.getElementById('calNextMonth');
const timePanel = document.getElementById('timePanel');
const dateInput = document.getElementById('preferredDate');
const timeInput = document.getElementById('preferredTime');
const datetimeSummary = document.getElementById('datetimeSummary');

if (calDays && calMonthLabel && timePanel) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  let viewYear = todayMidnight.getFullYear();
  let viewMonth = todayMidnight.getMonth();
  let selectedDateStr = null;

  const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // Dummy placeholder slots — deterministically varied per date, no backend.
  const ALL_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];

  // Simple deterministic string hash so the same date always yields the
  // same result (no backend — purely for consistent dummy data).
  function hashDateStr(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  // Dummy placeholder availability — roughly 1 in 4 dates is "unavailable"
  // (fully booked / closed), purely for demo purposes. Replace with a real
  // availability lookup once a backend exists.
  function isDateAvailable(dateStr) {
    return hashDateStr(dateStr) % 4 !== 0;
  }

  function generateDummySlots(dateStr) {
    let hash = hashDateStr(dateStr);

    const count = 4 + (hash % 5); // between 4 and 8 slots available
    const slots = [...ALL_SLOTS];

    // Deterministically shuffle then trim to `count`
    for (let i = slots.length - 1; i > 0; i--) {
      hash = (hash * 31 + i) >>> 0;
      const j = hash % (i + 1);
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    return slots.slice(0, count).sort((a, b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
  }

  function renderTimePanel() {
    if (!selectedDateStr) {
      timePanel.innerHTML = '<p class="datetime-times-placeholder">Select a date to see available times.</p>';
      return;
    }

    const slots = generateDummySlots(selectedDateStr);

    if (slots.length === 0) {
      timePanel.innerHTML = '<p class="datetime-times-placeholder">Closed on this day. Please pick another date.</p>';
      return;
    }

    const slotsHtml = slots.map(slot =>
      `<button type="button" class="datetime-slot" data-time="${slot}">${slot}</button>`
    ).join('');

    timePanel.innerHTML = `
      <p class="datetime-times-label">Available Times</p>
      <div class="datetime-slots">${slotsHtml}</div>
    `;

    timePanel.querySelectorAll('.datetime-slot').forEach(btn => {
      if (btn.dataset.time === timeInput.value) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        timePanel.querySelectorAll('.datetime-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        timeInput.value = btn.dataset.time;
        updateDatetimeSummary();
      });
    });
  }

  function updateDatetimeSummary() {
    if (!datetimeSummary) return;
    if (selectedDateStr && timeInput.value) {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const friendlyDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
      datetimeSummary.textContent = `Selected: ${friendlyDate} at ${timeInput.value}`;
    } else {
      datetimeSummary.textContent = '';
    }
  }

  function renderCalendar() {
    calMonthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    calDays.innerHTML = '';

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'datetime-day empty';
      calDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toDateStr(viewYear, viewMonth, day);
      const thisDate = new Date(viewYear, viewMonth, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'datetime-day';
      btn.textContent = day;

      if (thisDate < todayMidnight) {
        btn.disabled = true;
      } else if (!isDateAvailable(dateStr)) {
        btn.disabled = true;
        btn.classList.add('unavailable');
        btn.title = 'Not available';
      } else {
        btn.classList.add('available');
        if (dateStr === selectedDateStr) btn.classList.add('selected');
        btn.addEventListener('click', () => {
          selectedDateStr = dateStr;
          dateInput.value = dateStr;
          timeInput.value = '';
          renderCalendar();
          renderTimePanel();
          updateDatetimeSummary();
        });
      }

      calDays.appendChild(btn);
    }
  }

  calPrevMonth.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });

  calNextMonth.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();
}


/* ─── 4. Step 1 → Step 2 handoff ──────────────────────────────────
   When "Continue" is clicked on step 1, read the selected
   location/doctor/exam/date/time/notes and pass them to step 2 as
   URL query params, so step 2 can show a summary and submit
   everything together at the end.

   TO GO LIVE: if the real booking flow validates availability
   server-side before allowing "Continue", that check would happen
   here (e.g. an API call) before the navigation below. */
const apptStep1Form = document.getElementById('apptStep1Form');

if (apptStep1Form) {
  apptStep1Form.addEventListener('submit', (e) => {
    e.preventDefault();

    const citySelect = document.getElementById('city');
    const locationSelect = document.getElementById('location');
    const doctorSelect = document.getElementById('doctor');
    const examSelect = document.getElementById('examType');
    const notesInput = document.getElementById('notes');

    if (!citySelect.value || !locationSelect.value || !examSelect.value || !dateInput.value || !timeInput.value) {
      alert('Please select a city, location, exam type, and an available date & time before continuing.');
      return;
    }

    const params = new URLSearchParams({
      city: citySelect.value,
      location: locationSelect.value,
      doctor: doctorSelect.value,
      examType: examSelect.value,
      preferredDate: dateInput.value,
      preferredTime: timeInput.value,
      notes: notesInput.value
    });

    window.location.href = `appointment-details.html?${params.toString()}`;
  });
}


/* ─── 5. Step 2 — summary + patient info submit ──────────────────
   Reads the location/doctor/exam/date/time/notes passed from step 1
   as URL query params, shows them as a read-only summary, and adds
   them as hidden inputs to step 2's own form so the complete booking
   (step 1 + step 2 data) submits together.

   TO GO LIVE: replace the submit handler below with real submission
   logic (e.g. POST all fields to your booking API). */
const LOCATION_LABELS = {
  'edm-ne': 'Edmonton North East',
  'edm-nw': 'Edmonton North West',
  'edm-s': 'Edmonton South',
  'edm-w': 'Edmonton West',
  'st-albert': 'St. Albert',
  'cal-ne': 'Calgary North East',
  'cal-s': 'Calgary South',
  'cal-nw': 'Calgary North West',
  'sherwood-park': 'Sherwood Park',
  'red-deer': 'Red Deer',
  'okotoks': 'Okotoks'
};

const DOCTOR_LABELS = {
  'any': 'Any Doctor',
  'doctor-1': 'Doctor 1',
  'doctor-2': 'Doctor 2',
  'doctor-3': 'Doctor 3',
  'doctor-4': 'Doctor 4'
};

const EXAM_LABELS = {
  'complete': 'Complete Eye Exam',
  'pupil-dilation': 'Pupil Dilation',
  'visual-fields': 'Visual Fields',
  'follow-up': 'Follow Up Exam',
  'recheck-rx': 'Recheck of RX – with same doctor as before only'
};

const apptStep2Form = document.getElementById('apptStep2Form');
const summaryEl = document.getElementById('apptSummary');

if (apptStep2Form && summaryEl) {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city') || '';
  const location = params.get('location');
  const doctor = params.get('doctor');
  const examType = params.get('examType');
  const preferredDate = params.get('preferredDate');
  const preferredTime = params.get('preferredTime');
  const notes = params.get('notes') || '';

  // If step 1 selections are missing (e.g. page visited directly), send
  // the patient back to step 1 instead of showing a broken summary.
  if (!location || !examType || !preferredDate || !preferredTime) {
    window.location.href = 'appointments.html';
  } else {
    const friendlyDate = new Date(`${preferredDate}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    summaryEl.innerHTML = `
      <div class="appt-summary-row"><span>Location</span><strong>${LOCATION_LABELS[location] || location}</strong></div>
      <div class="appt-summary-row"><span>Doctor</span><strong>${DOCTOR_LABELS[doctor] || doctor || 'Any Doctor'}</strong></div>
      <div class="appt-summary-row"><span>Exam</span><strong>${EXAM_LABELS[examType] || examType}</strong></div>
      <div class="appt-summary-row"><span>Date &amp; Time</span><strong>${friendlyDate} at ${preferredTime}</strong></div>
    `;

    // Carry step 1 selections forward as hidden inputs so the final
    // submission contains the complete booking, not just step 2's fields.
    [
      ['city', city],
      ['location', location],
      ['doctor', doctor],
      ['examType', examType],
      ['preferredDate', preferredDate],
      ['preferredTime', preferredTime],
      ['notes', notes]
    ].forEach(([name, value]) => {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = name;
      hidden.value = value;
      apptStep2Form.appendChild(hidden);
    });
  }

  /* TO GO LIVE: replace this handler with a real POST to your booking
     API. Right now there is no backend, so it just gathers every field
     from steps 1 and 2 into a query string and redirects to the
     confirmation page, which only generates a PLACEHOLDER confirmation
     number (see section 6) — only redirect on a real successful booking. */
  apptStep2Form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(apptStep2Form);
    const confirmParams = new URLSearchParams(formData);
    window.location.href = `appointment-confirmation.html?${confirmParams.toString()}`;
  });
}


/* ─── 6. Confirmation page (appointment-confirmation.html) ────────
   Reads every field collected across steps 1 and 2 from URL query
   params and renders the final read-only confirmation table.

   TO GO LIVE: the confirmation number below is generated client-side
   as a placeholder. Replace it with the real confirmation number/ID
   returned by your booking API after a successful submit. */
const confirmationTable = document.getElementById('confirmationTable');
const confirmationDateBadge = document.getElementById('confirmationDateBadge');

if (confirmationTable) {
  const params = new URLSearchParams(window.location.search);
  const firstName = params.get('firstName') || '';
  const lastName = params.get('lastName') || '';
  const location = params.get('location');
  const doctor = params.get('doctor');
  const examType = params.get('examType');
  const preferredDate = params.get('preferredDate');
  const preferredTime = params.get('preferredTime');

  if (!location || !examType || !preferredDate || !preferredTime) {
    window.location.href = 'appointments.html';
  } else {
    const friendlyDate = new Date(`${preferredDate}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // PLACEHOLDER — random 6-digit confirmation number, no backend yet.
    const confirmationNumber = Math.floor(100000 + Math.random() * 900000);

    // Visual calendar/clock badge for the date & time.
    if (confirmationDateBadge) {
      const [y, m, d] = preferredDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const monthAbbr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      confirmationDateBadge.innerHTML = `
        <div class="appt-date-badge-calendar">
          <span class="appt-date-badge-month">${monthAbbr}</span>
          <span class="appt-date-badge-day">${d}</span>
        </div>
        <div class="appt-date-badge-info">
          <p class="appt-date-badge-weekday">${weekday}</p>
          <p class="appt-date-badge-time">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 3" />
            </svg>
            ${preferredTime}
          </p>
        </div>
      `;
    }

    confirmationTable.innerHTML = `
      <div class="appt-confirmation-row"><span>Name</span><strong>${firstName} ${lastName}</strong></div>
      <div class="appt-confirmation-row"><span>Confirmation #</span><strong>${confirmationNumber}</strong></div>
      <div class="appt-confirmation-row"><span>Date &amp; Time</span><strong>${friendlyDate} at ${preferredTime}</strong></div>
      <div class="appt-confirmation-row"><span>Location</span><strong>${LOCATION_LABELS[location] || location}</strong></div>
      <div class="appt-confirmation-row"><span>Doctor</span><strong>${DOCTOR_LABELS[doctor] || doctor || 'Any Doctor'}</strong></div>
      <div class="appt-confirmation-row"><span>Exam</span><strong>${EXAM_LABELS[examType] || examType}</strong></div>
    `;
  }
}
