#!/bin/bash

echo "🚀 Therapy Journal - Railway Deployment Script"
echo "=============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "✅ Railway CLI ready"

# Check if project exists
if [ -z "$RAILWAY_PROJECT_ID" ]; then
    echo "📋 Creating new Railway project..."
    railway init
else
    echo "📋 Using existing Railway project: $RAILWAY_PROJECT_ID"
fi

echo "🔧 Setting up environment variables..."
echo "Please make sure to set the following variables in Railway:"
echo ""
echo "Required:"
echo "- TELEGRAM_BOT_TOKEN"
echo "- OPENAI_API_KEY"
echo "- NODE_ENV=production"
echo ""
echo "Optional:"
echo "- JWT_SECRET"
echo "- TELEGRAM_BOT_USERNAME"

echo ""
echo "📦 Deploying to Railway..."
railway up

echo ""
echo "🎉 Deployment complete!"
echo "Check your Railway dashboard for the deployment URL"
echo ""
echo "Next steps:"
echo "1. Configure your Telegram bot webhook"
echo "2. Set up the Mini App URL in @BotFather"
echo "3. Test the bot and Mini App"
