# BaddBeatz Website - TheBadGuy (TBG)

This is the static portfolio website for **TheBadGuy (TBG)** – a high-energy underground DJ blending house, techno, hardstyle, and uptempo styles. This site is built to be deployed on **GitHub Pages**.

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
```

The `docs/` directory used for GitHub Pages is generated from these source files using the `npm run build-docs` script.

---

## 📦 Dependencies
---

## 🌐 Deploy to GitHub Pages

**Prerequisites:** The root directory contains the source HTML files. The GitHub Actions workflow at `.github/workflows/pages.yml` copies them into `docs/` and publishes that folder automatically.

1. Push your changes to the `main` branch.
2. Run `npm run build-docs` locally if you want to preview the `docs/` folder. The workflow runs this command automatically.
3. Enable GitHub Pages in the repository settings and choose **GitHub Actions** as the source.
4. Once the workflow finishes, visit the URL shown in the job output to view your site.


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
Before you deploy the worker, provide your OpenAI API key as a secret so it can
contact the API:

```bash
wrangler secret put OPENAI_API_KEY
```

You can also set `OPENAI_API_KEY` in the Cloudflare dashboard. The key is not
stored in `wrangler.toml` to keep credentials out of version control. The
frontend calls `/api/ask`, which the worker proxies to OpenAI.


## 🛠 Local Development

Install the project dependencies:

```bash
npm ci
pip install -r requirements-dev.txt
```

Start the local development server:

```bash
python3 server.py
```

You can override the default port by setting the `PORT` environment variable.

### Running Tests

- JavaScript tests:

```bash
npm test
```

- Python tests:

```bash
pytest
```

## GitHub Pages Option

If you prefer using GitHub Pages, place the site files inside a `docs/` folder and enable Pages from that directory (see `DEPLOYMENT_GITHUB.md`). The `/api/ask` worker should still be deployed on Cloudflare or another serverless platform so the chat feature continues to function.
