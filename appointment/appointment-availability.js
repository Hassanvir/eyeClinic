/* ════════════════════════════════════════════════════════════════
   APPOINTMENT DATE + TIME AVAILABILITY — PLACEHOLDER LOGIC

   The time slots shown below are FAKE / DUMMY DATA for demo purposes
   only. They are NOT real clinic availability — there is no backend
   behind this file.

   TO GO LIVE: replace generateDummySlots() with a real call to the
   ITFrontDesk (or other booking vendor) availability API once it is
   available. That call will need to:
     - be asynchronous (network request, not instant return)
     - send the selected clinic location (and likely exam type) as params
     - handle loading / error states while waiting on the response
     - parse whatever response shape the real API returns

   Everything else in this file (calendar rendering, month navigation,
   slot-button UI, hidden-input wiring) can stay as-is.
   ════════════════════════════════════════════════════════════════ */

const apptFormForAvailability = document.getElementById('apptForm');

if (apptFormForAvailability) {
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

    function toDateStr(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    // Dummy placeholder slots — deterministically varied per date, no backend.
    const ALL_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
      '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];

    function generateDummySlots(dateStr) {
      // Simple string hash so the same date always yields the same subset.
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
      }

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
          updateSummary();
        });
      });
    }

    function updateSummary() {
      if (!datetimeSummary) return;
      if (selectedDateStr && timeInput.value) {
        const [y, m, d] = selectedDateStr.split('-').map(Number);
        const friendlyDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric'
        });
        datetimeSummary.textContent = `Selected: ${friendlyDate} at ${timeInput.value}`;
      } else if (selectedDateStr) {
        datetimeSummary.textContent = '';
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
        } else {
          if (dateStr === selectedDateStr) btn.classList.add('selected');
          btn.addEventListener('click', () => {
            selectedDateStr = dateStr;
            dateInput.value = dateStr;
            timeInput.value = '';
            renderCalendar();
            renderTimePanel();
            updateSummary();
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
}
