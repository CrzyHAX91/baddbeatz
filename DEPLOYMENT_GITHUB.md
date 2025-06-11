# Deploying to GitHub Pages

This project can also be served from **GitHub Pages**. The easiest option is to use the `docs/` folder as the publishing source.

## 1. Prepare the `docs/` folder

1. Create a new folder named `docs` in the repository root.
2. Copy all static site files (HTML, CSS, JS, assets) into this `docs` directory.
3. Commit and push the changes to your repository.

After this step, your repo structure should look similar to:

```
/ (repo root)
├── docs/
│   ├── index.html
│   ├── about.html
│   ├── ...
```

## 2. Enable GitHub Pages

1. Open your repository on GitHub.
2. Navigate to **Settings** → **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and set `/docs` as the folder.
5. Save. GitHub will build and serve your site from `https://<username>.github.io/<repo>/`.

## 3. Worker Endpoint

The chat functionality located at `/api/ask` relies on a Cloudflare Worker (or another serverless function). This worker should remain deployed separately on Cloudflare or any serverless platform of your choice and continue to proxy requests to OpenAI.


