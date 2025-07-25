#!/bin/bash

echo "🚀 Deploying PE Analyser to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Test the application"
echo "2. Upload a CSV file"
echo "3. Verify charts are working"
echo "4. Check the /health endpoint" 