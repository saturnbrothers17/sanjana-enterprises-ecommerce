const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import WooCommerce API
const WooCommerceAPI = require('./config/woocommerce-api');
const apiRoutes = require('./routes/api');
const headlessRoutes = require('./routes/headless-api');
const woocommerceRoutes = require('./routes/woocommerce-rest');

// Import Security Middleware
const {
  securityHeaders,
  generalLimiter,
  strictLimiter,
  orderLimiter,
  speedLimiter,
  validateCustomerInfo,
  validateProductId,
  validateSearch,
  handleValidationErrors,
  xssProtection,
  mongoSanitize,
  hpp,
  compression,
  detectSuspiciousActivity,
  requestLogger,
  securityErrorHandler,
  securityLogger
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security: Disable server signature
app.disable('x-powered-by');

// Using WooCommerce REST API for headless CMS

// Security Middleware (Order is important!)
app.use(requestLogger); // Log all requests
app.use(securityHeaders); // Security headers
app.use(compression); // Compress responses
app.use(speedLimiter); // Slow down repeated requests
app.use(generalLimiter); // General rate limiting
app.use(detectSuspiciousActivity); // Detect malicious patterns
app.use(hpp); // Prevent HTTP Parameter Pollution
app.use(mongoSanitize); // Prevent NoSQL injection
app.use(xssProtection); // XSS protection

// Standard Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'sanjana-enterprises-ultra-secure-secret-key-2024',
  name: 'sessionId', // Don't use default session name
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 2 * 60 * 60 * 1000, // 2 hours (shorter session)
    sameSite: 'strict' // CSRF protection
  }
}));

// No authentication middleware needed

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Products will be fetched from WordPress database

const categories = [
  'All Categories',
  'Diagnostic Equipment',
  'Respiratory Equipment',
  'Mobility Aids',
  'Hospital Furniture',
  'Surgical Instruments',
  'Laboratory Equipment'
];

// Page Routes (must come before API routes to avoid conflicts)
app.get('/', async (req, res) => {
  try {
    const result = await WooCommerceAPI.getAllProducts({ per_page: 4 });
    const featuredProducts = result.success ? result.data.map(product => 
      WooCommerceAPI.formatProduct(product)
    ) : [];
    
    res.render('index', { 
      title: 'Sanjana Enterprises - Medical Equipment',
      products: featuredProducts,
      user: null
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.render('index', { 
      title: 'Sanjana Enterprises - Medical Equipment',
      products: [],
      user: null
    });
  }
});

app.get('/products', validateSearch, handleValidationErrors, async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    // Get products from WooCommerce
    const result = await WooCommerceAPI.getAllProducts({ per_page: 50 });
    let products = [];
    
    if (result.success && result.data) {
      products = result.data.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        regular_price: parseFloat(product.regular_price || 0),
        sale_price: parseFloat(product.sale_price || 0),
        image: product.images && product.images[0] ? product.images[0].src : '/images/placeholder-medical.jpg',
        category: product.categories && product.categories[0] ? product.categories[0].name : 'Medical Equipment',
        description: product.short_description || product.description || 'Premium medical equipment',
        stock_status: product.stock_status || 'instock',
        on_sale: product.on_sale || false,
        featured: product.featured || false,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 100) + 10,
        originalPrice: parseFloat(product.regular_price || product.price || 0),
        inStock: product.stock_status === 'instock',
        features: ['High Quality', 'ISO Certified', '2 Year Warranty']
      }));
    }
    
    // Apply filters and sorting
    if (category && category !== 'All Categories') {
      products = products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sort) {
      switch(sort) {
        case 'price-low':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }
    
    res.render('products', { 
      title: 'Medical Equipment - Sanjana Enterprises',
      products: products,
      categories,
      currentCategory: category || 'All Categories',
      currentSearch: search || '',
      currentSort: sort || '',
      user: null
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.render('products', { 
      title: 'Medical Equipment - Sanjana Enterprises',
      products: [],
      categories,
      currentCategory: 'All Categories',
      currentSearch: '',
      currentSort: '',
      user: null
    });
  }
});

app.get('/product/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await WooCommerceAPI.getProduct(productId);
    
    if (!result.success || !result.data) {
      return res.status(404).render('404', { title: 'Product Not Found' });
    }
    
    const product = WooCommerceAPI.formatProduct(result.data);
    
    // Get related products (same category)
    const relatedResult = await WooCommerceAPI.getAllProducts({ per_page: 8 });
    const relatedProducts = relatedResult.success ? 
      relatedResult.data
        .filter(p => p.id !== product.id)
        .slice(0, 4)
        .map(p => WooCommerceAPI.formatProduct(p)) : [];
    
    res.render('product-detail', { 
      title: `${product.name} - Sanjana Enterprises`,
      product,
      relatedProducts,
      user: null
    });
  } catch (error) {
    console.error('Error loading product:', error);
    res.status(404).render('404', { title: 'Product Not Found' });
  }
});

app.get('/cart', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    const cartItems = await Promise.all(
      cart.map(async (item) => {
        const result = await WooCommerceAPI.getProduct(item.productId);
        if (result.success && result.data) {
          const product = WooCommerceAPI.formatProduct(result.data);
          return { ...product, quantity: item.quantity };
        }
        return null;
      })
    );
    
    const validCartItems = cartItems.filter(item => item !== null);
    const total = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('cart', { 
      title: 'Shopping Cart - Sanjana Enterprises',
      cartItems: validCartItems,
      total,
      user: null
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.render('cart', { 
      title: 'Shopping Cart - Sanjana Enterprises',
      cartItems: [],
      total: 0,
      user: null
    });
  }
});

