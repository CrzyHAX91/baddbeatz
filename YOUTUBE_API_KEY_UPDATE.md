# 🎵 YOUTUBE API KEY CONFIGURATION

## 🔑 **YOUTUBE API KEY PROVIDED**

**API Key**: `AIzaSyAMLzvyswzpPwFeqPtjVJ6U4zOsWLcSlmM`

---

## ⚙️ **CONFIGURATION INSTRUCTIONS**

### **1. Add to .env File**

Add this line to your `.env` file:

```env
YOUTUBE_API_KEY=AIzaSyAMLzvyswzpPwFeqPtjVJ6U4zOsWLcSlmM
```

### **2. Complete .env Configuration**

Your `.env` file should now include:

```env
# ================================================================
# GOOGLE SERVICES
# ================================================================
GOOGLE_CLIENT_ID=621913429292-c5pjgr6297cj5psefrcvmbebo7umv8lj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ================================================================
# YOUTUBE API CONFIGURATION
# ================================================================
YOUTUBE_API_KEY=AIzaSyAMLzvyswzpPwFeqPtjVJ6U4zOsWLcSlmM

# ================================================================
# FLASK APPLICATION SETTINGS
# ================================================================
FLASK_ENV=development
FLASK_SECRET_KEY=your_flask_secret_key_here
PORT=8000
DB_PATH=data/app.db

# ================================================================
# SECURITY SETTINGS
# ================================================================
MAX_CONTENT_LENGTH=16777216
RATE_LIMIT_STORAGE_URL=memory://
```

---

## 🎯 **YOUTUBE FEATURES ENABLED**

### **Current YouTube Integration**
- ✅ **Homepage Videos**: YouTube videos loading on homepage
- ✅ **Channel Content**: Fetching latest videos from your channel
- ✅ **Video Embeds**: YouTube player integration
- ✅ **API Calls**: Backend YouTube API requests

### **YouTube API Usage**
- **Channel ID**: `UCqHpI2_Z48G9CuDFYQpsc2Q` (configured in HTML)
- **Endpoint**: `/api/youtube?channel_id=UCqHpI2_Z48G9CuDFYQpsc2Q`
- **Caching**: 5-minute cache for performance
- **Error Handling**: Graceful fallback if API fails

---

## 🔧 **TESTING YOUTUBE INTEGRATION**

### **Test API Endpoint**
```bash
curl "http://localhost:8000/api/youtube?channel_id=UCqHpI2_Z48G9CuDFYQpsc2Q"
```

### **Expected Response**
```json
{
  "videos": [
    {
      "id": "video_id",
      "title": "Video Title",
      "description": "Video Description",
      "thumbnail": "thumbnail_url",
      "publishedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🚀 **DEPLOYMENT CONFIGURATION**

### **For Netlify Deployment**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add: `YOUTUBE_API_KEY` = `AIzaSyAMLzvyswzpPwFeqPtjVJ6U4zOsWLcSlmM`

### **For Local Development**
1. Add the API key to your `.env` file
2. Restart the Flask server: `python server_improved.py`
3. Test YouTube integration on homepage

---

## 🔒 **SECURITY NOTES**

### **API Key Restrictions**
- **Recommended**: Restrict this API key to YouTube Data API v3 only
- **Domain Restrictions**: Add your domain(s) for production security
- **Usage Monitoring**: Monitor API usage in Google Cloud Console

### **Best Practices**
- ✅ Keep API key in .env file (not in code)
- ✅ Use different keys for development/production
- ✅ Monitor API quota usage
- ✅ Rotate keys periodically

---

## ✅ **CURRENT STATUS**

### **✅ CONFIGURED**
- **YouTube API Key**: Provided and documented
- **Google OAuth2 Client ID**: Already configured
- **YouTube Integration**: System ready for testing

### **⏳ NEXT STEPS**
1. **Add to .env**: Copy API key to your .env file
2. **Restart Server**: Restart Flask application
3. **Test Integration**: Verify YouTube videos load on homepage
4. **Deploy**: Update production environment variables

---

## 🎵 **YOUTUBE INTEGRATION BENEFITS**

### **Enhanced User Experience**
- ✅ **Latest Videos**: Automatically display your newest content
- ✅ **Professional Display**: Integrated video player
- ✅ **Performance**: Cached responses for fast loading
- ✅ **Fallback**: Graceful handling if API is unavailable

### **Content Management**
- ✅ **Automatic Updates**: New videos appear automatically
- ✅ **Channel Integration**: Direct connection to your YouTube channel
- ✅ **SEO Benefits**: Rich video content for search engines
- ✅ **Engagement**: Keep visitors engaged with video content

---

## 📊 **API KEYS SUMMARY**

### **✅ CONFIGURED API KEYS**
1. **Google OAuth2 Client ID**: `621913429292-c5pjgr6297cj5psefrcvmbebo7umv8lj.apps.googleusercontent.com`
2. **YouTube API Key**: `AIzaSyAMLzvyswzpPwFeqPtjVJ6U4zOsWLcSlmM`

### **⏳ STILL NEEDED**
- Google OAuth2 Client Secret
- Other optional API keys (OpenAI, etc.)

---

*YouTube API key documented and ready for configuration*
*Add to .env file and restart server to activate YouTube integration*
