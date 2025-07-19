# Cloudflare Settings Guide for BaddBeatz

## Overview
Your BaddBeatz project is configured to use Cloudflare Workers with Wrangler 4.25.0. This guide covers all Cloudflare settings and deployment options.

## Current Configuration Analysis

### Your `wrangler.toml` Setup:
- **Project Name**: `baddbeatz`
- **Custom Domains**: `baddbeatz.nl` and `www.baddbeatz.nl`
- **KV Storage**: Configured for rate limiting
- **Environments**: Development and Production

## Essential Cloudflare Commands

### 1. Authentication & Setup
```bash
# Login to Cloudflare (if not already done)
wrangler auth login

# Verify your account
wrangler whoami

# List your zones/domains
wrangler zone list
```

### 2. Deployment Commands
```bash
# Deploy to development
wrangler deploy --env development

# Deploy to production
wrangler deploy --env production

# Deploy with specific name
wrangler deploy --name baddbeatz

# Preview before deploying
wrangler dev
```

### 3. Domain Management
```bash
# Add custom domain (if not already configured)
wrangler custom-domains add baddbeatz.nl

# List custom domains
wrangler custom-domains list

# Remove custom domain
wrangler custom-domains delete baddbeatz.nl
```

### 4. KV Storage Management
```bash
# List KV namespaces
wrangler kv:namespace list

# Create new KV namespace
wrangler kv:namespace create "RATE_LIMIT"

# Put data in KV
wrangler kv:key put --binding=RATE_LIMIT "user:123" "10"

# Get data from KV
wrangler kv:key get --binding=RATE_LIMIT "user:123"

# List all keys
wrangler kv:key list --binding=RATE_LIMIT
```

### 5. Secrets Management
```bash
# Set OpenAI API key (as configured in your wrangler.toml)
wrangler secret put OPENAI_API_KEY

# List all secrets
wrangler secret list

# Delete a secret
wrangler secret delete OPENAI_API_KEY
```

### 6. Environment Variables
```bash
# Set environment variable
wrangler vars set MY_VAR "my_value"

# List environment variables
wrangler vars list

# Delete environment variable
wrangler vars delete MY_VAR
```

## Cloudflare Dashboard Settings

### 1. Workers & Pages Dashboard
- **URL**: https://dash.cloudflare.com/workers
- **Functions**: Deploy, monitor, and manage your Workers
- **Settings**: Configure triggers, environment variables, and KV bindings

### 2. DNS Settings
- **URL**: https://dash.cloudflare.com/[account-id]/[zone-id]/dns
- **Configure**: A, AAAA, CNAME records for your domains
- **Workers Routes**: Set up routing patterns

### 3. Security Settings
- **SSL/TLS**: Configure encryption settings
- **Firewall**: Set up security rules
- **Rate Limiting**: Configure request limits (works with your KV setup)

## Deployment Workflow

### Development Deployment:
```bash
# 1. Test locally first
wrangler dev

# 2. Deploy to development environment
wrangler deploy --env development

# 3. Test at: https://baddbeatz-dev.[your-subdomain].workers.dev
```

### Production Deployment:
```bash
# 1. Deploy to production
wrangler deploy --env production

# 2. Your site will be available at:
# - https://baddbeatz.nl
# - https://www.baddbeatz.nl
```

## Advanced Configuration Options

### 1. Update Compatibility Date
```bash
# Update to latest compatibility date
wrangler compatibility-date update
```

### 2. Add More Routes
Edit your `wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "baddbeatz.nl/*", custom_domain = true },
  { pattern = "www.baddbeatz.nl/*", custom_domain = true },
  { pattern = "api.baddbeatz.nl/*", custom_domain = true }
]
```

### 3. Configure Caching
```toml
[site]
bucket = "./dist"
# Add cache control
[site.cache]
browser_ttl = 86400
edge_ttl = 86400
```

### 4. Add More KV Namespaces
```toml
[[kv_namespaces]]
binding = "USER_DATA"
id = "your-namespace-id"
preview_id = "preview-namespace-id"

[[kv_namespaces]]
binding = "ANALYTICS"
id = "another-namespace-id"
preview_id = "another-preview-id"
```

## Monitoring & Debugging

### 1. View Logs
```bash
# Real-time logs
wrangler tail

# Logs for specific environment
wrangler tail --env production

# Filter logs
wrangler tail --format pretty
```

### 2. Analytics
```bash
# View analytics
wrangler analytics

# Specific time range
wrangler analytics --since 2024-01-01 --until 2024-01-31
```

### 3. Performance Monitoring
- **Dashboard**: https://dash.cloudflare.com/workers/analytics
- **Metrics**: Request count, CPU time, errors
- **Real User Monitoring**: Available in dashboard

## Security Best Practices

### 1. Environment Variables
```bash
# Never commit secrets to git
# Use wrangler secrets for sensitive data
wrangler secret put DATABASE_URL
wrangler secret put API_KEY
```

### 2. Rate Limiting (Your KV Setup)
```javascript
// Example rate limiting with your KV binding
const rateLimitKey = `rate_limit:${clientIP}`;
const currentCount = await RATE_LIMIT.get(rateLimitKey);
if (currentCount && parseInt(currentCount) > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### 3. CORS Configuration
```javascript
// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://baddbeatz.nl',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

## Troubleshooting Common Issues

### 1. Deployment Errors
```bash
# Check wrangler configuration
wrangler config list

# Validate wrangler.toml
wrangler validate

# Check account permissions
wrangler whoami
```

### 2. Domain Issues
```bash
# Verify DNS settings
nslookup baddbeatz.nl

# Check custom domain status
wrangler custom-domains list
```

### 3. KV Issues
```bash
# Test KV access
wrangler kv:key list --binding=RATE_LIMIT

# Check KV namespace IDs
wrangler kv:namespace list
```

## Quick Start Commands

### First Time Setup:
```bash
# 1. Login to Cloudflare
wrangler auth login

# 2. Deploy to development
wrangler deploy --env development

# 3. Test your site
wrangler dev

# 4. Deploy to production when ready
wrangler deploy --env production
```

### Daily Development:
```bash
# Start local development
wrangler dev

# Deploy changes
wrangler deploy --env development

# Check logs
wrangler tail --env development
```

## Support Resources

- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Workers Docs**: https://developers.cloudflare.com/workers/
- **Community**: https://community.cloudflare.com/
- **Status**: https://www.cloudflarestatus.com/

Your BaddBeatz project is now ready for Cloudflare deployment with the updated Wrangler 4.25.0!