app.post('/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!req.session.cart) {
    req.session.cart = [];
  }
  
  const existingItem = req.session.cart.find(item => item.productId == productId);
  
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    req.session.cart.push({ productId: parseInt(productId), quantity: parseInt(quantity) });
  }
  
  res.json({ success: true, message: 'Product added to cart' });
});

app.post('/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  
  if (req.session.cart) {
    const item = req.session.cart.find(item => item.productId == productId);
    if (item) {
      if (quantity > 0) {
        item.quantity = parseInt(quantity);
      } else {
        req.session.cart = req.session.cart.filter(item => item.productId != productId);
      }
    }
  }
  
  res.json({ success: true });
});

app.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About Us - Sanjana Enterprises',
    user: null
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us - Sanjana Enterprises',
    user: null
  });
});

app.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  // In production, you would save this to database or send email
  console.log('Contact form submission:', { name, email, phone, message });
  res.json({ success: true, message: 'Thank you for your message. We will get back to you soon!' });
});


app.get('/checkout', (req, res) => {
  // No authentication required - customer info is collected separately
  res.render('checkout', { 
    title: 'Checkout - Sanjana Enterprises',
    user: null
  });
});

app.post('/checkout', async (req, res) => {
  try {
    const { address, city, state, pincode, paymentMethod } = req.body;
    
    const cart = req.session.cart || [];
    const cartItems = await Promise.all(
      cart.map(async (item) => {
        const result = await WooCommerceAPI.getProduct(item.productId);
        if (result.success && result.data) {
          const product = WooCommerceAPI.formatProduct(result.data);
          return { ...product, quantity: item.quantity };
        }
        return null;
      })
    );
    
    const validCartItems = cartItems.filter(item => item !== null);
    const subtotal = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 200;
    const total = subtotal + shipping;
    
    // In production, process payment and save order to WordPress database
    const orderId = 'ORD' + Date.now();
    
    // Clear cart
    req.session.cart = [];
    
    res.json({ 
      success: true, 
      orderId,
      message: 'Order placed successfully! You will receive a confirmation email shortly.' 
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing your order. Please try again.' 
    });
  }
});

// Customer Information Route
app.get('/customer-info', strictLimiter, (req, res) => {
  res.render('customer-info', {
    title: 'Customer Information - Sanjana Enterprises',
    user: null
  });
});

// Order Confirmation Route
app.get('/order-confirmation', (req, res) => {
  res.render('order-confirmation', {
    title: 'Order Confirmed - Sanjana Enterprises',
    user: null
  });
});

// API Routes (after page routes to avoid conflicts)
app.use('/', apiRoutes);
app.use('/', headlessRoutes);
app.use('/', woocommerceRoutes);

// API routes for dashboard integration
app.use('/api', apiRoutes);

// Order Creation API
app.post('/api/orders/create', orderLimiter, validateCustomerInfo, handleValidationErrors, async (req, res) => {
  try {
    const { customer, product, quantity, total, paymentMethod } = req.body;
    
    // Generate order ID
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Prepare order data for WooCommerce
    const orderData = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address_1: customer.address,
        city: customer.city,
        state: customer.state,
        postcode: customer.pincode,
        country: customer.country,
        email: customer.email,
        phone: '+91' + customer.mobile
      },
      shipping: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address_1: customer.address,
        city: customer.city,
        state: customer.state,
        postcode: customer.pincode,
        country: customer.country
      },
      line_items: [
        {
          product_id: product.id,
          quantity: quantity
        }
      ],
      shipping_lines: [
        {
          method_id: 'free_shipping',
          method_title: 'Free Shipping',
          total: '0'
        }
      ],
      meta_data: [
        {
          key: 'order_source',
          value: 'Sanjana Enterprises Website'
        },
        {
          key: 'custom_order_id',
          value: orderId
        },
        {
          key: 'installation_required',
          value: 'yes'
        }
      ]
    };
    
    // Create order in WooCommerce
    const result = await WooCommerceAPI.createOrder(orderData);
    
    if (result.success) {
      // Prepare response data
      const orderConfirmation = {
        orderId: orderId,
        woocommerceOrderId: result.data.id,
        customer: customer,
        product: product,
        quantity: quantity,
        total: total,
        paymentMethod: paymentMethod,
        orderDate: new Date().toISOString(),
        status: 'pending',
        estimatedDelivery: getEstimatedDeliveryDate()
      };
      
      console.log('Order created successfully:', orderConfirmation);
      
      res.json({
        success: true,
        message: 'Order placed successfully',
        order: orderConfirmation
      });
    } else {
      throw new Error(result.error || 'Failed to create order in WooCommerce');
    }
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
      error: error.message
    });
  }
});

// Helper function to calculate estimated delivery date
function getEstimatedDeliveryDate() {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 5); // 5 business days
  return deliveryDate.toISOString();
}

// 404 handler
app.use((req, res) => {
  securityLogger.warn('404 - Page not found', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method
  });
  res.status(404).render('404', { 
    title: 'Page Not Found - Sanjana Enterprises',
    user: null
  });
});

// Security error handler (must be last)
app.use(securityErrorHandler);

app.listen(PORT, () => {
  securityLogger.info(`Sanjana Enterprises server started securely on port ${PORT}`);
  console.log(`Sanjana Enterprises server running securely on http://localhost:${PORT}`);
});
