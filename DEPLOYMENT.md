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

To test the site locally, run the following command inside the `baddbeatz` directory:

```bash
python3 server.py
```

Then open `http://localhost:8000` in your browser.

## Contact

For any questions or support, please contact the developer.

---
This document provides all necessary steps to deploy and maintain your DJ portfolio website on GitHub Pages.
