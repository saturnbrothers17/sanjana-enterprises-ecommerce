// Diagnostic test for WooCommerce API
const axios = require('axios');

console.log('🔍 WooCommerce API Diagnostic Test');
console.log('==================================');

const WORDPRESS_URL = 'https://url-purple-fox-895997.hostingersite.com';
const CONSUMER_KEY = 'ck_27453a911616e9c45e425b95cda36c582b1f519a';
const CONSUMER_SECRET = 'cs_75f7bcd3b9d45f711781b33b656f1d4267725d29';

async function runDiagnostics() {
  console.log('📊 Testing connectivity...');
  
  // Test 1: Basic site accessibility
  try {
    console.log('1. Testing WordPress site...');
    const siteResponse = await axios.get(WORDPRESS_URL, { timeout: 10000 });
    console.log('   ✅ Site accessible:', siteResponse.status);
  } catch (error) {
    console.log('   ❌ Site not accessible:', error.message);
    console.log('   💡 Check if the domain is correct and accessible');
    return;
  }

  // Test 2: WordPress REST API
  try {
    console.log('2. Testing WordPress REST API...');
    const wpResponse = await axios.get(`${WORDPRESS_URL}/wp-json/`, { timeout: 10000 });
    console.log('   ✅ WordPress REST API accessible');
  } catch (error) {
    console.log('   ❌ WordPress REST API not accessible:', error.response?.status || error.message);
    console.log('   💡 Check if WordPress REST API is enabled');
    return;
  }

  // Test 3: WooCommerce REST API
  try {
    console.log('3. Testing WooCommerce REST API...');
    const wcResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wc/v3/`, { timeout: 10000 });
    console.log('   ✅ WooCommerce REST API accessible');
  } catch (error) {
    console.log('   ❌ WooCommerce REST API not accessible:', error.response?.status || error.message);
    console.log('   💡 Check if WooCommerce is installed and REST API is enabled');
    return;
  }

  // Test 4: Authentication
  try {
    console.log('4. Testing WooCommerce authentication...');
    const authResponse = await axios.get(
      `${WORDPRESS_URL}/wp-json/wc/v3/products?per_page=1`,
      {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        },
        timeout: 10000
      }
    );
    console.log('   ✅ Authentication successful');
    console.log('   ✅ Products found:', authResponse.data.length);
    
    if (authResponse.data.length > 0) {
      console.log('   ✅ Sample product:', authResponse.data[0].name);
    }
    
  } catch (error) {
    console.log('   ❌ Authentication failed:', error.response?.status || error.message);
    
    if (error.response?.status === 401) {
      console.log('   💡 Check if consumer key/secret are correct');
      console.log('   💡 Ensure keys have proper permissions');
    } else if (error.response?.status === 404) {
      console.log('   💡 Check if WooCommerce is installed');
    } else {
      console.log('   💡 Check server configuration');
    }
    return;
  }

  console.log('\n🎉 All tests passed! WooCommerce API is working perfectly!');
  console.log('📱 Ready to use with your Node.js app');
}

// Run diagnostics
runDiagnostics().catch(console.error);
