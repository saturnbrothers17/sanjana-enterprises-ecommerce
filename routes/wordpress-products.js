const express = require('express');
const WordPressProductService = require('../config/wordpress-db');
const router = express.Router();

// Get all products from WordPress
router.get('/api/products', async (req, res) => {
  try {
    const products = await WordPressProductService.getAllProducts();
    
    // Enhance products with images and categories
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const [images, category] = await Promise.all([
          WordPressProductService.getProductImages(product.id),
          WordPressProductService.getProductCategories(product.id)
        ]);
        
        return {
          ...product,
          images,
          category
        };
      })
    );
    
    res.json(enhancedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await WordPressProductService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
router.get('/api/products/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const products = await WordPressProductService.searchProducts(query);
    
    // Enhance with images and categories
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const [images, category] = await Promise.all([
          WordPressProductService.getProductImages(product.id),
          WordPressProductService.getProductCategories(product.id)
        ]);
        
        return {
          ...product,
          images,
          category
        };
      })
    );
    
    res.json(enhancedProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get products by category
router.get('/api/products/category/:category', async (req, res) => {
  try {
    const categorySlug = req.params.category;
    const products = await WordPressProductService.getAllProducts();
    
    // Filter by category (this would need a more sophisticated query)
    const filteredProducts = products.filter(product => 
      product.category.toLowerCase().includes(categorySlug.toLowerCase())
    );
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

module.exports = router;
