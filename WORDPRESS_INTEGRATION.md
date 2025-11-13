# WordPress Database Integration Guide

This guide explains how to connect your Node.js eCommerce application to your WordPress database to use WooCommerce products.

## **Prerequisites**

1. **WordPress Installation** with WooCommerce plugin
2. **MySQL Database Access** (your WordPress database)
3. **Node.js Application** (this project)

## **Step 1: Configure WordPress Database Connection**

### **Get Your WordPress Database Credentials**

1. **From Hostinger cPanel:**
   - Go to **MySQL Databases**
   - Find your WordPress database name (usually starts with your username)
   - Note the database name, username, and password

2. **From wp-config.php:**
   - Access your WordPress files via FTP/File Manager
   - Open `wp-config.php`
   - Find these values:
     ```php
     define('DB_NAME', 'your_database_name');
     define('DB_USER', 'your_username');
     define('DB_PASSWORD', 'your_password');
     define('DB_HOST', 'localhost');
     ```

### **Update Your .env File**

Create or update your `.env` file with WordPress database credentials:

```bash
# WordPress Database Configuration
WP_DB_HOST=localhost
WP_DB_USER=your_wordpress_username
WP_DB_PASSWORD=your_wordpress_password
WP_DB_NAME=your_wordpress_database_name
WP_DB_PORT=3306
```

## **Step 2: Set Up WooCommerce Products**

### **Install Required WordPress Plugins**

1. **WooCommerce** (if not already installed)
2. **Optional: WooCommerce REST API** for advanced features

### **Create Sample Products in WordPress**

1. **Go to WordPress Admin → Products → Add New**
2. **Add products with these details:**
   - **Product Name**
   - **Description**
   - **Price** (Regular Price)
   - **Sale Price** (optional)
   - **SKU** (Stock Keeping Unit)
   - **Stock Quantity**
   - **Product Images**
   - **Categories** (Diagnostic Equipment, Respiratory Equipment, etc.)

### **Example Product Data**

```
Product: Digital Blood Pressure Monitor
Price: ₹2,500
Category: Diagnostic Equipment
Description: Accurate digital BP monitor for home use
Images: Upload product photos
SKU: BPM-001
Stock: 50
```

## **Step 3: Test the Integration**

### **Start Your Node.js Application**

```bash
npm install
npm start
```

### **Verify Data Connection**

1. **Visit:** `http://localhost:3000`
2. **Check if products appear from WordPress**
3. **Test product pages:** `http://localhost:3000/product/123` (replace 123 with actual product ID)

## **Step 4: Advanced Configuration**

### **Enable Remote Database Access (if needed)**

If your WordPress database is on a different server:

1. **In Hostinger cPanel:**
   - Go to **Remote MySQL**
   - Add your server IP address
   - Or use `%` for any IP (less secure)

2. **Update .env with remote host:**
   ```bash
   WP_DB_HOST=your-wordpress-server.com
   ```

### **Database Schema Reference**

Your Node.js app reads from these WordPress tables:

- **wp_posts** - Product information
- **wp_postmeta** - Product metadata (price, SKU, stock)
- **wp_terms** - Product categories
- **wp_term_relationships** - Product-category relationships
- **wp_posts** (attachments) - Product images

### **Common Issues & Solutions**

#### **Connection Error**
```
Error: Access denied for user
```
**Solution:** Check username/password in .env file

#### **No Products Showing**
```
Empty product list
```
**Solution:** 
- Ensure products are published in WordPress
- Check if products have prices set
- Verify database connection

#### **Images Not Loading**
```
Missing product images
```
**Solution:**
- Ensure product images are uploaded in WordPress
- Check if image URLs are accessible

## **Step 5: Production Deployment**

### **Deploy to Cloud Service**

1. **Update environment variables** in your deployment platform
2. **Configure database firewall** to allow connections from your app
3. **Use SSL connection** for security

### **Performance Optimization**

1. **Enable caching** in WordPress
2. **Use CDN** for product images
3. **Optimize database queries** for large product catalogs

## **API Endpoints Available**

Your Node.js app now provides these endpoints:

- **GET /** - Homepage with featured products
- **GET /products** - All products with filtering
- **GET /product/:id** - Single product details
- **GET /cart** - Shopping cart
- **POST /cart/add** - Add to cart
- **POST /checkout** - Process order

## **Next Steps**

1. **Add more products** in WordPress admin
2. **Customize product display** in your Node.js views
3. **Set up payment processing** (Stripe, PayPal)
4. **Configure order management** in WordPress
5. **Add customer accounts** integration

## **Support**

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the Node.js console for server errors
3. Verify WordPress database credentials
4. Ensure WooCommerce is properly configured

For Hostinger-specific issues, contact their support with your database connection details.
