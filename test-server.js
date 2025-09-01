const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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
  res.json({ status: 'healthy' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Server address: ${server.address().address}:${server.address().port}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

module.exports = app;
