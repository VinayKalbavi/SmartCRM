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
  jwtSecret: process.env.JWT_SECRET || 'smartcrm_jwt_super_secret_key_8f3a8b92c4e1f0e6b7d5a3c2e1f4a9b8',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-google-client-id.apps.googleusercontent.com',
  dataPath: path.join(__dirname, '../data'),
  dbJsonPath: path.join(__dirname, '../data/db.json'),
  mockWooJsonPath: path.join(__dirname, '../data/mock-woo.json'),
};
