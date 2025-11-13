const axios = require('axios');
require('dotenv').config();

class WooCommerceAPI {
  constructor() {
    this.baseURL = process.env.WOOCOMMERCE_URL;
    this.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    this.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/wp-json/wc/v3`,
      auth: {
        username: this.consumerKey,
        password: this.consumerSecret
      },
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // ===== PRODUCTS =====
  async getAllProducts(params = {}) {
    try {
      const response = await this.client.get('/products', { params });
      return {
        success: true,
        data: response.data,
        total: parseInt(response.headers['x-wp-total'] || 0),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || 1)
      };
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getProduct(id) {
    try {
      const response = await this.client.get(`/products/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching product:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async searchProducts(query, params = {}) {
    try {
      const response = await this.client.get('/products', {
        params: { search: query, ...params }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error searching products:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getProductsByCategory(categoryId, params = {}) {
    try {
      const response = await this.client.get('/products', {
        params: { category: categoryId, ...params }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching products by category:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ===== CATEGORIES =====
  async getAllCategories(params = {}) {
    try {
      const response = await this.client.get('/products/categories', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getCategory(id) {
    try {
      const response = await this.client.get(`/products/categories/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching category:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ===== ORDERS =====
  async createOrder(orderData) {
    try {
      const response = await this.client.post('/orders', orderData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getOrder(id) {
    try {
      const response = await this.client.get(`/orders/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching order:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ===== CUSTOMERS =====
  async createCustomer(customerData) {
    try {
      const response = await this.client.post('/customers', customerData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating customer:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getCustomer(id) {
    try {
      const response = await this.client.get(`/customers/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching customer:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ===== UTILITIES =====
  async getSystemStatus() {
    try {
      const response = await this.client.get('/system_status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking system status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ===== ADVANCED QUERIES =====
  async getFeaturedProducts(params = {}) {
    try {
      const response = await this.client.get('/products', {
        params: { featured: true, ...params }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching featured products:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getOnSaleProducts(params = {}) {
    try {
      const response = await this.client.get('/products', {
        params: { on_sale: true, ...params }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching on-sale products:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Format product for frontend
  formatProduct(product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      price: parseFloat(product.price || 0),
      regular_price: parseFloat(product.regular_price || 0),
      sale_price: parseFloat(product.sale_price || 0),
      on_sale: product.on_sale,
      featured: product.featured,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      sku: product.sku,
      images: product.images?.map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt,
        name: img.name
      })) || [],
      categories: product.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })) || [],
      tags: product.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })) || [],
      attributes: product.attributes || [],
      permalink: product.permalink
    };
  }
}

module.exports = new WooCommerceAPI();
