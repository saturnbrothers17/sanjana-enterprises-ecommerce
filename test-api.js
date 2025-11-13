const axios = require('axios');

async function testWooCommerceAPI() {
  console.log('🔍 Testing WooCommerce API...');
  
  try {
    // Test with query parameters instead of basic auth
    const response = await axios.get('https://purple-fox-895997.hostingersite.com/wp-json/wc/v3/products', {
      params: {
        consumer_key: 'ck_27453a911616e9c45e425b95cda36c582b1f519a',
        consumer_secret: 'cs_75f7bcd3b9d45f711781b33b656f1d4267725d29',
        per_page: 1
      },
      timeout: 10000
    });
    
    console.log('✅ API Success!');
    console.log('Products found:', response.data.length);
    if (response.data.length > 0) {
      console.log('First product:', response.data[0].name);
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWooCommerceAPI();
