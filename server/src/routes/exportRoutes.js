const express = require('express');
const router = express.Router();
const { getAdapter } = require('../adapters');
const crmRepo = require('../db/crmRepository');

function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

// GET /api/export/customers.csv
router.get('/export/customers.csv', async (req, res, next) => {
  try {
    const adapter = getAdapter();
    const customers = await adapter.getCustomers();

    const headers = [
      'Customer ID',
      'Full Name',
      'Email',
      'Phone',
      'City',
      'State',
      'Total Spent (INR)',
      'Orders Count',
      'Last Order Date',
      'Health Score',
      'Segment',
      'Owner',
      'Preferred Contact',
      'Tags',
    ];

    const rows = customers.map(c => [
      escapeCsv(c.id),
      escapeCsv(c.fullName),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.city),
      escapeCsv(c.state),
      escapeCsv(c.totalSpent),
      escapeCsv(c.ordersCount),
      escapeCsv(c.lastOrderDate || 'None'),
      escapeCsv(c.healthScore),
      escapeCsv(c.segment),
      escapeCsv(c.owner),
      escapeCsv(c.preferredContact),
      escapeCsv((c.tags || []).join('; ')),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
});

// GET /api/export/followups.csv
router.get('/export/followups.csv', async (req, res, next) => {
  try {
    const adapter = getAdapter();
    const [followups, customers] = await Promise.all([
      crmRepo.getFollowups(),
      adapter.getCustomers(),
    ]);

    const custMap = new Map(customers.map(c => [String(c.id), c]));

    const headers = [
      'Followup ID',
      'Customer ID',
      'Customer Name',
      'Customer Email',
      'Title',
      'Due Date',
      'Status',
      'Created At',
      'Completed At',
    ];

    const rows = followups.map(f => {
      const cust = custMap.get(String(f.customerId));
      return [
        escapeCsv(f.id),
        escapeCsv(f.customerId),
        escapeCsv(cust?.fullName || 'Unknown Customer'),
        escapeCsv(cust?.email || ''),
        escapeCsv(f.title),
        escapeCsv(f.dueDate),
        escapeCsv(f.status),
        escapeCsv(f.createdAt),
        escapeCsv(f.completedAt || 'N/A'),
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="followups.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
