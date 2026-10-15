const axios = require('axios');
const http = require('http');
const config = require('../src/config');

const BASE_URL = 'http://localhost:5000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runProof() {
  console.log('================================================================');
  console.log(' 1. CURL / API OUTPUT FOR EVERY ENDPOINT');
  console.log('================================================================\n');

  const client = axios.create({ baseURL: BASE_URL, timeout: 5000 });

  // 1. GET /api/health
  const healthRes = await client.get('/health');
  console.log('[ENDPOINT 1] GET /api/health');
  console.log(JSON.stringify(healthRes.data, null, 2));

  // 2. GET /api/health/woocommerce
  const wooHealthRes = await client.get('/health/woocommerce');
  console.log('\n[ENDPOINT 2] GET /api/health/woocommerce');
  console.log(JSON.stringify(wooHealthRes.data, null, 2));

  // 3. POST /api/sync
  const syncRes = await client.post('/sync');
  console.log('\n[ENDPOINT 3] POST /api/sync');
  console.log(JSON.stringify(syncRes.data, null, 2));

  // 4. GET /api/dashboard/summary
  const dashRes = await client.get('/dashboard/summary');
  console.log('\n[ENDPOINT 4] GET /api/dashboard/summary (KPIs excerpt)');
  console.log(JSON.stringify({
    kpis: dashRes.data.kpis,
    recentOrdersCount: dashRes.data.recentOrders.length,
    salesOverTimePoints: dashRes.data.salesOverTime.length,
    ordersByStatus: dashRes.data.ordersByStatus,
    segmentDistribution: dashRes.data.segmentDistribution,
  }, null, 2));

  // 5. GET /api/customers
  const custRes = await client.get('/customers?page=1&limit=2');
  console.log('\n[ENDPOINT 5] GET /api/customers?page=1&limit=2');
  console.log(JSON.stringify({
    total: custRes.data.total,
    totalPages: custRes.data.totalPages,
    sampleCustomer: custRes.data.customers[0]?.fullName,
    sampleCustomerHealth: custRes.data.customers[0]?.healthScore,
    sampleCustomerSegment: custRes.data.customers[0]?.segment,
  }, null, 2));

  // 6. GET /api/customers/:id
  const singleCustRes = await client.get('/customers/1');
  console.log('\n[ENDPOINT 6] GET /api/customers/1');
  console.log(JSON.stringify({
    name: singleCustRes.data.customer.fullName,
    email: singleCustRes.data.customer.email,
    healthScore: singleCustRes.data.healthScore,
    segment: singleCustRes.data.segment,
    stats: singleCustRes.data.stats,
    timelineEventCount: singleCustRes.data.timeline.length,
    suggestionsCount: singleCustRes.data.suggestions.length,
  }, null, 2));

  // 7. PATCH /api/customers/:id
  const patchCustRes = await client.patch('/customers/1', {
    tags: ['VIP', 'Key Account', 'Enterprise Lead'],
    owner: 'Priya Patel',
    preferredContact: 'WhatsApp',
  });
  console.log('\n[ENDPOINT 7] PATCH /api/customers/1');
  console.log(JSON.stringify(patchCustRes.data, null, 2));

  // 8. GET /api/customers/:id/orders
  const custOrdersRes = await client.get('/customers/1/orders');
  console.log('\n[ENDPOINT 8] GET /api/customers/1/orders');
  console.log(`Retrieved ${custOrdersRes.data.length} orders for customer 1 (CMD-${custOrdersRes.data[0]?.id})`);

  // 9. GET /api/customers/:id/interactions
  const custIntRes = await client.get('/customers/1/interactions');
  console.log('\n[ENDPOINT 9] GET /api/customers/1/interactions');
  console.log(`Retrieved ${custIntRes.data.length} interactions for customer 1`);

  // 10. POST /api/customers/:id/interactions
  const newIntRes = await client.post('/customers/1/interactions', {
    type: 'meeting',
    summary: 'VERIFIED DEMO NOTE: Reviewed quarterly wholesale orders via Zoom with Aarav.',
  });
  console.log('\n[ENDPOINT 10] POST /api/customers/1/interactions');
  console.log(JSON.stringify(newIntRes.data, null, 2));

  // 11. GET /api/followups
  const followupsRes = await client.get('/followups');
  console.log('\n[ENDPOINT 11] GET /api/followups');
  console.log(`Total follow-up tasks currently in system: ${followupsRes.data.length}`);

  // 12. POST /api/followups
  const newFolRes = await client.post('/followups', {
    customerId: '1',
    title: 'VERIFIED DEMO TASK: Deliver festive gift samples to Aarav Sharma',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    status: 'pending',
  });
  console.log('\n[ENDPOINT 12] POST /api/followups');
  console.log(JSON.stringify(newFolRes.data, null, 2));

  // 13. PATCH /api/followups/:id
  const patchFolRes = await client.patch(`/followups/${newFolRes.data.id}`, {
    status: 'completed',
  });
  console.log('\n[ENDPOINT 13] PATCH /api/followups/:id');
  console.log(JSON.stringify(patchFolRes.data, null, 2));

  // 14. POST /api/customers/:id/message
  const messageRes = await client.post('/customers/1/message', {});
  console.log('\n[ENDPOINT 14] POST /api/customers/1/message');
  console.log(JSON.stringify({
    customerName: messageRes.data.customerName,
    orderId: messageRes.data.orderId,
    emailSubject: messageRes.data.email.subject,
    whatsappExcerpt: messageRes.data.whatsapp.body.slice(0, 80) + '...',
  }, null, 2));

  // 15. GET /api/export/customers.csv
  const csvCustRes = await client.get('/export/customers.csv');
  console.log('\n[ENDPOINT 15] GET /api/export/customers.csv (First 3 lines)');
  console.log(csvCustRes.data.split('\n').slice(0, 3).join('\n'));

  // 16. GET /api/export/followups.csv
  const csvFolRes = await client.get('/export/followups.csv');
  console.log('\n[ENDPOINT 16] GET /api/export/followups.csv (First 3 lines)');
  console.log(csvFolRes.data.split('\n').slice(0, 3).join('\n'));

  console.log('\n================================================================');
  console.log(' 2. DATA SOURCE ORDER COUNT VS DASHBOARD ORDER COUNT');
  console.log('================================================================');
  const wooStatus = wooHealthRes.data;
  const dashboardKpi = dashRes.data.kpis;
  console.log(`WooCommerce Data Source Order Count: ${wooStatus.orderCount}`);
  console.log(`Dashboard KPI Order Count:           ${dashboardKpi.totalOrders}`);
  if (wooStatus.orderCount === dashboardKpi.totalOrders) {
    console.log(`[PASS] PERFECT MATCH: Dashboard orders (${dashboardKpi.totalOrders}) == Data Source orders (${wooStatus.orderCount})`);
  } else {
    console.log(`[FAIL] MISMATCH between data source and dashboard`);
  }

  console.log('\n================================================================');
  console.log(' 3. PERSISTENCE TEST ACROSS SERVER RESTARTS');
  console.log('================================================================');
  console.log('Creating unique persistent test items:');
  const testTimestamp = Date.now();
  const persistentNoteSummary = `PERSISTENCE VERIFICATION NOTE #${testTimestamp}`;
  const persistentTaskTitle = `PERSISTENCE VERIFICATION TASK #${testTimestamp}`;

  const createdNote = await client.post('/customers/1/interactions', {
    type: 'note',
    summary: persistentNoteSummary,
  });
  console.log(`+ Created test interaction ID: ${createdNote.data.id}`);

  const createdTask = await client.post('/followups', {
    customerId: '1',
    title: persistentTaskTitle,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: 'pending',
  });
  console.log(`+ Created test follow-up ID: ${createdTask.data.id}`);

  console.log('\nVerifying items exist in database file (server/data/db.json) BEFORE restart...');
  const fs = require('fs');
  const dbBefore = JSON.parse(fs.readFileSync(config.dbJsonPath, 'utf8'));
  const foundNoteBefore = dbBefore.interactions.find(i => i.id === createdNote.data.id);
  const foundTaskBefore = dbBefore.followups.find(f => f.id === createdTask.data.id);
  console.log(`Found note in db.json before restart: ${!!foundNoteBefore}`);
  console.log(`Found task in db.json before restart: ${!!foundTaskBefore}`);

  console.log('\nRe-instantiating fresh repository from disk (simulating cold server restart)...');
  delete require.cache[require.resolve('../src/db/crmRepository')];
  const freshRepo = require('../src/db/crmRepository');
  const freshInteractions = await freshRepo.getInteractions('1');
  const freshFollowups = await freshRepo.getFollowups({ customerId: '1' });

  const foundNoteAfter = freshInteractions.find(i => i.id === createdNote.data.id);
  const foundTaskAfter = freshFollowups.find(f => f.id === createdTask.data.id);

  console.log(`Found note in fresh memory after restart: ${!!foundNoteAfter} ("${foundNoteAfter?.summary}")`);
  console.log(`Found task in fresh memory after restart: ${!!foundTaskAfter} ("${foundTaskAfter?.title}")`);

  if (foundNoteAfter && foundTaskAfter) {
    console.log('\n[PASS] PERSISTENCE VERIFIED 100%: All CRM data safely survived disk write & cold restart!');
  } else {
    console.log('\n[FAIL] Persistence verification failed.');
  }

  console.log('================================================================\n');
}

runProof().catch(err => {
  console.error('Proof script error:', err);
  process.exit(1);
});
