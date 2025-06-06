# BaddBeatz Website - TheBadGuy (TBG)

This is the static portfolio website for **TheBadGuy (TBG)** – a high-energy underground DJ blending house, techno, hardstyle, and uptempo styles. This site is built to be deployed on **Cloudflare Pages**.

---

## 🚀 Project Structure

```
baddbeatz/
├── index.html
├── about.html
├── music.html
├── gallery.html
├── bookings.html
├── contact.html
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    ├── images/
    ├── audio/
```

---

## 🌐 Deploy to Cloudflare Pages

### 1. Login to [Cloudflare Pages](https://pages.cloudflare.com/)
### 2. Create a new project:
- Choose **"Direct Upload"**
- Upload the entire contents of the `baddbeatz/` folder

### 3. Set your custom domain:
- In your Cloudflare dashboard, go to **Pages > Settings > Custom Domains**
- Add: `baddbeatz.nl`

---

## 📬 Booking Form Setup

1. Go to [Formspree](https://formspree.io)
2. Create a form and copy your **form ID**
3. Replace the action URL in `bookings.html`:

```html
<form action="https://formspree.io/f/YOUR_ID_HERE" method="POST">
```

---

## 🎯 SEO & Meta Tags (Included)

- Page titles and descriptions are defined per page
- Basic accessibility tags and alt-texts are included

---

## 🎨 Style & Fonts

- Fonts: [Orbitron](https://fonts.google.com/specimen/Orbitron) (headings), [Inter](https://fonts.google.com/specimen/Inter) (body)
- Theme: Dark neon aesthetic with bold accent colors
- Animations will be added in `/assets/js/main.js`

---

## ✅ To Do / Enhancements

- Add scroll animations
- Add hover effects (glow / pulse)
- Optimize images with WebP support
- Social preview meta tags (Open Graph / Twitter Cards)

---


## 🤖 AI Chat Setup

The homepage chat feature sends questions to a Cloudflare Worker endpoint.
Set your OpenAI API key as a secret so the worker can contact the API:

```bash
wrangler secret put OPENAI_API_KEY
```

Or configure the variable in the Cloudflare dashboard. The frontend calls
`/api/ask` which the worker proxies to OpenAI.


