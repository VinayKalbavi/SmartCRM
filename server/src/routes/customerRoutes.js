const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { getAdapter } = require('../adapters');
const crmRepo = require('../db/crmRepository');
const { generateCustomerSuggestions, generatePersonalizedMessages } = require('../services/suggestionsService');

// GET /api/customers
router.get('/customers', async (req, res, next) => {
  try {
    const adapter = getAdapter();
    let customers = await adapter.getCustomers();

    const { search, segment, sort, page = 1, limit = 10 } = req.query;

    // Filter by search (name or email)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      customers = customers.filter(c => 
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }

    // Filter by segment
    if (segment && segment !== 'all') {
      customers = customers.filter(c => c.segment.toLowerCase() === segment.toLowerCase());
    }

    // Sorting
    if (sort) {
      if (sort === 'totalSpent_desc') {
        customers.sort((a, b) => b.totalSpent - a.totalSpent);
      } else if (sort === 'totalSpent_asc') {
        customers.sort((a, b) => a.totalSpent - b.totalSpent);
      } else if (sort === 'orders_desc') {
        customers.sort((a, b) => b.ordersCount - a.ordersCount);
      } else if (sort === 'orders_asc') {
        customers.sort((a, b) => a.ordersCount - b.ordersCount);
      } else if (sort === 'health_desc') {
        customers.sort((a, b) => b.healthScore - a.healthScore);
      } else if (sort === 'health_asc') {
        customers.sort((a, b) => a.healthScore - b.healthScore);
      } else if (sort === 'name_asc') {
        customers.sort((a, b) => a.fullName.localeCompare(b.fullName));
      } else if (sort === 'name_desc') {
        customers.sort((a, b) => b.fullName.localeCompare(a.fullName));
      }
    } else {
      // Default sort by health score desc or total spent desc
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    const total = customers.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = customers.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      customers: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id (unified profile)
router.get('/customers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const adapter = getAdapter();
    const customer = await adapter.getCustomer(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const [orders, interactions, followups, crmData] = await Promise.all([
      adapter.getOrdersByCustomer(id),
      crmRepo.getInteractions(id),
      crmRepo.getFollowups({ customerId: id }),
      crmRepo.getCustomerCrm(id),
    ]);

    // Calculate detailed stats
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const orderCount = orders.length;
    const totalSpend = validOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = validOrders.length > 0 ? Math.round(totalSpend / validOrders.length) : 0;
    const lastOrder = orders[0] || null;

    // Build unified 360 Timeline
    const timeline = [];

    // Order events
    orders.forEach(order => {
      timeline.push({
        id: `event-ord-${order.id}`,
        type: 'order_placed',
        category: 'order',
        title: `Order #${order.number} Placed`,
        description: `${order.lineItems.length} item(s) • ₹${order.total.toLocaleString('en-IN')}${order.isGuest ? ' (Guest checkout linked)' : ''}`,
        timestamp: order.dateCreated,
        meta: { orderId: order.id, status: order.status, total: order.total },
        icon: 'shopping-bag',
        badgeColor: 'blue',
      });

      if (order.status === 'completed') {
        timeline.push({
          id: `event-ord-comp-${order.id}`,
          type: 'order_completed',
          category: 'order',
          title: `Order #${order.number} Delivered & Completed`,
          description: `Payment confirmed via ${order.paymentMethodTitle}`,
          timestamp: order.dateModified || order.dateCreated,
          meta: { orderId: order.id, status: order.status },
          icon: 'check-circle-2',
          badgeColor: 'emerald',
        });
      }
    });

    // Interaction events
    interactions.forEach(int => {
      timeline.push({
        id: `event-int-${int.id}`,
        type: `interaction_${int.type}`,
        category: 'note',
        title: `${int.type.toUpperCase()} Interaction Logged`,
        description: int.summary,
        timestamp: int.createdAt,
        meta: { interactionId: int.id, type: int.type },
        icon: int.type === 'call' ? 'phone-call' : (int.type === 'email' ? 'mail' : (int.type === 'meeting' ? 'video' : 'file-text')),
        badgeColor: 'indigo',
      });
    });

    // Follow-up events
    followups.forEach(f => {
      timeline.push({
        id: `event-fol-create-${f.id}`,
        type: 'followup_created',
        category: 'followup',
        title: `Follow-up Task Scheduled: "${f.title}"`,
        description: `Target due date: ${new Date(f.dueDate).toLocaleDateString()}`,
        timestamp: f.createdAt,
        meta: { followupId: f.id, dueDate: f.dueDate, status: f.status },
        icon: 'calendar-clock',
        badgeColor: 'amber',
      });

      if (f.status === 'completed' && f.completedAt) {
        timeline.push({
          id: `event-fol-comp-${f.id}`,
          type: 'followup_completed',
          category: 'followup',
          title: `Follow-up Completed: "${f.title}"`,
          description: `Resolved on ${new Date(f.completedAt).toLocaleDateString()}`,
          timestamp: f.completedAt,
          meta: { followupId: f.id },
          icon: 'check-check',
          badgeColor: 'emerald',
        });
      }
    });

    // Sort timeline descending by timestamp
    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Suggestions (Feature B)
    const suggestions = generateCustomerSuggestions(customer, orders, interactions);

    res.json({
      customer: {
        ...customer,
        tags: crmData.tags || customer.tags || [],
        owner: crmData.owner || customer.owner || 'Unassigned',
        preferredContact: crmData.preferredContact || customer.preferredContact || 'Email',
        crmNotes: crmData.notes || customer.crmNotes || '',
      },
      stats: {
        orderCount,
        totalSpend: Math.round(totalSpend),
        averageOrderValue,
        lastOrderDate: lastOrder ? lastOrder.dateCreated : null,
      },
      orders,
      interactions,
      followups,
      timeline,
      healthScore: customer.healthScore,
      segment: customer.segment,
      suggestions,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/customers/:id (update CRM fields)
const patchCustomerSchema = z.object({
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  owner: z.string().optional(),
  preferredContact: z.string().optional(),
  notes: z.string().optional(),
});

router.patch('/customers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = patchCustomerSchema.parse(req.body);

    const updated = await crmRepo.updateCustomerCrm(id, validated);
    res.json({
      success: true,
      customerId: id,
      crm: updated,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    next(err);
  }
});

// GET /api/customers/:id/orders
router.get('/customers/:id/orders', async (req, res, next) => {
  try {
    const { id } = req.params;
    const adapter = getAdapter();
    const orders = await adapter.getOrdersByCustomer(id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id/interactions
router.get('/customers/:id/interactions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const interactions = await crmRepo.getInteractions(id);
    res.json(interactions);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:id/interactions
const createInteractionSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']),
  summary: z.string().min(1, 'Summary is required'),
  createdAt: z.string().optional(),
});

router.post('/customers/:id/interactions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = createInteractionSchema.parse(req.body);

    const created = await crmRepo.addInteraction({
      customerId: id,
      type: validated.type,
      summary: validated.summary,
      createdAt: validated.createdAt,
    });

    res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    next(err);
  }
});

// POST /api/customers/:id/message (message template generator)
router.post('/customers/:id/message', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body;
    const adapter = getAdapter();
    const customer = await adapter.getCustomer(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    let targetOrder = null;
    if (orderId) {
      const orders = await adapter.getOrdersByCustomer(id);
      targetOrder = orders.find(o => String(o.id) === String(orderId)) || null;
    } else {
      const orders = await adapter.getOrdersByCustomer(id);
      targetOrder = orders[0] || null;
    }

    const templates = generatePersonalizedMessages(customer, targetOrder);
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
