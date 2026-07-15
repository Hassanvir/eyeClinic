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

/* ─── Policy navbar dropdown (all screen sizes) ──────────────────
   Mirrors the Eye FAQ dropdown — same open/close/dismiss behaviour. */
const navPolicyToggle = document.getElementById('navPolicyToggle');
const navPolicyPanel = document.getElementById('navPolicyPanel');

if (navPolicyToggle && navPolicyPanel) {
  const openPolicyPanel = () => {
    navPolicyToggle.setAttribute('aria-expanded', 'true');
    navPolicyPanel.hidden = false;
    navPolicyPanel.classList.remove('is-closing');
  };

  const closePolicyPanel = () => {
    navPolicyToggle.setAttribute('aria-expanded', 'false');
    navPolicyPanel.classList.add('is-closing');
    setTimeout(() => {
      navPolicyPanel.hidden = true;
      navPolicyPanel.classList.remove('is-closing');
    }, 220);
  };

  navPolicyToggle.addEventListener('click', () => {
    if (navPolicyPanel.hidden) {
      openPolicyPanel();
    } else {
      closePolicyPanel();
    }
  });

  document.addEventListener('click', (e) => {
    if (navPolicyPanel.hidden) return;
    if (!navPolicyPanel.contains(e.target) && !navPolicyToggle.contains(e.target)) {
      closePolicyPanel();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !navPolicyPanel.hidden) closePolicyPanel();
  });
}

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

/* ─── FAQ Accordion ───────────────────────────────────────────── */
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const isOpen = item.classList.contains('open');

    // Close all open items
    document.querySelectorAll('.accordion-item.open').forEach(open => {
      open.classList.remove('open');
    });

    // Open clicked item if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

/* ─── Appointment booking flow ──────────────────────────────────
   All appointment-page logic (location pre-select/lock, date+time
   picker, step navigation, and submit handling) lives in the
   self-contained appointment/ folder: appointment/js/appointment.js
   and appointment/css/appointment.css — not loaded on any other page. */
