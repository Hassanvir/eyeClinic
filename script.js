/* ─── Navbar scroll behaviour ─────────────────────────────────── */
const navbar = document.getElementById('navbar');

if (navbar) {
  const updateNavbar = () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('not-scrolled');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('not-scrolled');
    }
  };

  // Don't override the forced .scrolled on appointments page
  if (!document.body.classList.contains('appt-page')) {
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }
}


/* ─── Footer year ─────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Scroll-reveal (IntersectionObserver) ────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Counter / count-up animation ───────────────────────────── */
function animateCount(el, target, duration) {
  const start     = performance.now();
  const startVal  = 0;

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * eased);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const card   = entry.target;
    const target = parseInt(card.dataset.target, 10);
    const valEl  = card.querySelector('.count-val');

    card.classList.add('visible');
    if (valEl && !card.dataset.counted) {
      card.dataset.counted = true;
      animateCount(valEl, target, 2000);
    }
    counterObserver.unobserve(card);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.counter-card').forEach(card => counterObserver.observe(card));

/* ─── Hero word-slider ────────────────────────────────────────── */
(function () {
  const container = document.querySelector('.slide-container');
  if (!container) return;
  const items = Array.from(container.querySelectorAll('.slide-item'));
  if (!items.length) return;

  let current = 0;

  // Measure all items to find the max width & height, then lock container size.
  // We temporarily make each item visible (but the container is off-flow so
  // nothing shifts on screen).
  function lockSize() {
    let maxW = 0, maxH = 0;
    items.forEach(el => {
      // force layout with full opacity so getBoundingClientRect works
      el.style.opacity   = '1';
      el.style.position  = 'static';
      const r = el.getBoundingClientRect();
      if (r.width  > maxW) maxW = r.width;
      if (r.height > maxH) maxH = r.height;
      el.style.opacity  = '';
      el.style.position = '';
    });
    container.style.width  = maxW + 'px';
    container.style.height = maxH + 'px';
  }

  lockSize();
  window.addEventListener('resize', lockSize);

  // Show first item
  items[0].classList.add('active');

  setInterval(() => {
    const prev = current;
    current = (current + 1) % items.length;

    items[prev].classList.remove('active');
    items[prev].classList.add('exit');
    setTimeout(() => items[prev].classList.remove('exit'), 600);

    items[current].classList.add('active');
  }, 2800);
})();

/* ─── Appointment form – prevent default submit (no backend) ──── */
const apptForm = document.getElementById('apptForm');
if (apptForm) {
  // Set min date on the preferred date picker to today
  const today = new Date().toISOString().split('T')[0];
  const datePicker = document.getElementById('preferredDate');
  if (datePicker) datePicker.setAttribute('min', today);

  // No submission behaviour needed – form data is for front desk display only.
  // If a backend is added later, replace this handler.
  apptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Intentionally left blank – front desk manages form data directly.
  });
}
