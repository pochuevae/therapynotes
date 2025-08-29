const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const { runQuery, getQuery, allQuery } = require('../database/init');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Только изображения PNG и JPG разрешены'));
    }
  }
});

// Get all entries for a user (grouped by month)
router.get('/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { search, startDate, endDate, tag } = req.query;
    
    let sql = `
      SELECT * FROM journal_entries 
      WHERE telegram_user_id = ?
    `;
    let params = [userId];
    
    // Add search filter
    if (search) {
      sql += ` AND (title LIKE ? OR summary LIKE ? OR transcript LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add date range filter
    if (startDate && endDate) {
      sql += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    // Add tag filter
    if (tag) {
      sql += ` AND tags LIKE ?`;
      params.push(`%${tag}%`);
    }
    
    sql += ` ORDER BY date DESC, created_at DESC`;
    
    const entries = await allQuery(sql, params);
    
    // Group entries by month
    const groupedEntries = entries.reduce((acc, entry) => {
      const month = moment(entry.date).format('YYYY-MM');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(entry);
      return acc;
    }, {});
    
    res.json({ entries: groupedEntries });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Ошибка при получении записей' });
  }
});

// Get single entry with images
router.get('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await getQuery('SELECT * FROM journal_entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    // Get images for this entry
    const images = await allQuery('SELECT * FROM entry_images WHERE entry_id = ? ORDER BY created_at', [id]);
    
    res.json({ entry, images });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Ошибка при получении записи' });
  }
});

// Create new entry
router.post('/entry', async (req, res) => {
  try {
    const { telegram_user_id, date, title, summary, content, tags } = req.body;
    
    const result = await runQuery(`
      INSERT INTO journal_entries 
      (telegram_user_id, date, title, summary, content, tags, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [telegram_user_id, date, title, summary, content, tags, 'manual']);
    
    res.json({ id: result.id, message: 'Запись создана успешно' });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Ошибка при создании записи' });
  }
});

// Update entry
router.put('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, title, summary, content, tags } = req.body;
    
    await runQuery(`
      UPDATE journal_entries 
      SET date = ?, title = ?, summary = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [date, title, summary, content, tags, id]);
    
    res.json({ message: 'Запись обновлена успешно' });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении записи' });
  }
});

// Delete entry
router.delete('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get images to delete files
    const images = await allQuery('SELECT file_path FROM entry_images WHERE entry_id = ?', [id]);
    
    // Delete image files
    images.forEach(image => {
      const filePath = path.join(__dirname, '../../', image.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Delete entry (images will be deleted by CASCADE)
    await runQuery('DELETE FROM journal_entries WHERE id = ?', [id]);
    
    res.json({ message: 'Запись удалена успешно' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Ошибка при удалении записи' });
  }
});

// Upload images for entry
router.post('/entry/:id/images', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Нет файлов для загрузки' });
    }
    
    const imagePromises = files.map(file => {
      return runQuery(`
        INSERT INTO entry_images 
        (entry_id, file_path, file_name, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?)
      `, [
        id,
        `uploads/images/${file.filename}`,
        file.originalname,
        file.size,
        file.mimetype
      ]);
    });
    
    await Promise.all(imagePromises);
    
    res.json({ message: `${files.length} изображений загружено успешно` });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке изображений' });
  }
});

// Delete image
router.delete('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Get image info
    const image = await getQuery('SELECT file_path FROM entry_images WHERE id = ?', [imageId]);
    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }
    
    // Delete file
    const filePath = path.join(__dirname, '../../', image.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await runQuery('DELETE FROM entry_images WHERE id = ?', [imageId]);
    
    res.json({ message: 'Изображение удалено успешно' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Ошибка при удалении изображения' });
  }
});

// Get tags for user
router.get('/tags/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const entries = await allQuery(
      'SELECT tags FROM journal_entries WHERE telegram_user_id = ? AND tags IS NOT NULL AND tags != ""',
      [userId]
    );
    
    const allTags = entries
      .map(entry => entry.tags.split(',').map(tag => tag.trim()))
      .flat()
      .filter(tag => tag.length > 0);
    
    const uniqueTags = [...new Set(allTags)];
    
    res.json({ tags: uniqueTags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Ошибка при получении тегов' });
  }
});

module.exports = router;
