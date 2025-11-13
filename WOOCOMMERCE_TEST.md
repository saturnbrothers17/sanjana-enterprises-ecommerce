# 🎯 WooCommerce API Test Guide

## **✅ Packages Already Installed**

Your project already has the correct WooCommerce packages:
- ✅ `@woocommerce/woocommerce-rest-api` - Official WooCommerce REST API client
- ✅ `axios` - HTTP client for API requests

## **🧪 Quick Test Commands**

### **1. Test WooCommerce API Connection**
```bash
# Run the test script
node test-woocommerce.js
```

### **2. Manual API Test**
```bash
# Test API status
curl http://localhost:3000/api/wc/status

# Test products
curl http://localhost:3000/api/wc/products

# Test categories
curl http://localhost:3000/api/wc/categories
```

### **3. Browser Test**
```javascript
// Open browser console and run:
fetch('/api/wc/products')
  .then(res => res.json())
  .then(data => console.log(data));
```

## **🔄 Update WordPress URL**

**Before testing, update your .env file:**
```bash
WOOCOMMERCE_URL=https://your-actual-wordpress-site.com
```

## **🚀 Ready to Start**

1. **Start your server:**
```bash
npm start
```

2. **Test the API:**
```bash
# In another terminal
node test-woocommerce.js
```

3. **Visit endpoints:**
- http://localhost:3000/api/wc/status
- http://localhost:3000/api/wc/products
- http://localhost:3000/api/wc/categories

## **📋 Available Scripts**

```bash
npm start          # Start the server
npm run dev        # Start with nodemon
npm test           # Run tests (if any)
```

## **🎯 Your WooCommerce API is Ready!**

No additional packages needed - everything is already installed and configured. Just update your WordPress URL and start testing!
