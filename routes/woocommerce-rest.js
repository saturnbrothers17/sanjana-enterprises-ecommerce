const express = require('express');
const WooCommerceAPI = require('../config/woocommerce-api');
const router = express.Router();

// ===== WOOCOMMERCE REST API ROUTES =====

// Get all products via WooCommerce REST API
router.get('/api/wc/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      per_page = 20, 
      category = null, 
      search = null, 
      featured = null,
      on_sale = null,
      orderby = 'date',
      order = 'desc'
    } = req.query;

    const params = {
      page: parseInt(page),
      per_page: parseInt(per_page),
      orderby,
      order
    };

    if (category) params.category = category;
    if (search) params.search = search;
    if (featured === 'true') params.featured = true;
    if (on_sale === 'true') params.on_sale = true;

    const result = await WooCommerceAPI.getAllProducts(params);
    
    if (result.success) {
      const formattedProducts = result.data.map(product => 
        WooCommerceAPI.formatProduct(product)
      );
      
      res.json({
        success: true,
        data: formattedProducts,
        meta: {
          page: parseInt(page),
          per_page: parseInt(per_page),
          total: result.total,
          total_pages: result.totalPages,
          has_next: parseInt(page) < result.totalPages,
          has_prev: parseInt(page) > 1
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single product via WooCommerce REST API
router.get('/api/wc/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WooCommerceAPI.getProduct(id);
    
    if (result.success) {
      res.json({
        success: true,
        data: WooCommerceAPI.formatProduct(result.data)
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get product categories via WooCommerce REST API
router.get('/api/wc/categories', async (req, res) => {
  try {
    const { per_page = 50, hide_empty = true } = req.query;
    
    const result = await WooCommerceAPI.getAllCategories({
      per_page: parseInt(per_page),
      hide_empty: hide_empty === 'true'
    });
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search products via WooCommerce REST API
router.get('/api/wc/search', async (req, res) => {
  try {
    const { q, page = 1, per_page = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const result = await WooCommerceAPI.searchProducts(q, {
      page: parseInt(page),
      per_page: parseInt(per_page)
    });
    
    if (result.success) {
      const formattedProducts = result.data.map(product => 
        WooCommerceAPI.formatProduct(product)
      );
      
      res.json({
        success: true,
        data: formattedProducts,
        meta: {
          query: q,
          total: formattedProducts.length
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get featured products
router.get('/api/wc/featured', async (req, res) => {
  try {
    const { per_page = 8 } = req.query;
    const result = await WooCommerceAPI.getFeaturedProducts({
      per_page: parseInt(per_page)
    });
    
    if (result.success) {
      const formattedProducts = result.data.map(product => 
        WooCommerceAPI.formatProduct(product)
      );
      
      res.json({
        success: true,
        data: formattedProducts
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get on-sale products
router.get('/api/wc/on-sale', async (req, res) => {
  try {
    const { per_page = 8 } = req.query;
    const result = await WooCommerceAPI.getOnSaleProducts({
      per_page: parseInt(per_page)
    });
    
    if (result.success) {
      const formattedProducts = result.data.map(product => 
        WooCommerceAPI.formatProduct(product)
      );
      
      res.json({
        success: true,
        data: formattedProducts
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get products by category
router.get('/api/wc/categories/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, per_page = 20 } = req.query;
    
    const result = await WooCommerceAPI.getProductsByCategory(id, {
      page: parseInt(page),
      per_page: parseInt(per_page)
    });
    
    if (result.success) {
      const formattedProducts = result.data.map(product => 
        WooCommerceAPI.formatProduct(product)
      );
      
      res.json({
        success: true,
        data: formattedProducts
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== ORDER MANAGEMENT =====

// Create order
router.post('/api/wc/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const result = await WooCommerceAPI.createOrder(orderData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order details
router.get('/api/wc/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WooCommerceAPI.getOrder(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== CUSTOMER MANAGEMENT =====

// Create customer
router.post('/api/wc/customers', async (req, res) => {
  try {
    const customerData = req.body;
    const result = await WooCommerceAPI.createCustomer(customerData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== SYSTEM STATUS =====

// Check WooCommerce API status
router.get('/api/wc/status', async (req, res) => {
  try {
    const result = await WooCommerceAPI.getSystemStatus();
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          api_status: 'connected',
          woocommerce_version: result.data.environment?.version || 'unknown',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'WooCommerce API not available'
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'WooCommerce API connection failed'
    });
  }
});

module.exports = router;
