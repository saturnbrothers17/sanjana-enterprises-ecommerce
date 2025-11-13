const axios = require('axios');

async function testWooCommerceAPI() {
  console.log('🔍 Testing WooCommerce API...');
  
  const baseURL = 'https://purple-fox-895997.hostingersite.com/wp-json/wc/v3';
  const consumerKey = 'ck_27453a911616e9c45e425b95cda36c582b1f519a';
  const consumerSecret = 'cs_75f7bcd3b9d45f711781b33b656f1d4267725d29';
  
  const config = {
    params: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    },
    timeout: 10000
  };
  
  try {
    // Test system status
    console.log('1. Testing system status...');
    const statusResponse = await axios.get(`${baseURL}/system_status`, config);
    console.log('   ✅ Status check successful');
    console.log('   WooCommerce version:', statusResponse.data.environment?.version);
    
  } catch (error) {
    console.error('   ❌ Status check failed:', error.response?.status, error.message);
  }
  
  try {
    // Test products
    console.log('2. Testing products...');
    const productsResponse = await axios.get(`${baseURL}/products`, {
      ...config,
      params: {
        ...config.params,
        per_page: 5
      }
    });
    console.log('   ✅ Products endpoint accessible');
    console.log('   Products found:', productsResponse.data.length);
    
  } catch (error) {
    console.error('   ❌ Products check failed:', error.response?.status, error.message);
  }
  
  try {
    // Test categories
    console.log('3. Testing categories...');
    const categoriesResponse = await axios.get(`${baseURL}/products/categories`, {
      ...config,
      params: {
        ...config.params,
        per_page: 10
      }
    });
    console.log('   ✅ Categories endpoint accessible');
    console.log('   Categories found:', categoriesResponse.data.length);
    
  } catch (error) {
    console.error('   ❌ Categories check failed:', error.response?.status, error.message);
  }
  
  try {
    // Test orders (should be empty but accessible)
    console.log('4. Testing orders...');
    const ordersResponse = await axios.get(`${baseURL}/orders`, {
      ...config,
      params: {
        ...config.params,
        per_page: 1
      }
    });
    console.log('   ✅ Orders endpoint accessible');
    console.log('   Orders found:', ordersResponse.data.length);
    
  } catch (error) {
    console.error('   ❌ Orders check failed:', error.response?.status, error.message);
  }
  
  console.log('\n🎉 WooCommerce API test completed!');
  console.log('💡 Add products to your WooCommerce store to see them in your API');
}

testWooCommerceAPI();
