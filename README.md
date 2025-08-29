# Терапевтический дневник - Telegram Mini App

Производственный MVP Telegram Mini App + Bot для ведения терапевтического дневника с голосовой записью, транскрипцией и ИИ-анализом.

## 🚀 Основные возможности

### 1. Голосовая запись → Транскрипт → Резюме → Запись в дневнике
- Отправка голосового сообщения боту
- Автоматическая транскрипция с помощью Whisper
- ИИ-анализ и создание структурированного резюме
- Создание записи в дневнике с датой (по умолчанию сегодня)

### 2. Создание и редактирование записей в приложении
- Ручное создание записей с текстом
- Редактирование даты, заголовка, резюме
- Добавление дополнительного текста ("дописать")
- Прикрепление изображений (до 5, PNG/JPG)

### 3. Просмотр дневника
- Группировка по месяцам, новые сверху
- Карточки с датой и кратким резюме
- Фильтрация по дате, тегам
- Поиск по заголовку/резюме/транскрипту
- Офлайн-кэширование (IndexedDB)

## 🛠 Технологический стек

### Backend
- **Node.js + Express** - сервер
- **SQLite** - база данных
- **node-telegram-bot-api** - Telegram Bot API
- **OpenAI API** - Whisper + GPT для анализа
- **Multer** - загрузка файлов
- **Moment.js** - работа с датами

### Frontend
- **React** - UI фреймворк
- **React Router** - навигация
- **Telegram Mini Apps** - интеграция с Telegram
- **LocalForage** - офлайн-кэширование
- **React Dropzone** - загрузка изображений
- **React DatePicker** - выбор даты
- **Lucide React** - иконки

## 📋 Требования

- Node.js 16+
- npm или yarn
- Telegram Bot Token
- OpenAI API Key

## 🔧 Установка и настройка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd therapy-journal
```

### 2. Установка зависимостей
```bash
npm run install:all
```

### 3. Настройка переменных окружения
Скопируйте `env.example` в `.env` и заполните необходимые значения:

```bash
cp env.example .env
```

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./data/therapy_journal.db

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Mini App Configuration
MINI_APP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhook

# Security
JWT_SECRET=your_jwt_secret_here
```

### 4. Создание Telegram Bot

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Создайте нового бота: `/newbot`
3. Получите токен и добавьте в `.env`
4. Настройте Mini App: `/newapp`
5. Укажите URL вашего приложения

### 5. Получение OpenAI API Key

1. Зарегистрируйтесь на [OpenAI](https://platform.openai.com/)
2. Создайте API ключ
3. Добавьте в `.env`

## 🚀 Запуск

### Разработка
```bash
npm run dev
```

Это запустит:
- Backend на порту 3001
- Frontend на порту 3000

### Продакшн

#### Локальный запуск
```bash
npm run build
npm start
```

#### Railway Deployment (Рекомендуется)
См. подробную инструкцию в [DEPLOYMENT.md](./DEPLOYMENT.md)

Быстрый деплой:
```bash
# 1. Установить Railway CLI
npm install -g @railway/cli

# 2. Войти в Railway
railway login

# 3. Создать проект
railway init

# 4. Настроить переменные окружения в Railway dashboard
# 5. Деплой
railway up
```

Или используйте скрипт:
```bash
./scripts/deploy.sh
```

## 📱 Использование

### 1. Голосовая запись через бота
1. Найдите вашего бота в Telegram
2. Отправьте голосовое сообщение
3. Бот обработает аудио и создаст запись
4. Получите ссылку на запись в приложении

### 2. Работа в Mini App
1. Откройте приложение через бота
2. Просматривайте записи, сгруппированные по месяцам
3. Создавайте новые записи вручную
4. Редактируйте существующие записи
5. Добавляйте изображения

### 3. Функции приложения
- **Поиск**: по заголовку, резюме, транскрипту
- **Фильтрация**: по тегам, датам
- **Редактирование**: изменение даты, заголовка, содержания
- **Изображения**: загрузка до 5 изображений на запись
- **Офлайн-режим**: кэширование данных локально

## 🗄 Структура базы данных

### journal_entries
- `id` - уникальный идентификатор
- `telegram_user_id` - ID пользователя Telegram
- `date` - дата сессии
- `title` - заголовок
- `summary` - резюме
- `transcript` - транскрипт (для голосовых записей)
- `content` - дополнительный текст
- `tags` - теги через запятую
- `raw_llm_json` - сырые данные от ИИ
- `source` - источник (bot_voice/manual)
- `created_at`, `updated_at` - временные метки

### entry_images
- `id` - уникальный идентификатор
- `entry_id` - ссылка на запись
- `file_path` - путь к файлу
- `file_name` - оригинальное имя файла
- `file_size` - размер файла
- `mime_type` - тип файла

### users
- `id` - уникальный идентификатор
- `telegram_user_id` - ID пользователя Telegram
- `username`, `first_name`, `last_name` - данные пользователя
- `created_at`, `last_activity` - временные метки

## 🔒 Безопасность

- Валидация входных данных
- Ограничение размера файлов
- Проверка типов файлов
- Rate limiting
- CORS настройки
- Helmet для защиты заголовков

## 📊 API Endpoints

### Journal
- `GET /api/journal/entries/:userId` - получить записи пользователя
- `GET /api/journal/entry/:id` - получить конкретную запись
- `POST /api/journal/entry` - создать новую запись
- `PUT /api/journal/entry/:id` - обновить запись
- `DELETE /api/journal/entry/:id` - удалить запись
- `POST /api/journal/entry/:id/images` - загрузить изображения
- `DELETE /api/journal/image/:imageId` - удалить изображение
- `GET /api/journal/tags/:userId` - получить теги пользователя

### Bot
- `POST /api/bot/user` - создать/обновить пользователя
- `GET /api/bot/user/:userId` - получить данные пользователя
- `GET /api/bot/stats/:userId` - получить статистику

## 🎨 UI/UX Особенности

- **Адаптивный дизайн** для мобильных устройств
- **Telegram Mini App темы** - автоматическая адаптация к теме Telegram
- **Плавные анимации** и переходы
- **Офлайн-первый подход** с кэшированием
- **Интуитивная навигация** с хлебными крошками
- **Валидация форм** в реальном времени

## 🔧 Настройка для продакшна

1. **Домен и SSL**: настройте HTTPS
2. **Webhook**: настройте webhook для бота
3. **База данных**: рассмотрите PostgreSQL для масштабирования
4. **Файловое хранилище**: используйте S3 или аналоги
5. **Мониторинг**: добавьте логирование и метрики
6. **Backup**: настройте резервное копирование

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности настроек в `.env`
3. Проверьте доступность API ключей
4. Создайте issue в репозитории

---

**Терапевтический дневник** - ваш персональный помощник в ведении терапевтических записей с использованием современных технологий ИИ.
