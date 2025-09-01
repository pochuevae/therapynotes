const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple JSON response
app.get('/', (req, res) => {
  console.log('✅ Root request received from:', req.ip);
  res.json({
    status: 'OK',
    message: 'Therapy Journal API is working!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check from:', req.ip);
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Catch all
app.all('*', (req, res) => {
  console.log(`✅ ${req.method} ${req.path} from ${req.ip}`);
  res.json({
    method: req.method,
    path: req.path,
    message: 'Therapy Journal API - All routes working!',
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📍 Address: ${server.address().address}:${server.address().port}`);
  console.log(`🌐 Family: ${server.address().family}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

console.log('✅ Simple server setup complete');
