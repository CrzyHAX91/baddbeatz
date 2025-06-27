# DJ Portfolio Website - Deployment Instructions

This is a static DJ portfolio website built with HTML, CSS, and JavaScript. It features a cyberpunk theme with embedded music players, categorization, tracklists, download options, call to action buttons, and a contact form.

## Deployment on GitHub Pages

Follow these steps to deploy the website on GitHub Pages:

1. **Prepare your project:**
   - Ensure all website files (HTML, CSS, JS, assets) are in the `baddbeatz` directory.
   - The site is fully static and requires no server-side processing.

2. **Push to a Git repository:**
   - Create a repository on GitHub, GitLab, or Bitbucket.
   - Commit and push the contents of the `baddbeatz` folder to the repository.

3. **Enable GitHub Pages:**
   - In your repository, go to **Settings → Pages**.
   - Choose **GitHub Actions** as the source.

4. **Deploy:**
   - Push commits to the `main` branch.
   - The workflow in `.github/workflows/pages.yml` publishes the `docs/` folder to GitHub Pages.

5. **Custom domain:**
   - After DNS is configured, set `baddbeatz.nl` as your custom domain in the Pages settings.

6. **Update and redeploy:**
   - Push any future changes to `main` and the site will redeploy automatically.

## Local Testing

To test the site locally with the Flask backend, run the following command inside the `baddbeatz` directory:

```bash
python3 app.py
```

Then open `http://localhost:8000` in your browser.

## Flask Backend on a VM or Container

The Flask application in `app.py` can run on any VM or container platform.

1. Install Python 3 and run `pip install -r requirements.txt`.
2. Initialize the database with `python3 scripts/init_db.py` (optional `DB_PATH`).
3. Expose the desired `PORT` and start the app with `python3 app.py`.

When using Docker, copy the repository contents into an image based on
`python:3` and set the `PORT` and `DB_PATH` environment variables as needed.

## Contact

For any questions or support, please contact the developer.

---
This document provides all necessary steps to deploy and maintain your DJ portfolio website on GitHub Pages.
