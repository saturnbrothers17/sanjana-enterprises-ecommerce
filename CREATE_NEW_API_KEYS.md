# 🔑 Create New WooCommerce API Keys

## **🎯 Create New Keys with Admin Permissions**

### **Step 1: Access WordPress Admin**

**Go to:**
```
https://purple-fox-895997.hostingersite.com/wp-admin
```

### **Step 2: Navigate to REST API**

**Path:**
```
WooCommerce → Settings → Advanced → REST API
```

### **Step 3: Create New API Key**

**Click:** **Add Key** or **Create API Key**

**Fill the form:**
- **Description**: `Sanjana Enterprises API`
- **User**: Select your admin user (or create new admin user)
- **Permissions**: **Read/Write**
- **Generate keys**

### **Step 4: Get New Credentials**

**You'll get:**
- **Consumer Key**: `ck_new_key_here`
- **Consumer Secret**: `cs_new_secret_here`

### **Step 5: Update .env File**

**Replace in .env:**
```bash
# OLD
WOOCOMMERCE_CONSUMER_KEY=ck_27453a911616e9c45e425b95cda36c582b1f519a
WOOCOMMERCE_CONSUMER_SECRET=cs_75f7bcd3b9d45f711781b33b656f1d4267725d29

# NEW (after you get new keys)
WOOCOMMERCE_CONSUMER_KEY=your_new_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_new_consumer_secret
```

## **📋 Complete Steps**

### **1. Create New Admin User (Recommended)**

**In WordPress Admin:**
- **Users → Add New**
- **Username**: `api-user`
- **Role**: **Administrator**
- **Create user**

### **2. Create API Key for Admin**

**Go to:**
- **WooCommerce → Settings → Advanced → REST API**
- **Add Key**
- **User**: Select the new admin user
- **Permissions**: **Read/Write**
- **Generate**

### **3. Test New Keys**

**Test immediately:**
```bash
curl -u new_consumer_key:new_consumer_secret \
  https://purple-fox-895997.hostingersite.com/wp-json/wc/v3/products
```

## **🚀 Quick Setup**

### **1. Access WordPress**
```
https://purple-fox-895997.hostingersite.com/wp-admin
```

### **2. Navigate to**
```
WooCommerce → Settings → Advanced → REST API
```

### **3. Click**
**Add Key** → **Generate new keys** → **Save**

### **4. Copy New Keys**
**Consumer Key**: `ck_...` (new key)
**Consumer Secret**: `cs_...` (new secret)

### **5. Update .env**
```bash
WOOCOMMERCE_CONSUMER_KEY=your_new_key
WOOCOMMERCE_CONSUMER_SECRET=your_new_secret
```

## **✅ Verification**

**After creating new keys:**

**Test in browser:**
```
https://purple-fox-895997.hostingersite.com/wp-json/wc/v3/products?consumer_key=NEW_KEY&consumer_secret=NEW_SECRET
```

**Test with curl:**
```bash
curl -u NEW_KEY:NEW_SECRET \
  https://purple-fox-895997.hostingersite.com/wp-json/wc/v3/products
```

## **🎯 Expected Result**

**Instead of 401, you should see:**
```json
[
  {
    "id": 1,
    "name": "Your Product Name",
    "price": "99.00"
  }
]
```

## **🚀 Ready to Create**

**Your WordPress admin is ready. Create new API keys now and your WooCommerce API will work perfectly!**
