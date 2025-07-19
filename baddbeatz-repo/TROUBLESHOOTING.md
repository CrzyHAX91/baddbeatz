# Troubleshooting Guide

This document provides solutions to common issues you might encounter when setting up and running the BaddBeatz website project.

## psycopg2 Build Errors

### Problem
When installing dependencies, you might see an error like:
```
python setup.py build_ext --pg-config /path/to/pg_config build ...
```
This happens because the system is trying to compile psycopg2 from source, but the PostgreSQL client library (pg_config) isn't available.

### Recommended Fix
1. **Ensure you use the Binary Package**  
   Our dependencies define:
   ```
   psycopg2-binary==2.9.9  # Using binary distribution to avoid pg_config build errors
   ```
   This package does not require pg_config. Run:
   ```bash
   pip install -r requirements.txt
   ```

2. **Remove Conflicting Installations**  
   If you have previously installed psycopg2 (the source version), remove it:
   ```bash
   pip uninstall psycopg2
   ```

3. **Re-install Dependencies**  
   After uninstalling, reinstall using the provided requirements file:
   ```bash
   pip install -r requirements.txt
   ```

### Additional Notes for Linux Users

If you ever wish to build psycopg2 from source, you'll need to install the PostgreSQL development libraries. For example, on Ubuntu:
```bash
sudo apt-get install libpq-dev
```
But for our project, using the binary package is preferred.

## Common Development Issues

### Port Already in Use
**Problem:** Error message like "Address already in use" when starting the Flask server.

**Solution:**
- Check what's using port 8000:
  ```bash
  lsof -i :8000
  ```
- Kill the process or use a different port:
  ```bash
  PORT=8001 python3 server.py
  ```

### Database Errors
**Problem:** SQLite database errors or permission issues.

**Solutions:**
- Ensure the `data/` directory exists and is writable:
  ```bash
  mkdir -p data
  chmod 755 data
  ```
- Initialize the database:
  ```bash
  python3 scripts/init_db.py
  ```
- Check database path permissions:
  ```bash
  ls -la data/app.db
  ```

### Missing Dependencies
**Problem:** Import errors or missing modules.

**Solutions:**
- Always install from requirements files:
  ```bash
  pip install -r requirements.txt
  pip install -r requirements-dev.txt  # For development
  ```
- Use a virtual environment:
  ```bash
  python3 -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  ```

### AI Chat Features Not Working
**Problem:** The "Ask the DJ" feature returns errors.

**Solutions:**
- Check if API keys are set:
  ```bash
  echo $OPENAI_API_KEY
  echo $GEMINI_API_KEY
  ```
- Verify the `.env` file exists and contains your keys:
  ```bash
  cp .env.example .env
  # Edit .env and add your API keys
  ```
- Test the AI modules individually:
  ```bash
  python3 -c "from worker_logic import ask; print(ask('test'))"
  ```

### GitHub Pages Deployment Issues
**Problem:** Site not updating or showing 404 errors.

**Solutions:**
- Ensure the `docs/` folder is generated:
  ```bash
  npm run build-docs
  ```
- Check GitHub Actions workflow status in your repository
- Verify custom domain settings in repository Settings → Pages
- Clear browser cache and try again

### Node.js/npm Issues
**Problem:** npm commands failing or missing dependencies.

**Solutions:**
- Install Node.js dependencies:
  ```bash
  npm ci
  ```
- Clear npm cache if needed:
  ```bash
  npm cache clean --force
  ```
- Check Node.js version (requires Node 14+):
  ```bash
  node --version
  ```

## Environment Setup

### Recommended Development Environment
- Python 3.8 or higher
- Node.js 14 or higher
- Git for version control

### Virtual Environment Setup
```bash
# Create virtual environment
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements-dev.txt
```

### Environment Variables
Create a `.env` file in the project root:
```bash
# Copy example file
cp .env.example .env

# Edit with your values
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
PORT=8000
DB_PATH=data/app.db
```

## Getting Help

If you continue to experience issues:

1. Check the main [README.md](README.md) for setup instructions
2. Review the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-specific guidance
3. Search existing issues in the project repository
4. Create a new issue with:
   - Your operating system
   - Python version (`python3 --version`)
   - Node.js version (`node --version`)
   - Complete error message
   - Steps to reproduce the issue

## OAuth2 Setup Issues

### Problem: OAuth2 login buttons not working
**Solutions:**
1. **Set up OAuth2 credentials:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OAuth2 credentials
   ```

2. **Google OAuth2 Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth2 credentials
   - Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
   - Copy Client ID and Client Secret to `.env`

3. **GitHub OAuth2 Setup:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL: `http://localhost:8000/api/auth/github/callback`
   - Copy Client ID and Client Secret to `.env`

4. **Discord OAuth2 Setup:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to OAuth2 section
   - Add redirect URI: `http://localhost:8000/api/auth/discord/callback`
   - Copy Client ID and Client Secret to `.env`

### Problem: OAuth2 callback errors
**Solutions:**
- Ensure redirect URIs match exactly in OAuth provider settings
- Check that OAuth2 dependencies are installed:
  ```bash
  pip install authlib requests-oauthlib
  ```
- Verify Flask secret key is set in environment variables

## Performance Tips

- Use a virtual environment to avoid dependency conflicts
- Keep your dependencies updated but test thoroughly
- Monitor disk space for the SQLite database
- Use environment variables for configuration instead of hardcoding values
- Enable debug mode only in development (`FLASK_DEBUG=1`)
