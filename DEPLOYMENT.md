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

The Flask application in `server.py` can run on any VM or container platform.

### Prerequisites
1. Install Python 3 and run `pip install -r requirements.txt`.
2. **Important:** In case you encounter errors related to `pg_config` or building psycopg2 from source, ensure:
   - You have **not** installed the source version of psycopg2.
   - Uninstall any conflicting package by running:  
     ```
     pip uninstall psycopg2
     ```
   - Reinstall using the binary package as specified in `requirements.txt` (psycopg2-binary).

### OAuth2 Configuration
3. **Set up OAuth2 credentials** (required for login functionality):
   ```bash
   cp .env.example .env
   # Edit .env with your OAuth2 credentials
   ```
   See [OAUTH2_SETUP.md](OAUTH2_SETUP.md) for detailed OAuth2 provider setup instructions.

### Database Setup
4. Initialize the database with `python3 scripts/init_db.py` (optional `DB_PATH`).

### Environment Variables
5. Configure the following environment variables:
   ```bash
   # Required
   FLASK_SECRET_KEY=your_secure_secret_key
   PORT=8000
   DB_PATH=data/app.db
   
   # OAuth2 (see OAUTH2_SETUP.md)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   ```

### Start the Application
6. Expose the desired `PORT` and start the app with `python3 server.py`.

### Docker Deployment
When using Docker, copy the repository contents into an image based on
`python:3` and set the environment variables as needed:

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt

# Set environment variables
ENV FLASK_SECRET_KEY=your_production_secret_key
ENV PORT=8000
ENV DB_PATH=data/app.db

# OAuth2 credentials (use Docker secrets in production)
ENV GOOGLE_CLIENT_ID=your_google_client_id
ENV GOOGLE_CLIENT_SECRET=your_google_client_secret

EXPOSE 8000

CMD ["python3", "server.py"]
```

### Production Considerations
- Use HTTPS for all OAuth2 redirects
- Store secrets securely (not in environment variables)
- Set up proper logging and monitoring
- Configure reverse proxy (nginx/Apache) if needed
- Set up database backups for SQLite file

## Contact

For any questions or support, please contact the developer.

---
This document provides all necessary steps to deploy and maintain your DJ portfolio website on GitHub Pages.
