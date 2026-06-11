# Dr. Quan & Associates – Static Website

A fully static HTML / CSS / JavaScript website for **Dr. Quan & Associates** eye clinics, built for easy hosting on any static host (EasyHosting, cPanel File Manager, etc.).

---

## File Structure

```
eye_clinic_static/
├── index.html          ← Main website (hero, stats, equipments, eye exams)
├── appointments.html   ← Appointment booking form (front-desk use)
├── style.css           ← All styles
├── script.js           ← All JavaScript (navbar, animations, counter)
├── images/             ← All images (copy of /public/images from React project)
│   ├── logos/
│   ├── textures/
│   ├── eyes.jpg
│   ├── optomap.jpg
│   ├── oct.jpg
│   ├── visual-field.jpg
│   └── …
└── README.md           ← This file
```

---

## How to Upload to EasyHosting

1. **Zip the folder** – right-click `eye_clinic_static` → *Send to → Compressed (zipped) folder*.
2. Log in to your **EasyHosting control panel** and open **File Manager**.
3. Navigate to your domain's `public_html` folder.
4. Click **Upload** and upload the zip file.
5. **Extract** the zip file in File Manager.
6. Move the extracted contents **directly into `public_html`** (so `index.html` is at `public_html/index.html`).
7. Visit your domain — the site is live.

> **Note:** No PHP, Node.js, or database is required. The site is 100% static.

---

## Pages

| Page | URL | Purpose |
|---|---|---|
| Home | `index.html` | Public-facing marketing site |
| Book Appointment | `appointments.html` | Front-desk booking form |

---

## Appointment Form

The booking form on `appointments.html` is a **front-desk tool** — it collects patient details visually but does **not** submit data anywhere automatically. No backend is required. Front desk staff fill it in and manage the data directly.

If you later want to wire up email submission, replace the `apptForm` submit handler in `script.js` with a service like [Formspree](https://formspree.io) or [EmailJS](https://www.emailjs.com).

---

## Customisation

| What to change | Where |
|---|---|
| Clinic name / tagline | `<header>` in both HTML files |
| Location list in form | `<select id="location">` in `appointments.html` |
| Counter numbers | `data-target` attributes on `.counter-card` in `index.html` |
| Colour palette | CSS variables at the top of `style.css` |
| Hero background image | `<img class="hero-bg">` in `index.html` |

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No build step or npm required.
