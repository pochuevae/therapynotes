const express = require('express');
const router = express.Router();

// Root endpoint for health check
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Therapy Journal API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
