const express = require('express');
const router = express.Router();
const config = require('../config');
const { getAdapter, getActiveMode } = require('../adapters');

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: getActiveMode(),
    isMock: config.useMockData,
    dbType: config.mongodbUri ? 'mongodb' : 'json-file',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health/woocommerce (makes a real call via the active adapter)
router.get('/health/woocommerce', async (req, res) => {
  try {
    const adapter = getAdapter();
    const status = await adapter.getStatus();
    
    // If live mode is selected but connection failed, return 200 with connected: false and error message
    res.json({
      connected: status.connected,
      isMock: status.isMock,
      storeUrl: status.storeUrl,
      customerCount: status.customerCount,
      orderCount: status.orderCount,
      error: status.error,
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      isMock: config.useMockData,
      storeUrl: config.wooCommerce.url || '',
      customerCount: 0,
      orderCount: 0,
      error: err.message,
    });
  }
});

module.exports = router;
