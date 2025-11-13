const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import WooCommerce API
const WooCommerceAPI = require('./config/woocommerce-api');

const app = express();

// Basic middleware for Vercel
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sanjana-enterprises-ecommerce.vercel.app', 'https://purple-fox-895997.hostingersite.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Session configuration (simplified for serverless)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Basic routes for testing
app.get('/', async (req, res) => {
  try {
    console.log('Home route accessed');
    res.render('index', { 
      title: 'Sanjana Enterprises - Medical Equipment',
      user: req.session.user || null 
    });
  } catch (error) {
    console.error('Error in home route:', error);
    res.status(500).send('Server Error');
  }
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Products API (simplified)
app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching products from WooCommerce...');
    const products = await WooCommerceAPI.get('products', {
      per_page: 20,
      status: 'publish'
    });
    
    res.json({
      success: true,
      products: products.data || []
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Products page
app.get('/products', async (req, res) => {
  try {
    const products = await WooCommerceAPI.get('products', {
      per_page: 20,
      status: 'publish'
    });
    
    res.render('products', {
      title: 'Medical Equipment - Sanjana Enterprises',
      products: products.data || [],
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error loading products page:', error);
    res.render('products', {
      title: 'Medical Equipment - Sanjana Enterprises',
      products: [],
      user: req.session.user || null,
      error: 'Failed to load products'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found - Sanjana Enterprises',
    user: null
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Export for Vercel
module.exports = app;
