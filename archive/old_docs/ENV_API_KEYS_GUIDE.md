# 🔐 COMPLETE API KEYS MANAGEMENT GUIDE

## 📋 **OVERVIEW**

All API keys and sensitive configuration should be stored in the `.env` file for security and easy management. This guide covers all API keys needed for the BaddBeatz website.

---

## 🔑 **GOOGLE OAUTH2 - CONFIGURED**

### **✅ Already Provided**
```env
GOOGLE_CLIENT_ID=621913429292-c5pjgr6297cj5psefrcvmbebo7umv8lj.apps.googleusercontent.com
```

### **⏳ Still Needed**
```env
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**How to get Google Client Secret:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Copy the Client Secret

---

## 🎵 **YOUTUBE API KEY**

### **Current Usage**
- Loading YouTube videos on homepage
- Fetching channel content
- Video embeds and playlists

### **Configuration**
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**How to get YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create API Key in Credentials
4. Restrict key to YouTube Data API v3

---

## 🤖 **AI CHAT API KEYS**

### **Current AI Features**
- Premium AI chat on homepage
- Intelligent responses about DJ services
- Fallback responses for various topics

### **Configuration Options**
```env
# OpenAI (ChatGPT)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**Recommendation**: Start with OpenAI for best results

---

## 🔐 **OAUTH2 PROVIDERS**

### **GitHub OAuth2**
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

**Setup:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create New OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/auth/github/callback`

### **Discord OAuth2**
```env
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
```

**Setup:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Go to OAuth2 section
4. Add redirect URL: `https://yourdomain.com/auth/discord/callback`

---

## 🌐 **SOCIAL MEDIA INTEGRATION**

### **SoundCloud**
```env
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
```

**Current Usage**: SoundCloud embeds on homepage and music page

### **Instagram (Optional)**
```env
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
```

**Potential Use**: Display latest Instagram posts in gallery

### **Twitter/X (Optional)**
```env
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
```

**Potential Use**: Tweet integration and social sharing

---

## ☁️ **CLOUDFLARE WORKERS**

### **Current Setup**
The project includes Cloudflare Workers configuration in `wrangler.toml`

### **Configuration**
```env
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
```

**Usage**: Edge computing, caching, and performance optimization

---

## 📧 **EMAIL CONFIGURATION**

### **Contact Form & Notifications**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=baddbeatzbookings@outlook.com
SMTP_PASSWORD=your_email_app_password_here
```

**Setup for Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password (not regular password)

---

## 💳 **PAYMENT PROCESSING (Future)**

### **Stripe (Recommended)**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### **PayPal**
```env
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

**Use Cases**: Merchandise sales, booking deposits, premium subscriptions

---

## 📊 **ANALYTICS & MONITORING**

### **Google Analytics**
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### **Error Tracking**
```env
SENTRY_DSN=your_sentry_dsn_here
```

**Benefits**: Track website performance, user behavior, and errors

---

## 🗄️ **DATABASE & STORAGE**

### **Current Setup**
```env
DB_PATH=data/app.db
DATABASE_URL=sqlite:///data/app.db
```

### **Cloud Storage (Optional)**
```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_S3_BUCKET=baddbeatz-assets
AWS_REGION=us-east-1
```

**Use Cases**: Store music files, images, and user uploads

---

## 🔧 **FLASK APPLICATION SETTINGS**

### **Essential Configuration**
```env
FLASK_ENV=development
FLASK_SECRET_KEY=your_super_secret_key_here
PORT=8000
MAX_CONTENT_LENGTH=16777216
```

### **Security Settings**
```env
RATE_LIMIT_STORAGE_URL=memory://
```

---

## 📝 **SETUP INSTRUCTIONS**

### **1. Copy Template**
```bash
cp .env.template .env
```

### **2. Fill in Your Values**
Edit `.env` file and replace all `your_*_here` placeholders with actual values

### **3. Priority Order (Start with these)**
1. ✅ **Google OAuth2 Client Secret** (to complete OAuth setup)
2. **YouTube API Key** (for video content)
3. **OpenAI API Key** (for AI chat features)
4. **Email SMTP Settings** (for contact forms)

### **4. Optional (Add later)**
- GitHub/Discord OAuth2
- Social media integrations
- Payment processing
- Cloud storage

---

## 🔒 **SECURITY BEST PRACTICES**

### **✅ DO**
- Keep `.env` file in `.gitignore`
- Use strong, unique keys for each service
- Rotate keys regularly
- Use different keys for development/production
- Set appropriate API key restrictions

### **❌ DON'T**
- Commit `.env` to version control
- Share API keys in chat/email
- Use the same key across multiple projects
- Leave default/weak secret keys

---

## 🚀 **DEPLOYMENT CONSIDERATIONS**

### **Netlify Environment Variables**
For production deployment, add these in Netlify Dashboard:
1. Site Settings → Environment Variables
2. Add each key-value pair from your `.env` file
3. Deploy with updated environment variables

### **Local Development**
```bash
# Load environment variables
source .env

# Start development server
python server_improved.py
```

---

## 📊 **CURRENT STATUS**

### **✅ Configured**
- Google OAuth2 Client ID
- Flask application settings
- Database configuration
- Security settings

### **⏳ Needs Configuration**
- Google OAuth2 Client Secret
- YouTube API Key
- AI API Keys (OpenAI/Gemini)
- Email SMTP settings

### **🔮 Future Enhancements**
- Payment processing
- Cloud storage
- Advanced analytics
- Social media automation

---

## 🎯 **NEXT STEPS**

1. **Copy `.env.template` to `.env`**
2. **Add Google Client Secret** (highest priority)
3. **Configure YouTube API Key** (for video features)
4. **Set up AI API Key** (for chat features)
5. **Test all integrations**
6. **Deploy with environment variables**

---

*All API keys should be stored securely in the .env file*
*Never commit sensitive credentials to version control*
*Your Google OAuth2 Client ID is already configured and ready*
