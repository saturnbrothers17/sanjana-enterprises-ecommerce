# 🔍 WooCommerce API Test Results & Troubleshooting

## **📊 Current Status**

**Configuration Status**: ✅ Complete
- **WordPress URL**: `https://url-purple-fox-895997.hostingersite.com`
- **Consumer Key**: `ck_27453a911616e9c45e425b95cda36c582b1f519a`
- **Consumer Secret**: `cs_75f7bcd3b9d45f711781b33b656f1d4267725d29`

## **🧪 Manual Testing Guide**

### **1. Browser Testing**

**Test these URLs directly in your browser:**

```
https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/products?consumer_key=ck_27453a911616e9c45e425b95cda36c582b1f519a&consumer_secret=cs_75f7bcd3b9d45f711781b33b656f1d4267725d29
```

**Expected Response**: JSON array of products

### **2. Postman Testing**

**Create a new request in Postman:**
```
GET: https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/products
Authorization: Basic Auth
Username: ck_27453a911616e9c45e425b95cda36c582b1f519a
Password: cs_75f7bcd3b9d45f711781b33b656f1d4267725d29
```

### **3. Local Server Testing**

**Start your Node.js server:**
```bash
npm start
```

**Then test these endpoints:**
- `http://localhost:3000/api/wc/status`
- `http://localhost:3000/api/wc/products`
- `http://localhost:3000/api/wc/categories`

## **🔧 Troubleshooting Steps**

### **1. Check WordPress REST API**

**Test basic REST API:**
```
https://url-purple-fox-895997.hostingersite.com/wp-json/
```

**If this fails:**
- WordPress REST API might be disabled
- SSL certificate issues
- Server configuration problems

### **2. Check WooCommerce REST API**

**Test WooCommerce endpoint:**
```
https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/
```

**If this fails:**
- WooCommerce might not be installed
- REST API might be disabled
- Authentication required

### **3. Check Authentication**

**Test with basic auth:**
```bash
curl -u ck_27453a911616e9c45e425b95cda36c582b1f519a:cs_75f7bcd3b9d45f711781b33b656f1d4267725d29 \
  https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/products
```

## **⚙️ WordPress Configuration Checklist**

### **1. Enable REST API**

**In WordPress Admin:**
- ✅ Go to **WooCommerce → Settings → Advanced → REST API**
- ✅ Ensure REST API is enabled
- ✅ Check that your keys have **Read/Write** permissions

### **2. Check SSL Certificate**

**Verify SSL:**
- ✅ Your site uses HTTPS
- ✅ SSL certificate is valid
- ✅ No mixed content warnings

### **3. Check Permalinks**

**In WordPress Admin:**
- ✅ Go to **Settings → Permalinks**
- ✅ Select **Post name** or **Custom Structure**
- ✅ Save changes (this refreshes rewrite rules)

### **4. Check .htaccess**

**Ensure .htaccess has:**
```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

## **🔍 Debug Mode**

**Enable WordPress debug mode:**
```php
// Add to wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

**Check error logs:**
- WordPress: `wp-content/debug.log`
- Server: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`

## **📱 Testing Script**

**Create a simple test file:**

```javascript
// test-api-simple.js
const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.get('https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/products', {
      auth: {
        username: 'ck_27453a911616e9c45e425b95cda36c582b1f519a',
        password: 'cs_75f7bcd3b9d45f711781b33b656f1d4267725d29'
      },
      params: { per_page: 1 }
    });
    
    console.log('✅ API Working!');
    console.log('Products found:', response.data.length);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.message);
  }
}

testAPI();
```

## **🎯 Quick Fix Checklist**

1. **✅ WordPress URL**: `https://url-purple-fox-895997.hostingersite.com`
2. **✅ WooCommerce**: Ensure WooCommerce plugin is installed and active
3. **✅ REST API**: Ensure REST API is enabled in WooCommerce settings
4. **✅ SSL**: Ensure HTTPS is working
5. **✅ Permissions**: Ensure API keys have proper permissions

## **📞 Support**

**If issues persist:**
1. **Check WooCommerce documentation**: https://woocommerce.github.io/woocommerce-rest-api-docs/
2. **Contact Hostinger support**: For server-specific issues
3. **Check WordPress error logs**: For detailed error messages

## **🚀 Ready to Test**

**Your API is configured and ready. Test these URLs:**

**Direct WooCommerce API:**
```
https://url-purple-fox-895997.hostingersite.com/wp-json/wc/v3/products?consumer_key=ck_27453a911616e9c45e425b95cda36c582b1f519a&consumer_secret=cs_75f7bcd3b9d45f711781b33b656f1d4267725d29
```

**Your Node.js wrapper:**
```
http://localhost:3000/api/wc/products
```

**Start testing now!**
