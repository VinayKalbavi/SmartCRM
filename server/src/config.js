const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  useMockData: process.env.USE_MOCK_DATA === 'true' || !process.env.WOOCOMMERCE_URL || process.env.WOOCOMMERCE_URL.includes('your-store'),
  wooCommerce: {
    url: process.env.WOOCOMMERCE_URL || '',
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
  },
  mongodbUri: process.env.MONGODB_URI || '',
  dataPath: path.join(__dirname, '../data'),
  dbJsonPath: path.join(__dirname, '../data/db.json'),
  mockWooJsonPath: path.join(__dirname, '../data/mock-woo.json'),
};
