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

The `docs/` directory used for GitHub Pages is generated automatically with `npm run build-docs` and should not be committed. Running `npm test` will build this folder automatically if it's missing.

---

### Importing Local Assets

If you already have images, CSS, or JavaScript files saved elsewhere (for example on
Windows at `C:\Users\Behee\OneDrive\Bureaublad\Website bestanden`), you can copy
them into this project automatically. Run the helper script and provide the path
to your asset folder:

```bash
python3 scripts/import_assets.py "C:\Users\Behee\OneDrive\Bureaublad\Website bestanden"
```

Files matching common image, CSS, and JS extensions will be placed in the
appropriate subfolders under `assets/`.

---

## 📦 Dependencies
---

## 🌐 Deploy to GitHub Pages

**Prerequisites:** The root directory contains the source HTML files. The GitHub Actions workflow at `.github/workflows/pages.yml` copies them into `docs/` and publishes that folder automatically.

1. Push your changes to the `main` branch.
2. Run `npm run build-docs` locally to generate the `docs/` folder for preview (no need to commit it). The workflow runs this command automatically.
3. Enable GitHub Pages in the repository settings and choose **GitHub Actions** as the source.
4. Once the workflow finishes, visit the URL shown in the job output to view your site.
5. After pointing your DNS records to GitHub, set **baddbeatz.nl** as the custom domain under **Settings → Pages**.


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

For local development, copy `.env.example` to `.env` and place your OpenAI key
inside. `worker_logic.py` and the worker script fall back to the
`OPENAI_API_KEY` environment variable when not running on Cloudflare.

If you'd like to experiment with Google's Gemini models locally, install
`gemini-cli` and set `GEMINI_API_KEY` in your `.env` file. The helper script
`gemini_logic.py` shows how to call the API using Python.

For open source models, install the `transformers` package and set `HF_MODEL` to your preferred model name (defaults to `sshleifer/tiny-gpt2`).
Text generation models also need a backend like **PyTorch** or **TensorFlow**. Install one with `pip install torch` (or `pip install tensorflow`).
The helper module `huggingface_logic.py` demonstrates using a Hugging Face pipeline. See the [PyTorch install guide](https://pytorch.org/get-started/locally/) for details.

Requests to the OpenAI API use a 10-second timeout. If the API does not respond
within this window, `worker_logic.ask` will raise a
`requests.exceptions.Timeout` error.

To protect the API from abuse, create a KV namespace for rate limiting:

```bash
wrangler kv:namespace create RATE_LIMIT
```

Add the namespace to `wrangler.toml` so the Worker can access it.

Before deploying, replace the placeholder `id` and `preview_id` values in
`wrangler.toml` with your real KV namespace IDs.

### AI Response Disclaimer

The "Ask the DJ" feature relies on AI to generate replies. These answers may
contain inaccuracies or other errors, so treat them as informational rather
than professional advice.

### Environment Variables

- `OPENAI_API_KEY` – required by the Cloudflare Worker and `worker_logic.py`.
- `GEMINI_API_KEY` – optional key for using `gemini_logic.py`. See the gemini-cli documentation for details
- `HF_MODEL` – optional Hugging Face model name for `huggingface_logic.py`.
- `PORT` – optional port for the Flask app (defaults to `8000`).
- `DB_PATH` – optional path to the SQLite database file used by the Flask app.


## 🛠 Local Development

Install the project dependencies:

```bash
npm ci
pip install -r requirements-dev.txt
```

Create a `.env` file for your API key:

```bash
cp .env.example .env
```

Start the Flask development server:

```bash
python3 app.py
```

The server reads `PORT` and `DB_PATH` from the environment. `DB_PATH` points to
the SQLite database file (defaults to `data/app.db`).

### Running Tests

Install the dependencies first:

```bash
npm ci
pip install -r requirements-dev.txt
```
The development requirements include **Flask**, **google-generativeai**, and
other libraries needed for the test suite.

- JavaScript tests:

Run `npm ci` before executing `npm test`. The test command automatically generates the `docs/` folder if it's not present:

```bash
npm test
```

- Python tests:

```bash
pytest
```

## GitHub Pages Option

If you prefer using GitHub Pages, generate the `docs/` folder with `npm run build-docs` and enable Pages from that directory (see `DEPLOYMENT_GITHUB.md`). There's no need to commit `docs/`. The `/api/ask` worker should still be deployed on Cloudflare or another serverless platform so the chat feature continues to function.

## Flask Backend Deployment

1. Install the production dependencies:

```bash
pip install -r requirements.txt
```

2. Initialize the SQLite database (optional path via `DB_PATH`):

```bash
python3 scripts/init_db.py
```

3. Run the application. It listens on `PORT` (default `8000`) and uses the database file defined in `DB_PATH`:

```bash
python3 app.py
```

Deploy this app to any VM or container platform that can run Python 3. Ensure the chosen host exposes the configured `PORT` and persists the database file. The Cloudflare Worker defined in `wrangler.toml` should remain deployed to handle `/api/ask` requests.

## 🔧 Troubleshooting

### psycopg2 Installation Issues

If you encounter an error such as:
```
python setup.py build_ext --pg-config /path/to/pg_config build ...
```
this may be because the system is attempting to build psycopg2 from source (which requires PostgreSQL's `pg_config`).  

**Solution:**  
- Ensure you are installing the binary package version by running:  
  ```
  pip install -r requirements.txt
  ```
- If necessary, remove any source-installed psycopg2 using:  
  ```
  pip uninstall psycopg2
  ```
Then try reinstalling. Our project uses **psycopg2-binary** (version 2.9.9) to avoid these build issues.

### Common Development Issues

- **Port already in use:** If port 8000 is occupied, set a different `PORT` environment variable
- **Database errors:** Ensure the `data/` directory exists and is writable
- **Missing dependencies:** Always run `pip install -r requirements.txt` after pulling updates
