const express = require('express');
const { runQuery, getQuery } = require('../database/init');

const router = express.Router();

// Get or create user
router.post('/user', async (req, res) => {
  try {
    const { telegram_user_id, username, first_name, last_name } = req.body;
    
    // Check if user exists
    let user = await getQuery(
      'SELECT * FROM users WHERE telegram_user_id = ?',
      [telegram_user_id]
    );
    
    if (!user) {
      // Create new user
      const result = await runQuery(`
        INSERT INTO users (telegram_user_id, username, first_name, last_name)
        VALUES (?, ?, ?, ?)
      `, [telegram_user_id, username, first_name, last_name]);
      
      user = {
        id: result.id,
        telegram_user_id,
        username,
        first_name,
        last_name
      };
    } else {
      // Update last activity
      await runQuery(
        'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE telegram_user_id = ?',
        [telegram_user_id]
      );
    }
    
    res.json({ user });
  } catch (error) {
    console.error('User creation/update error:', error);
    res.status(500).json({ error: 'Ошибка при обработке пользователя' });
  }
});

// Get user info
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await getQuery(
      'SELECT * FROM users WHERE telegram_user_id = ?',
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get total entries count
    const totalEntries = await getQuery(
      'SELECT COUNT(*) as count FROM journal_entries WHERE telegram_user_id = ?',
      [userId]
    );
    
    // Get entries by source
    const entriesBySource = await getQuery(`
      SELECT source, COUNT(*) as count 
      FROM journal_entries 
      WHERE telegram_user_id = ? 
      GROUP BY source
    `, [userId]);
    
    // Get entries by month (last 6 months)
    const monthlyEntries = await getQuery(`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM journal_entries 
      WHERE telegram_user_id = ? 
      AND date >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month DESC
    `, [userId]);
    
    // Get total images count
    const totalImages = await getQuery(`
      SELECT COUNT(*) as count 
      FROM entry_images ei
      JOIN journal_entries je ON ei.entry_id = je.id
      WHERE je.telegram_user_id = ?
    `, [userId]);
    
    res.json({
      totalEntries: totalEntries.count,
      entriesBySource: entriesBySource,
      monthlyEntries: monthlyEntries,
      totalImages: totalImages.count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

module.exports = router;
