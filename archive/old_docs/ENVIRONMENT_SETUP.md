# Environment Setup Guide

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual API keys:**
   ```bash
   # Use your preferred editor
   notepad .env  # Windows
   nano .env     # Linux/Mac
   ```

## Required API Keys

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. **Important**: Don't set HTTP referrer restrictions for server-side usage
6. Add to `.env`: `YOUTUBE_API_KEY=your_key_here`

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

### Google Gemini AI (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add to `.env`: `GOOGLE_CLIENT_ID=your_client_id_here`

## Security Notes

- ✅ `.env` is in `.gitignore` - your secrets won't be committed
- ✅ Use `.env.example` as a template for new deployments
- ✅ Never commit actual API keys to version control
- ✅ Use environment variables in production deployments

## Deployment

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run the application
python server.py
```

### Production Deployment
Set environment variables directly in your hosting platform:
- **Heroku**: Use `heroku config:set KEY=value`
- **Vercel**: Add in project settings
- **Railway**: Add in environment variables section
- **Docker**: Use `-e` flags or docker-compose environment section

## Troubleshooting

### YouTube API Issues
- **403 Forbidden**: Check if API key has referrer restrictions
- **Quota Exceeded**: Check your daily quota in Google Cloud Console

### OpenAI API Issues
- **401 Unauthorized**: Verify API key is correct and active
- **Rate Limited**: Check your usage limits

### Database Issues
- SQLite database is created automatically in `data/app.db`
- No PostgreSQL setup required (psycopg2-binary removed)
