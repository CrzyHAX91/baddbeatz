# DJ Portfolio Website - Deployment Instructions

This is a static DJ portfolio website built with HTML, CSS, and JavaScript. It features a cyberpunk theme with embedded music players, categorization, tracklists, download options, call to action buttons, and a contact form.

## Deployment on Cloudflare Pages

Follow these steps to deploy the website on Cloudflare Pages:

1. **Prepare your project:**
   - Ensure all website files (HTML, CSS, JS, assets) are in the `baddbeatz` directory.
   - The site is fully static and requires no server-side processing.

2. **Push to a Git repository:**
   - Create a repository on GitHub, GitLab, or Bitbucket.
   - Commit and push the contents of the `baddbeatz` folder to the repository.

3. **Create a Cloudflare Pages project:**
   - Log in to your Cloudflare dashboard.
   - Navigate to the Pages section and click "Create a project".
   - Connect your Git repository to Cloudflare Pages.

4. **Configure build settings:**
   - Leave the build command empty (no build step needed).
   - Set the build output directory to the root folder (`/` or `baddbeatz` depending on your repo structure).

5. **Deploy:**
   - Cloudflare Pages will automatically build and deploy your site.
   - You will receive a live URL to access your DJ portfolio.

6. **Update and redeploy:**
   - Push any future changes to your Git repository.
   - Cloudflare Pages will automatically redeploy the updated site.

## Local Testing

To test the site locally, run the following command inside the `baddbeatz` directory:

```bash
python3 server.py
```

Then open `http://localhost:8000` in your browser.

## Contact

For any questions or support, please contact the developer.

---
This document provides all necessary steps to deploy and maintain your DJ portfolio website on Cloudflare Pages.
