const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.WOOCOMMERCE_URL;
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const isMock = process.env.USE_MOCK_DATA === 'true';

async function testWoo() {
  console.log('==================================================');
  console.log(' SMARTCRM - WOOCOMMERCE REST API VERIFICATION');
  console.log('==================================================');
  console.log(`Current Mode: ${isMock ? 'MOCK MODE (USE_MOCK_DATA=true)' : 'LIVE MODE'}`);
  console.log(`Store URL: ${url || 'NOT SET'}`);
  console.log(`Consumer Key: ${consumerKey ? consumerKey.slice(0, 7) + '...' : 'NOT SET'}`);
  console.log('--------------------------------------------------');

  if (!url || !consumerKey || !consumerSecret || url.includes('your-store')) {
    console.log('[FAIL] WooCommerce credentials are not configured or still have placeholder values.');
    console.log('Reason: Please update server/.env with your valid WordPress / WooCommerce URL and REST API keys.');
    process.exit(1);
  }

  const cleanUrl = url.replace(/\/+$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const client = axios.create({
    baseURL: `${cleanUrl}/wp-json/wc/v3`,
    headers: {
      Authorization: authHeader,
      'User-Agent': 'SmartCRM-WooHub/1.0',
    },
    timeout: 10000,
  });

  try {
    console.log('1. Connecting to WooCommerce Store...');
    const custRes = await client.get('/customers', { params: { per_page: 1 } });
    console.log(`[PASS] Customer endpoint reachable. Total store customers: ${custRes.headers['x-wp-total'] || custRes.data.length}`);

    console.log('2. Testing Orders endpoint...');
    const ordRes = await client.get('/orders', { params: { per_page: 1 } });
    console.log(`[PASS] Order endpoint reachable. Total store orders: ${ordRes.headers['x-wp-total'] || ordRes.data.length}`);

    console.log('--------------------------------------------------');
    console.log('[PASS] WooCommerce REST API credentials verified successfully!');
    console.log('==================================================');
    process.exit(0);
  } catch (err) {
    console.log('--------------------------------------------------');
    console.log('[FAIL] Could not verify WooCommerce REST API connection.');
    if (err.response) {
      console.log(`HTTP Status: ${err.response.status} ${err.response.statusText}`);
      console.log(`API Message: ${JSON.stringify(err.response.data)}`);
    } else {
      console.log(`Network / SSL Error: ${err.message}`);
    }
    console.log('==================================================');
    process.exit(1);
  }
}

testWoo();
