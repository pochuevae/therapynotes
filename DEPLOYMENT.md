# 🚀 Railway Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Telegram Bot Token** - From @BotFather
4. **OpenAI API Key** - From OpenAI platform

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with all the files we created.

## Step 2: Deploy to Railway

### 2.1 Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect it's a Node.js app

### 2.2 Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically add the `DATABASE_URL` environment variable

### 2.3 Configure Environment Variables

In your Railway project, go to "Variables" tab and add:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_actual_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
NODE_ENV=production

# Mini App Configuration
MINI_APP_URL=https://your-railway-app.railway.app
WEBHOOK_URL=https://your-railway-app.railway.app

# Security
JWT_SECRET=your_random_secret_string
```

### 2.4 Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or click "Deploy" in the Railway dashboard
3. Wait for the build to complete

## Step 3: Configure Telegram Bot

### 3.1 Set Webhook

Once deployed, your bot will automatically set the webhook to:
```
https://your-railway-app.railway.app/webhook
```

### 3.2 Configure Mini App

1. Go to [@BotFather](https://t.me/botfather)
2. Send `/myapps`
3. Select your bot
4. Send `/newapp` or edit existing app
5. Set the URL to: `https://your-railway-app.railway.app`

## Step 4: Test Your Deployment

### 4.1 Test Bot
1. Find your bot in Telegram
2. Send `/start`
3. Send a voice message
4. Check if it creates a journal entry

### 4.2 Test Mini App
1. Open your bot
2. Click on the Mini App button
3. Test creating and editing entries

## Step 5: Monitor and Debug

### 5.1 Check Logs
- Go to Railway dashboard
- Click on your service
- Check "Deployments" tab for logs

### 5.2 Health Check
- Visit: `https://your-railway-app.railway.app/api/health`
- Should return: `{"status":"OK","timestamp":"...","uptime":...}`

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check if all dependencies are in `package.json`
   - Ensure `postinstall` script is present

2. **Database Connection Error**
   - Verify `DATABASE_URL` is set in Railway
   - Check if PostgreSQL service is running

3. **Bot Not Responding**
   - Check webhook URL is correct
   - Verify `TELEGRAM_BOT_TOKEN` is set
   - Check Railway logs for errors

4. **Mini App Not Loading**
   - Verify `MINI_APP_URL` is set correctly
   - Check if React build completed successfully

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Restart service
railway service restart
```

## Production Considerations

### 1. Custom Domain (Optional)
- Add custom domain in Railway settings
- Update `MINI_APP_URL` and `WEBHOOK_URL`
- Update Telegram bot webhook

### 2. File Storage
- Railway provides persistent disk storage
- Files are stored in `./uploads` directory
- Consider S3 for larger scale

### 3. Monitoring
- Set up Railway alerts
- Monitor database usage
- Track API usage (OpenAI)

### 4. Scaling
- Railway auto-scales based on traffic
- Monitor resource usage
- Upgrade plan if needed

## Security Checklist

- [ ] `JWT_SECRET` is a strong random string
- [ ] `TELEGRAM_BOT_TOKEN` is kept secret
- [ ] `OPENAI_API_KEY` is secure
- [ ] HTTPS is enabled (Railway default)
- [ ] Rate limiting is active
- [ ] CORS is configured properly

## Cost Optimization

- Railway has a generous free tier
- Monitor usage in Railway dashboard
- Consider upgrading only when needed
- Optimize OpenAI API usage

---

🎉 **Your Therapy Journal app is now live on Railway!**

Visit your app at: `https://your-railway-app.railway.app`
