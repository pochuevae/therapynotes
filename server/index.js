require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import routes and services
const journalRoutes = require('./routes/journal');
const botRoutes = require('./routes/bot');
const healthRoutes = require('./routes/health');
const webhookRoutes = require('./routes/webhook');
const { initDatabase } = require('./database/init');
const { processVoiceMessage } = require('./services/voiceProcessor');

const app = express();
const PORT = process.env.PORT || 3001;

// Create necessary directories
const dirs = ['./data', './uploads', './uploads/images'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize Telegram Bot
const isProduction = process.env.NODE_ENV === 'production';
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: !isProduction // Use polling only in development
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database
initDatabase().catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});

// Make bot available to webhook routes
app.locals.bot = bot;

// Root health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Therapy Journal API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/bot', botRoutes);
app.use('/webhook', webhookRoutes); // Move webhook to /webhook path

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Telegram Bot Message Handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    if (msg.voice) {
      // Handle voice message
      await processVoiceMessage(bot, msg);
    } else if (msg.text === '/start') {
      // Welcome message
      const welcomeText = `Привет! Я бот для ведения терапевтического дневника. 

🎤 Отправьте голосовое сообщение, и я создам запись в дневнике с транскрипцией и кратким резюме.

📱 Или откройте приложение для просмотра и редактирования записей:
${process.env.MINI_APP_URL || 'https://your-domain.com'}

💡 Вы можете:
• Отправлять голосовые сообщения
• Просматривать все записи
• Редактировать и дополнять записи
• Добавлять изображения`;

      await bot.sendMessage(chatId, welcomeText);
    } else {
      await bot.sendMessage(chatId, 'Отправьте голосовое сообщение для создания записи в дневнике.');
    }
  } catch (error) {
    console.error('Bot message handler error:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при обработке сообщения. Попробуйте еще раз.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Catch all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Mini App доступен по адресу: ${process.env.MINI_APP_URL || 'http://localhost:3000'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 API health: http://localhost:${PORT}/api/health`);
  
  // Set webhook in production
  if (isProduction && process.env.WEBHOOK_URL) {
    bot.setWebHook(`${process.env.WEBHOOK_URL}/webhook`).then(() => {
      console.log('✅ Telegram webhook установлен');
    }).catch(err => {
      console.error('❌ Ошибка установки webhook:', err);
    });
  }
});

module.exports = { app, bot };
