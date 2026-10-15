const config = require('../config');
const mockAdapter = require('./mockAdapter');
const wooAdapter = require('./wooAdapter');

function getAdapter() {
  if (config.useMockData) {
    return mockAdapter;
  }
  return wooAdapter;
}

function getActiveMode() {
  return config.useMockData ? 'mock' : 'live';
}

module.exports = {
  getAdapter,
  getActiveMode,
  mockAdapter,
  wooAdapter,
};
