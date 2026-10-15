const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runSmokeTests() {
  console.log('===============================================================');
  console.log(' SMARTCRM - COMPREHENSIVE API SMOKE TESTS');
  console.log(` Target: ${BASE_URL}`);
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;
  let createdFollowupId = null;

  async function test(name, fn) {
    try {
      const result = await fn();
      console.log(`[PASS] ${name}`);
      if (result) {
        console.log(`       ↳ ${result}`);
      }
      passed++;
    } catch (err) {
      console.log(`[FAIL] ${name}`);
      console.log(`       ↳ Error: ${err.response?.data?.error || err.message}`);
      failed++;
    }
  }

  // 1. Health
  await test('GET /api/health', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'ok') throw new Error('Status not ok');
    return `Mode: ${res.data.mode}, DB: ${res.data.dbType}`;
  });

  // 2. Health WooCommerce
  await test('GET /api/health/woocommerce', async () => {
    const res = await axios.get(`${BASE_URL}/health/woocommerce`);
    if (res.data.connected === undefined) throw new Error('Missing connected flag');
    return `Connected: ${res.data.connected}, Customers: ${res.data.customerCount}, Orders: ${res.data.orderCount}`;
  });

  // 3. Sync
  await test('POST /api/sync', async () => {
    const res = await axios.post(`${BASE_URL}/sync`);
    if (!res.data.success) throw new Error('Sync unsuccessful');
    return `Sync message: ${res.data.message}`;
  });

  // 4. Dashboard Summary
  await test('GET /api/dashboard/summary', async () => {
    const res = await axios.get(`${BASE_URL}/dashboard/summary`);
    const { kpis, recentOrders, salesOverTime, ordersByStatus } = res.data;
    if (!kpis || !recentOrders || !salesOverTime) throw new Error('Missing dashboard payload');
    return `KPIs: ${kpis.totalCustomers} Customers, ${kpis.totalOrders} Orders, ₹${kpis.totalSales} Sales`;
  });

  // 5. Customers List
  await test('GET /api/customers', async () => {
    const res = await axios.get(`${BASE_URL}/customers`);
    if (!Array.isArray(res.data.customers)) throw new Error('Customers is not an array');
    return `Loaded ${res.data.customers.length} of ${res.data.total} customers (Page 1/${res.data.totalPages})`;
  });

  // 6. Customers Filter & Search
  await test('GET /api/customers?search=Aarav&segment=all', async () => {
    const res = await axios.get(`${BASE_URL}/customers`, { params: { search: 'Aarav', segment: 'all' } });
    if (res.data.customers.length === 0) throw new Error('Search Aarav returned 0');
    return `Found ${res.data.customers.length} match: ${res.data.customers[0].fullName} (${res.data.customers[0].segment})`;
  });

  // 7. Customer Unified Profile
  await test('GET /api/customers/1', async () => {
    const res = await axios.get(`${BASE_URL}/customers/1`);
    const { customer, orders, interactions, followups, timeline, stats, suggestions } = res.data;
    if (!customer || !timeline || !stats) throw new Error('Profile structure incomplete');
    return `${customer.fullName}: Health ${customer.healthScore}/100, ${orders.length} orders, ${timeline.length} timeline events, ${suggestions.length} suggestions`;
  });

  // 8. Patch Customer CRM Fields
  await test('PATCH /api/customers/1', async () => {
    const res = await axios.patch(`${BASE_URL}/customers/1`, {
      tags: ['VIP', 'Key Account', 'Enterprise'],
      owner: 'Priya Patel',
      preferredContact: 'WhatsApp',
    });
    if (!res.data.success) throw new Error('Patch failed');
    return `Updated CRM: Tags [${res.data.crm.tags.join(', ')}], Owner: ${res.data.crm.owner}`;
  });

  // 9. Customer Orders
  await test('GET /api/customers/1/orders', async () => {
    const res = await axios.get(`${BASE_URL}/customers/1/orders`);
    if (!Array.isArray(res.data)) throw new Error('Expected orders array');
    return `Fetched ${res.data.length} orders for customer #1`;
  });

  // 10. Customer Interactions
  await test('GET /api/customers/1/interactions', async () => {
    const res = await axios.get(`${BASE_URL}/customers/1/interactions`);
    if (!Array.isArray(res.data)) throw new Error('Expected interactions array');
    return `Fetched ${res.data.length} interactions for customer #1`;
  });

  // 11. Add Customer Interaction
  await test('POST /api/customers/1/interactions', async () => {
    const res = await axios.post(`${BASE_URL}/customers/1/interactions`, {
      type: 'call',
      summary: 'Smoke test verification call: confirmed delivery satisfaction.',
    });
    if (!res.data.id) throw new Error('Missing interaction ID');
    return `Created interaction ID: ${res.data.id} (${res.data.type})`;
  });

  // 12. Follow-ups List
  await test('GET /api/followups', async () => {
    const res = await axios.get(`${BASE_URL}/followups`);
    if (!Array.isArray(res.data)) throw new Error('Expected followups array');
    return `Total follow-ups: ${res.data.length}`;
  });

  // 13. Create Follow-up
  await test('POST /api/followups', async () => {
    const res = await axios.post(`${BASE_URL}/followups`, {
      customerId: '1',
      title: 'Smoke Test Scheduled Check-in',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
    });
    if (!res.data.id) throw new Error('Missing followup ID');
    createdFollowupId = res.data.id;
    return `Created followup ID: ${res.data.id} for Customer #1`;
  });

  // 14. Patch Follow-up
  await test(`PATCH /api/followups/:id`, async () => {
    if (!createdFollowupId) throw new Error('No test followup to patch');
    const res = await axios.patch(`${BASE_URL}/followups/${createdFollowupId}`, {
      status: 'completed',
    });
    if (res.data.status !== 'completed' || !res.data.completedAt) throw new Error('Status not updated to completed');
    return `Updated followup ${createdFollowupId} to completed at ${res.data.completedAt}`;
  });

  // 15. Message Template Generator
  await test('POST /api/customers/1/message', async () => {
    const res = await axios.post(`${BASE_URL}/customers/1/message`, {});
    if (!res.data.email || !res.data.whatsapp) throw new Error('Missing templates');
    return `Generated Email subject: "${res.data.email.subject.slice(0, 40)}..."`;
  });

  // 16. CSV Export Customers
  await test('GET /api/export/customers.csv', async () => {
    const res = await axios.get(`${BASE_URL}/export/customers.csv`);
    if (!res.data.includes('Customer ID,Full Name')) throw new Error('Invalid CSV header');
    const lineCount = res.data.trim().split('\n').length;
    return `Generated CSV with ${lineCount} rows (header + data)`;
  });

  // 17. CSV Export Followups
  await test('GET /api/export/followups.csv', async () => {
    const res = await axios.get(`${BASE_URL}/export/followups.csv`);
    if (!res.data.includes('Followup ID,Customer ID')) throw new Error('Invalid CSV header');
    const lineCount = res.data.trim().split('\n').length;
    return `Generated CSV with ${lineCount} rows (header + data)`;
  });

  console.log('\n===============================================================');
  console.log(` SMOKE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runSmokeTests();
}

module.exports = runSmokeTests;
