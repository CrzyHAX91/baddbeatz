# OAuth2 Setup Guide

This guide will walk you through setting up OAuth2 authentication for Google, GitHub, and Discord providers.

## Prerequisites

1. Ensure you have the `.env` file created from `.env.example`
2. Your application should be running on `http://localhost:8000` for development

## 1. Google OAuth2 Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

### Step 2: Create OAuth2 Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Set the following:
   - **Name**: BaddBeatz OAuth2
   - **Authorized JavaScript origins**: `http://localhost:8000`
   - **Authorized redirect URIs**: `http://localhost:8000/api/auth/google/callback`

### Step 3: Configure Environment
1. Copy the **Client ID** and **Client Secret**
2. Update your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   ```

## 2. GitHub OAuth2 Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: BaddBeatz
   - **Homepage URL**: `http://localhost:8000`
   - **Authorization callback URL**: `http://localhost:8000/api/auth/github/callback`

### Step 2: Configure Environment
1. Copy the **Client ID** and **Client Secret**
2. Update your `.env` file:
   ```
   GITHUB_CLIENT_ID=your_actual_github_client_id
   GITHUB_CLIENT_SECRET=your_actual_github_client_secret
   ```

## 3. Discord OAuth2 Setup

### Step 1: Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Give it a name: "BaddBeatz"

### Step 2: Configure OAuth2
1. Go to **OAuth2** section in your application
2. Add redirect URI: `http://localhost:8000/api/auth/discord/callback`
3. Select scopes: `identify` and `email`

### Step 3: Configure Environment
1. Copy the **Client ID** and **Client Secret**
2. Update your `.env` file:
   ```
   DISCORD_CLIENT_ID=your_actual_discord_client_id
   DISCORD_CLIENT_SECRET=your_actual_discord_client_secret
   ```

## 4. Production Deployment

### Environment Variables for Production
When deploying to production, update the redirect URIs to match your domain:

**Google:**
- Authorized origins: `https://yourdomain.com`
- Redirect URI: `https://yourdomain.com/api/auth/google/callback`

**GitHub:**
- Homepage URL: `https://yourdomain.com`
- Callback URL: `https://yourdomain.com/api/auth/github/callback`

**Discord:**
- Redirect URI: `https://yourdomain.com/api/auth/discord/callback`

### Secure Environment Variables
```bash
# Production environment variables
FLASK_SECRET_KEY=generate_a_strong_random_key_for_production
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
DISCORD_CLIENT_ID=your_production_discord_client_id
DISCORD_CLIENT_SECRET=your_production_discord_client_secret
```

## 5. Testing OAuth2 Setup

### Local Testing
1. Restart your Flask server after updating `.env`
2. Visit `http://localhost:8000/login.html`
3. Try logging in with each OAuth2 provider
4. Verify successful redirect to file manager

### Troubleshooting
- **"invalid_client" error**: Check client ID/secret are correct
- **"redirect_uri_mismatch"**: Ensure redirect URIs match exactly
- **"access_denied"**: User cancelled authorization (normal behavior)

## 6. Security Best Practices

### Development
- Never commit `.env` file to version control
- Use different OAuth2 apps for development and production
- Regularly rotate client secrets

### Production
- Use environment variables or secure secret management
- Enable HTTPS for all OAuth2 redirects
- Monitor OAuth2 usage and failed attempts
- Set up proper logging for security events

## 7. Additional Features

### User Profile Integration
The OAuth2 system automatically:
- Stores user profile information (name, email, avatar)
- Links OAuth2 accounts to file upload/download permissions
- Displays user info in the file manager interface

### Multiple Provider Support
Users can:
- Choose their preferred login method
- Link multiple OAuth2 accounts to the same profile
- Fall back to traditional username/password if needed

## Support

If you encounter issues:
1. Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) file
2. Verify all redirect URIs are configured correctly
3. Ensure environment variables are loaded properly
4. Check server logs for detailed error messages
