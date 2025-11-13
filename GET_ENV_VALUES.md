# How to Get All Required .env Values

This guide will walk you through getting every required value for your `.env` file.

## **🔧 REQUIRED VALUES (Must Have)**

### **1. WordPress Database Credentials (Most Important)**

**From Hostinger cPanel:**

1. **Log into Hostinger cPanel**
2. **Go to MySQL Databases**
3. **Find your WordPress database:**
   - Database name: `u123456789_wordpress` (starts with your username)
   - Username: `u123456789_admin` (your Hostinger username)
   - Password: (the password you set during WordPress installation)

**Update these in .env:**
```bash
WP_DB_HOST=localhost
WP_DB_USER=your_actual_username
WP_DB_PASSWORD=your_actual_password
WP_DB_NAME=your_actual_database_name
WP_DB_PORT=3306
```

### **2. Alternative Method: From wp-config.php**

**If you have WordPress files access:**
1. **Go to File Manager in Hostinger**
2. **Navigate to public_html/wp-config.php**
3. **Look for these lines:**
   ```php
   define('DB_NAME', 'your_database_name');
   define('DB_USER', 'your_username');
   define('DB_PASSWORD', 'your_password');
   define('DB_HOST', 'localhost');
   ```

## **📧 EMAIL CONFIGURATION (Optional but Recommended)**

### **From Hostinger Email Setup:**

1. **Go to Hostinger → Email Accounts**
2. **Create or find your email:**
   - Email: `info@yourdomain.com`
   - Password: (your email password)

**Update these in .env:**
```bash
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=info@yourdomain.com
EMAIL_PASS=your_email_password
EMAIL_FROM=Sanjana Enterprises <info@yourdomain.com>
```

## **💳 PAYMENT CONFIGURATION (Optional)**

### **Stripe Setup:**
1. **Go to stripe.com**
2. **Create account**
3. **Get test keys:**
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### **Razorpay Setup (for India):**
1. **Go to razorpay.com**
2. **Create account**
3. **Get test keys:**
   - Key ID: `rzp_test_...`
   - Key Secret: `your_secret`

## **☁️ CLOUDINARY (Optional - for images)**

1. **Go to cloudinary.com**
2. **Create free account**
3. **Get credentials:**
   - Cloud name: `your_cloud_name`
   - API Key: `your_api_key`
   - API Secret: `your_api_secret`

## **🎯 QUICK SETUP CHECKLIST**

### **Step 1: Get WordPress Database Info**
- [ ] Log into Hostinger cPanel
- [ ] Go to MySQL Databases
- [ ] Find your WordPress database name
- [ ] Note the username and password
- [ ] Update .env file

### **Step 2: Test Connection**
- [ ] Run `npm install mysql2`
- [ ] Run `npm start`
- [ ] Visit http://localhost:3000
- [ ] Check if products appear

### **Step 3: Add Products in WordPress**
- [ ] Log into WordPress admin
- [ ] Go to Products → Add New
- [ ] Add products with images, prices, descriptions
- [ ] Products will appear on your Node.js site

## **🚨 TROUBLESHOOTING**

### **Can't Find Database Credentials?**
**Contact Hostinger Support:**
- Chat with Hostinger support
- Ask for "WordPress database connection details"
- They'll provide: host, database name, username, password

### **Database Connection Error?**
**Check these:**
- Database name is correct (case-sensitive)
- Username has proper permissions
- Host is set to "localhost" (usually correct)
- Password has no special characters that need escaping

### **Products Not Showing?**
**Check in WordPress:**
- Products are published (not draft)
- Products have prices set
- Products have categories assigned
- WooCommerce is installed and active

## **📞 GET HELP**

**If you're stuck:**
1. **Hostinger Support:** Live chat for database issues
2. **WordPress Support:** Check WooCommerce documentation
3. **Node.js Support:** Check console for error messages

## **🎯 MINIMAL REQUIRED .env**

For basic functionality, you only need:
```bash
WP_DB_HOST=localhost
WP_DB_USER=your_username
WP_DB_PASSWORD=your_password
WP_DB_NAME=your_database_name
WP_DB_PORT=3306
SESSION_SECRET=sanjana-enterprises-super-secret-key-2024
PORT=3000
NODE_ENV=development
```

The rest are optional and can be added later!
