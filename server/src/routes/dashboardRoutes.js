const express = require('express');
const router = express.Router();
const { getAdapter } = require('../adapters');
const crmRepo = require('../db/crmRepository');

// POST /api/sync
router.post('/sync', async (req, res, next) => {
  try {
    const adapter = getAdapter();
    const result = await adapter.sync();
    res.json({
      success: true,
      message: 'WooCommerce data synchronized successfully',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/summary
router.get('/dashboard/summary', async (req, res, next) => {
  try {
    const adapter = getAdapter();
    const [customers, orders, allFollowups] = await Promise.all([
      adapter.getCustomers(),
      adapter.getOrders(),
      crmRepo.getFollowups(),
    ]);

    const now = new Date();

    // 1. KPIs
    const totalCustomers = customers.length;
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'processing');
    const totalSales = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
    
    const pendingFollowupsList = allFollowups.filter(f => f.status === 'pending');
    const overdueFollowupsList = pendingFollowupsList.filter(f => new Date(f.dueDate) < now);

    // 2. Recent orders (latest 8)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      .slice(0, 8);

    // 3. Pending & Overdue Follow-ups (with customer name)
    const custMap = new Map(customers.map(c => [String(c.id), c]));
    const followupsWithCustomer = allFollowups
      .filter(f => f.status === 'pending')
      .slice(0, 6)
      .map(f => {
        const cust = custMap.get(String(f.customerId));
        return {
          ...f,
          customerName: cust?.fullName || 'Unknown Customer',
          customerEmail: cust?.email || '',
          isOverdue: new Date(f.dueDate) < now,
        };
      });

    // 4. Sales over time (group by month/recent periods)
    const salesByPeriodMap = {};
    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      const d = new Date(order.dateCreated);
      // Format as Month Year or YYYY-MM
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!salesByPeriodMap[key]) {
        salesByPeriodMap[key] = { period: key, sales: 0, orders: 0, timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime() };
      }
      salesByPeriodMap[key].sales += order.total;
      salesByPeriodMap[key].orders += 1;
    });

    const salesOverTime = Object.values(salesByPeriodMap)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => ({
        period: item.period,
        sales: Math.round(item.sales),
        orders: item.orders,
      }));

    // 5. Orders by status donut
    const statusCounts = {};
    orders.forEach(order => {
      const s = order.status || 'unknown';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const ordersByStatus = Object.keys(statusCounts).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status],
      status: status,
    }));

    // 6. Segment distribution
    const segmentCounts = {
      VIP: 0,
      Loyal: 0,
      Active: 0,
      New: 0,
      'At-Risk': 0,
      Churned: 0,
    };
    customers.forEach(c => {
      if (segmentCounts[c.segment] !== undefined) {
        segmentCounts[c.segment]++;
      } else {
        segmentCounts['Active']++;
      }
    });

    const segmentDistribution = Object.keys(segmentCounts).map(seg => ({
      name: seg,
      count: segmentCounts[seg],
    }));

    // 7. At-Risk customers to contact
    const atRiskCustomers = customers
      .filter(c => c.segment === 'At-Risk' || c.segment === 'Churned')
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        totalSpent: c.totalSpent,
        daysSinceLastOrder: c.daysSinceLastOrder,
        segment: c.segment,
        healthScore: c.healthScore,
      }));

    res.json({
      kpis: {
        totalCustomers,
        totalOrders,
        totalSales: Math.round(totalSales),
        pendingFollowups: pendingFollowupsList.length,
        overdueFollowups: overdueFollowupsList.length,
      },
      recentOrders,
      pendingFollowups: followupsWithCustomer,
      salesOverTime,
      ordersByStatus,
      segmentDistribution,
      atRiskCustomers,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
