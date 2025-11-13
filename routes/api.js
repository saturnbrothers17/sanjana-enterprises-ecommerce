const express = require('express');
const WooCommerceAPI = require('../config/woocommerce-api');
const router = express.Router();

// CORS middleware for API routes
router.use((req, res, next) => {
  const allowedOrigins = [
    process.env.DASHBOARD_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'https://*.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.some(allowed => 
    allowed === origin || 
    (allowed.includes('*') && origin && origin.includes('vercel.app'))
  )) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API authentication middleware
const apiAuth = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// No mock data - using WordPress/WooCommerce database
const mockProducts = [];
const mockOrders = [];

// Dashboard data endpoints (using WooCommerce REST API)
router.get('/stats', async (req, res) => {
  try {
    const result = await WooCommerceAPI.getAllProducts({ per_page: 100 });
    const products = result.success ? result.data : [];
    
    res.json({
      products: products.length,
      orders: 0, // Placeholder - would fetch from WooCommerce in production
      users: 42, // Placeholder - would fetch from WordPress in production
      revenue: 0 // Placeholder - would calculate from actual orders
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const result = await WooCommerceAPI.getAllProducts({ per_page: 50 });
    const products = result.success ? result.data.map(product => 
      WooCommerceAPI.formatProduct(product)
    ) : [];
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/orders', (req, res) => {
  // In a real implementation, you would fetch actual orders from WordPress
  res.json([]); // Placeholder - would fetch from WordPress in production
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apiVersion: '1.0'
  });
});

module.exports = router;
