# Vercel Environment Variables Setup

## Quick Setup Guide

### Option 1: Vercel Dashboard (Recommended)

1. **Go to your project**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click your PE Analyser project**
3. **Go to Settings tab**
4. **Click "Environment Variables" in left sidebar**
5. **Add these variables**:

```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development

Name: REACT_APP_API_URL
Value: (leave empty)
Environment: Production, Preview, Development
```

### Option 2: Vercel CLI

```bash
# Add NODE_ENV
vercel env add NODE_ENV
# Enter: production

# Add REACT_APP_API_URL (optional)
vercel env add REACT_APP_API_URL
# Enter: (leave empty for relative URLs)
```

### Option 3: .env.local file (for local development)

Create a file called `.env.local` in your project root:

```env
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5001
```

## What These Variables Do

- **NODE_ENV**: Tells React if it's in production or development mode
- **REACT_APP_API_URL**: Overrides the API base URL (leave empty for relative URLs in production)

## After Adding Variables

1. **Redeploy your project** (Vercel will automatically redeploy)
2. **Check the console** - you should see:
   - `Environment: production`
   - `API Base URL: relative`
   - Successful API calls

## Troubleshooting

If you still see localhost errors:
1. Make sure you added the environment variables
2. Redeploy the project
3. Clear browser cache
4. Check the browser console for the new logs 