const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const moment = require('moment-timezone');
const { runQuery, getQuery } = require('../database/init');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processVoiceMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const voiceFileId = msg.voice.file_id;
  
  try {
    // Send processing message
    const processingMsg = await bot.sendMessage(chatId, '🎤 Обрабатываю голосовое сообщение...');
    
    // Download voice file
    const file = await bot.getFile(voiceFileId);
    const fileName = `${uuidv4()}.ogg`;
    const filePath = path.join(__dirname, '../../uploads', fileName);
    
    // Download file
    const fileStream = fs.createWriteStream(filePath);
    const response = await fetch(file.file_path);
    response.body.pipe(fileStream);
    
    await new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
    
    // Update status
    await bot.editMessageText('📝 Транскрибирую аудио...', {
      chat_id: chatId,
      message_id: processingMsg.message_id
    });
    
    // Transcribe with Whisper
    const transcript = await transcribeAudio(filePath);
    
    // Update status
    await bot.editMessageText('🤖 Анализирую и создаю резюме...', {
      chat_id: chatId,
      message_id: processingMsg.message_id
    });
    
    // Generate summary with LLM
    const summaryData = await generateSummary(transcript);
    
    // Create journal entry
    const entryId = await createJournalEntry(userId, transcript, summaryData);
    
    // Clean up audio file
    fs.unlinkSync(filePath);
    
    // Send success message with deep link
    const miniAppUrl = process.env.MINI_APP_URL || 'http://localhost:3000';
    const deepLink = `${miniAppUrl}/entry/${entryId}`;
    
    const successMessage = `✅ Запись создана успешно!

📅 Дата: ${moment().tz('Europe/Lisbon').format('DD.MM.YYYY')}
📝 Резюме: ${summaryData.title}

🔗 Откройте запись в приложении: ${deepLink}

💡 Вы можете отредактировать дату, добавить текст или изображения в приложении.`;
    
    await bot.editMessageText(successMessage, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
      parse_mode: 'HTML'
    });
    
  } catch (error) {
    console.error('Voice processing error:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при обработке голосового сообщения. Попробуйте еще раз.');
  }
}

async function transcribeAudio(filePath) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: "auto"
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Ошибка транскрипции аудио');
  }
}

async function generateSummary(transcript) {
  try {
    const prompt = `Проанализируй следующую терапевтическую сессию и создай структурированное резюме в формате JSON:

Транскрипт: "${transcript}"

Создай JSON с полями:
{
  "title": "Краткий заголовок сессии (1-2 слова)",
  "summary": "Краткое резюме основных моментов (2-3 предложения)",
  "key_topics": ["список", "основных", "тем"],
  "emotions": ["эмоции", "которые", "проявлялись"],
  "insights": "Важные инсайты или выводы",
  "next_steps": "Рекомендации для следующих шагов"
}

Отвечай только JSON без дополнительного текста.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты помощник психолога, который анализирует терапевтические сессии и создает структурированные резюме."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    const summaryData = JSON.parse(response);
    
    return summaryData;
  } catch (error) {
    console.error('Summary generation error:', error);
    // Fallback to simple summary
    return {
      title: "Терапевтическая сессия",
      summary: transcript.substring(0, 200) + "...",
      key_topics: [],
      emotions: [],
      insights: "",
      next_steps: ""
    };
  }
}

async function createJournalEntry(userId, transcript, summaryData) {
  const date = moment().tz('Europe/Lisbon').format('YYYY-MM-DD');
  const title = summaryData.title || "Терапевтическая сессия";
  const summary = summaryData.summary || "";
  const tags = summaryData.key_topics ? summaryData.key_topics.join(', ') : "";
  const rawLlmJson = JSON.stringify(summaryData);
  
  const result = await runQuery(`
    INSERT INTO journal_entries 
    (telegram_user_id, date, title, summary, transcript, tags, raw_llm_json, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [userId, date, title, summary, transcript, tags, rawLlmJson, 'bot_voice']);
  
  return result.id;
}

module.exports = {
  processVoiceMessage,
  transcribeAudio,
  generateSummary
};
