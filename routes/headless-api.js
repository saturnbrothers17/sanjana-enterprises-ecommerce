const express = require('express');
const WooCommerceAPI = require('../config/woocommerce-api');
const router = express.Router();

// ===== HEADLESS CMS API ENDPOINTS =====

// Site Information
router.get('/api/site', async (req, res) => {
  try {
    const siteInfo = await HeadlessWordPress.getSiteInfo();
    res.json({
      success: true,
      data: siteInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all content types
router.get('/api/content', async (req, res) => {
  try {
    const { type = 'post', limit = 10, offset = 0 } = req.query;
    const content = await HeadlessWordPress.getAllContent(type, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: content,
      meta: {
        type,
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: content.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get content by slug
router.get('/api/content/:type/:slug', async (req, res) => {
  try {
    const { type, slug } = req.params;
    const content = await HeadlessWordPress.getContentBySlug(slug, type);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get content by type with filtering
router.get('/api/content/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || 10,
      offset: parseInt(req.query.offset) || 0,
      category: req.query.category || null,
      tag: req.query.tag || null,
      search: req.query.search || null,
      orderBy: req.query.orderBy || 'date',
      order: req.query.order || 'DESC'
    };

    const content = await HeadlessWordPress.getContentByType(type, options);
    
    res.json({
      success: true,
      data: content,
      meta: {
        type,
        ...options,
        total: content.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get categories
router.get('/api/categories/:type?', async (req, res) => {
  try {
    const { type = 'category' } = req.params;
    const categories = await HeadlessWordPress.getCategories(type);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get menus
router.get('/api/menus', async (req, res) => {
  try {
    const menus = await HeadlessWordPress.getMenus();
    
    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== ECOMMERCE API ENDPOINTS =====

// Get all products (headless eCommerce)
router.get('/api/products', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category = null, search = null } = req.query;
    
    // Build WooCommerce API parameters
    const params = { 
      per_page: parseInt(limit),
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
    };
    
    if (search) params.search = search;
    if (category) params.search = category; // Note: You'd need category ID mapping for proper filtering
    
    const result = await WooCommerceAPI.getAllProducts(params);
    
    if (result.success) {
      const products = result.data.map(product => WooCommerceAPI.formatProduct(product));
      
      res.json({
        success: true,
        data: products,
        meta: {
          total: result.total || products.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (result.totalPages || 1) > params.page
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch products'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single product
router.get('/api/products/:id', async (req, res) => {
  try {
    const result = await WooCommerceAPI.getProduct(req.params.id);
    
    if (!result.success || !result.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = WooCommerceAPI.formatProduct(result.data);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search products
router.get('/api/search', async (req, res) => {
  try {
    const { q, type = 'products' } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required'
      });
    }

    let results;
    
    if (type === 'products') {
      results = await WordPressProductService.searchProducts(q);
    } else {
      results = await HeadlessWordPress.getContentByType(type, { search: q });
    }

    res.json({
      success: true,
      data: results,
      meta: {
        query: q,
        type,
        total: results.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== HEADLESS CMS DASHBOARD ENDPOINTS =====

// Get CMS statistics
router.get('/api/cms/stats', async (req, res) => {
  try {
    const [posts] = await HeadlessWordPress.pool.execute(`
      SELECT COUNT(*) as total FROM wp_posts WHERE post_type = 'post' AND post_status = 'publish'
    `);
    
    const [products] = await HeadlessWordPress.pool.execute(`
      SELECT COUNT(*) as total FROM wp_posts WHERE post_type = 'product' AND post_status = 'publish'
    `);
    
    const [categories] = await HeadlessWordPress.pool.execute(`
      SELECT COUNT(*) as total FROM wp_terms INNER JOIN wp_term_taxonomy ON wp_terms.term_id = wp_term_taxonomy.term_id WHERE wp_term_taxonomy.taxonomy = 'category'
    `);

    res.json({
      success: true,
      data: {
        posts: posts[0].total,
        products: products[0].total,
        categories: categories[0].total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
