const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const crmRepo = require('./db/crmRepository');

const healthRoutes = require('./routes/healthRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const followupRoutes = require('./routes/followupRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Auto-seed check on startup
crmRepo.init();

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', customerRoutes);
app.use('/api', followupRoutes);
app.use('/api', exportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'SmartCRM - WooCommerce Customer Hub API',
    version: '1.0.0',
    mode: config.useMockData ? 'mock' : 'live',
    docs: '/api/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = config.port;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` SmartCRM Backend Server is running on port ${PORT}`);
    console.log(` Mode: ${config.useMockData ? 'MOCK MODE (simulated integration)' : 'LIVE WOOCOMMERCE'}`);
    console.log(` Store: ${config.wooCommerce.url || 'Mock WooCommerce Store'}`);
    console.log(` Database: ${config.mongodbUri ? 'MongoDB' : 'JSON File Store (server/data/db.json)'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
