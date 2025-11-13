# 🚨 WooCommerce API Fix Guide

## **🔍 Current Issues Identified**

Based on the error pattern, here are the most likely issues and solutions:

## **1. Check WordPress Site Accessibility**

**Test your WordPress site:**
```bash
# Open browser and visit:
https://url-purple-fox-895997.hostingersite.com
```

**Expected**: Should show your WordPress site

## **2. Check WooCommerce Installation**

**Test WooCommerce REST API:**
```bash
# Open browser and visit:
https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/
```

**Expected**: Should show WooCommerce API information

## **3. Check REST API Keys**

**Test authentication:**
```bash
# Open browser and visit:
https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/products?consumer_key=ck_27453a911616e9c45e425b95cda36c582b1f519a&consumer_secret=cs_75f7bcd3b9d45f711781b33b656f1d4267725d29
```

## **4. Fix WordPress Configuration**

### **In WordPress Admin:**
1. **Go to WooCommerce → Settings → Advanced → REST API**
2. **Verify your keys exist and have Read/Write permissions**
3. **Check if REST API is enabled**

### **Check .htaccess:**
```apache
# Ensure this is in your .htaccess
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
```

## **5. Update .env with Fallback**

**Create fallback configuration:**

```bash
# Add to .env file
WOOCOMMERCE_URL=https://url-purple-fox-895997.hostingersite.com
WOOCOMMERCE_CONSUMER_KEY=ck_27453a911616e9c45e425b95cda36c582b1f519a
WOOCOMMERCE_CONSUMER_SECRET=cs_75f7bcd3b9d45f711781b33b656f1d4267725d29
```

## **6. Test with Manual Script**

**Run diagnostic test:**
```bash
node diagnostic-test.js
```

## **7. Alternative Testing**

**If WooCommerce API fails, use database connection:**

**Update .env with database credentials:**
```bash
WP_DB_HOST=localhost
WP_DB_USER=your_actual_username
WP_DB_PASSWORD=your_actual_password
WP_DB_NAME=your_actual_database_name
```

## **8. Quick Verification**

**Test these URLs in browser:**
- `https://url-purple-fox-895997.hostingersite.com` (WordPress site)
- `https://url-purple-fox-895997.hostingersite.com/wp-json/` (REST API)
- `https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/` (WooCommerce API)

## **9. Contact Support**

**If issues persist:**
1. **Hostinger Support**: Check if REST API is enabled
2. **WordPress Admin**: Verify WooCommerce installation
3. **Check error logs**: `wp-content/debug.log`

## **🎯 Next Steps**

1. **Run the diagnostic test**: `node diagnostic-test.js`
2. **Check WordPress admin** for WooCommerce status
3. **Verify API keys** have proper permissions
4. **Test direct API calls** in browser

**Your WooCommerce API is configured - we just need to verify connectivity!**
