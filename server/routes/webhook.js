const express = require('express');
const { processVoiceMessage } = require('../services/voiceProcessor');

const router = express.Router();

// Webhook endpoint for Telegram bot
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    
    if (message.voice) {
      // Handle voice message
      await processVoiceMessage(req.app.locals.bot, message);
    } else if (message.text === '/start') {
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

      await req.app.locals.bot.sendMessage(chatId, welcomeText);
    } else {
      await req.app.locals.bot.sendMessage(chatId, 'Отправьте голосовое сообщение для создания записи в дневнике.');
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
});

module.exports = router;
