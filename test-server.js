const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔧 Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Using PORT:', PORT);

// Simple test endpoint
app.get('/', (req, res) => {
  console.log('Test request received from:', req.ip);
  res.json({ 
    status: 'OK', 
    message: 'Test server is working',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/health', (req, res) => {
  console.log('Health check request received from:', req.ip);
  res.json({ status: 'healthy' });
});

// Catch all for debugging
app.all('*', (req, res) => {
  console.log(`🔍 ${req.method} ${req.path} from ${req.ip}`);
  res.json({ 
    method: req.method, 
    path: req.path, 
    ip: req.ip,
    message: 'Catch-all handler'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Server address: ${server.address().address}:${server.address().port}`);
  console.log(`🌐 Server family: ${server.address().family}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔗 Root endpoint: http://0.0.0.0:${PORT}/`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

module.exports = app;
