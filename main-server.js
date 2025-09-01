const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
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

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🔍 Root request received from:', req.ip);
  res.json({
    status: 'OK',
    message: 'Therapy Journal API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('🔍 Health check from:', req.ip);
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

// Serve static files from React build (if exists)
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch all for React app
app.get('*', (req, res) => {
  console.log(`🔍 Catch-all: ${req.method} ${req.path} from ${req.ip}`);
  res.json({
    status: 'OK',
    message: 'Therapy Journal API - All routes working!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Main server running on port ${PORT}`);
  console.log(`📍 Address: ${server.address().address}:${server.address().port}`);
  console.log(`🌐 Family: ${server.address().family}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔗 API health: http://0.0.0.0:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('listening', () => {
  console.log('✅ Server is listening and ready to accept connections');
});

console.log('✅ Main server setup complete');
