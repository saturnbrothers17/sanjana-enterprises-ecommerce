const mysql = require('mysql2/promise');
require('dotenv').config();

// WordPress Database Configuration
const wordpressDbConfig = {
  host: process.env.WP_DB_HOST || 'localhost',
  user: process.env.WP_DB_USER || 'wordpress_user',
  password: process.env.WP_DB_PASSWORD || '',
  database: process.env.WP_DB_NAME || 'wordpress',
  port: process.env.WP_DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(wordpressDbConfig);

class WordPressProductService {
  
  // Get all products from WordPress database
  static async getAllProducts() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          p.ID as id,
          p.post_title as name,
          p.post_content as description,
          p.post_status as status,
          p.post_date as created_at,
          MAX(CASE WHEN m.meta_key = '_price' THEN m.meta_value END) as price,
          MAX(CASE WHEN m.meta_key = '_regular_price' THEN m.meta_value END) as regular_price,
          MAX(CASE WHEN m.meta_key = '_sale_price' THEN m.meta_value END) as sale_price,
          MAX(CASE WHEN m.meta_key = '_sku' THEN m.meta_value END) as sku,
          MAX(CASE WHEN m.meta_key = '_stock' THEN m.meta_value END) as stock,
          MAX(CASE WHEN m.meta_key = '_stock_status' THEN m.meta_value END) as stock_status,
          MAX(CASE WHEN m.meta_key = '_weight' THEN m.meta_value END) as weight,
          MAX(CASE WHEN m.meta_key = '_length' THEN m.meta_value END) as length,
          MAX(CASE WHEN m.meta_key = '_width' THEN m.meta_value END) as width,
          MAX(CASE WHEN m.meta_key = '_height' THEN m.meta_value END) as height
        FROM wp_posts p
        LEFT JOIN wp_postmeta m ON p.ID = m.post_id
        WHERE p.post_type = 'product' 
          AND p.post_status = 'publish'
        GROUP BY p.ID
        ORDER BY p.post_date DESC
      `);
      
      return rows.map(product => ({
        ...product,
        price: parseFloat(product.price || 0),
        regular_price: parseFloat(product.regular_price || 0),
        sale_price: parseFloat(product.sale_price || 0),
        stock: parseInt(product.stock || 0),
        images: [], // Will be populated separately
        category: '' // Will be populated separately
      }));
    } catch (error) {
      console.error('Error fetching products from WordPress:', error);
      throw error;
    }
  }

  // Get product images
  static async getProductImages(productId) {
    try {
      const [rows] = await pool.execute(`
        SELECT guid as url, post_title as alt
        FROM wp_posts 
        WHERE post_parent = ? 
          AND post_type = 'attachment'
          AND post_mime_type LIKE 'image%'
        ORDER BY menu_order ASC
      `, [productId]);
      
      return rows.map(img => ({
        url: img.url,
        alt: img.alt || 'Product Image'
      }));
    } catch (error) {
      console.error('Error fetching product images:', error);
      return [];
    }
  }

  // Get product categories
  static async getProductCategories(productId) {
    try {
      const [rows] = await pool.execute(`
        SELECT t.name, t.slug
        FROM wp_terms t
        INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        INNER JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        WHERE tr.object_id = ? AND tt.taxonomy = 'product_cat'
      `, [productId]);
      
      return rows.map(cat => cat.name).join(', ');
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return '';
    }
  }

  // Get single product by ID
  static async getProductById(productId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          p.ID as id,
          p.post_title as name,
          p.post_content as description,
          p.post_status as status,
          p.post_date as created_at,
          MAX(CASE WHEN m.meta_key = '_price' THEN m.meta_value END) as price,
          MAX(CASE WHEN m.meta_key = '_regular_price' THEN m.meta_value END) as regular_price,
          MAX(CASE WHEN m.meta_key = '_sale_price' THEN m.meta_value END) as sale_price,
          MAX(CASE WHEN m.meta_key = '_sku' THEN m.meta_value END) as sku,
          MAX(CASE WHEN m.meta_key = '_stock' THEN m.meta_value END) as stock,
          MAX(CASE WHEN m.meta_key = '_stock_status' THEN m.meta_value END) as stock_status,
          MAX(CASE WHEN m.meta_key = '_weight' THEN m.meta_value END) as weight,
          MAX(CASE WHEN m.meta_key = '_length' THEN m.meta_value END) as length,
          MAX(CASE WHEN m.meta_key = '_width' THEN m.meta_value END) as width,
          MAX(CASE WHEN m.meta_key = '_height' THEN m.meta_value END) as height
        FROM wp_posts p
        LEFT JOIN wp_postmeta m ON p.ID = m.post_id
        WHERE p.ID = ? AND p.post_type = 'product'
        GROUP BY p.ID
      `, [productId]);

      if (rows.length === 0) return null;

      const product = rows[0];
      const images = await this.getProductImages(productId);
      const category = await this.getProductCategories(productId);

      return {
        ...product,
        price: parseFloat(product.price || 0),
        regular_price: parseFloat(product.regular_price || 0),
        sale_price: parseFloat(product.sale_price || 0),
        stock: parseInt(product.stock || 0),
        images,
        category
      };
    } catch (error) {
      console.error('Error fetching product from WordPress:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(query) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          p.ID as id,
          p.post_title as name,
          p.post_content as description,
          p.post_status as status,
          p.post_date as created_at,
          MAX(CASE WHEN m.meta_key = '_price' THEN m.meta_value END) as price,
          MAX(CASE WHEN m.meta_key = '_regular_price' THEN m.meta_value END) as regular_price,
          MAX(CASE WHEN m.meta_key = '_sale_price' THEN m.meta_value END) as sale_price,
          MAX(CASE WHEN m.meta_key = '_sku' THEN m.meta_value END) as sku,
          MAX(CASE WHEN m.meta_key = '_stock' THEN m.meta_value END) as stock,
          MAX(CASE WHEN m.meta_key = '_stock_status' THEN m.meta_value END) as stock_status
        FROM wp_posts p
        LEFT JOIN wp_postmeta m ON p.ID = m.post_id
        WHERE p.post_type = 'product' 
          AND p.post_status = 'publish'
          AND (p.post_title LIKE ? OR p.post_content LIKE ?)
        GROUP BY p.ID
        ORDER BY p.post_date DESC
      `, [`%${query}%`, `%${query}%`]);
      
      return rows.map(product => ({
        ...product,
        price: parseFloat(product.price || 0),
        regular_price: parseFloat(product.regular_price || 0),
        sale_price: parseFloat(product.sale_price || 0),
        stock: parseInt(product.stock || 0),
        images: [],
        category: ''
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

module.exports = WordPressProductService;
