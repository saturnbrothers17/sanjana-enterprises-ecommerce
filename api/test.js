// Minimal test for Vercel
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Vercel!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API endpoint working',
    woocommerce_url: process.env.WOOCOMMERCE_URL ? 'configured' : 'missing'
  });
});

module.exports = app;
