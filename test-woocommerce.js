// Test script to verify WooCommerce API connection
const WooCommerceAPI = require('./config/woocommerce-api');

async function testWooCommerceAPI() {
  console.log('🧪 Testing WooCommerce REST API...');
  
  try {
    // Test system status
    console.log('📊 Checking system status...');
    const status = await WooCommerceAPI.getSystemStatus();
    console.log('Status:', status);
    
    // Test getting products
    console.log('🛒 Testing products endpoint...');
    const products = await WooCommerceAPI.getAllProducts({ per_page: 5 });
    console.log('Products found:', products.data?.length || 0);
    
    if (products.success && products.data.length > 0) {
      console.log('✅ First product:', products.data[0].name);
    }
    
    // Test getting categories
    console.log('🏷️ Testing categories endpoint...');
    const categories = await WooCommerceAPI.getAllCategories({ per_page: 10 });
    console.log('Categories found:', categories.data?.length || 0);
    
    if (categories.success && categories.data.length > 0) {
      console.log('✅ First category:', categories.data[0].name);
    }
    
    console.log('🎉 WooCommerce API test completed successfully!');
    
  } catch (error) {
    console.error('❌ WooCommerce API test failed:', error.message);
    console.log('💡 Make sure to update WOOCOMMERCE_URL in .env file');
  }
}

// Run the test
if (require.main === module) {
  testWooCommerceAPI();
}

module.exports = { testWooCommerceAPI };
