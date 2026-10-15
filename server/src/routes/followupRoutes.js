const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { getAdapter } = require('../adapters');
const crmRepo = require('../db/crmRepository');

// GET /api/followups
router.get('/followups', async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const adapter = getAdapter();

    const [followups, customers] = await Promise.all([
      crmRepo.getFollowups({ status, customerId }),
      adapter.getCustomers(),
    ]);

    const custMap = new Map(customers.map(c => [String(c.id), c]));
    const now = new Date();

    const enriched = followups.map(f => {
      const cust = custMap.get(String(f.customerId));
      return {
        ...f,
        customerName: cust?.fullName || 'Customer #' + f.customerId,
        customerEmail: cust?.email || '',
        customerPhone: cust?.phone || '',
        customerAvatar: cust?.avatarUrl || '',
        customerSegment: cust?.segment || 'Active',
        isOverdue: f.status === 'pending' && new Date(f.dueDate) < now,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// POST /api/followups
const createFollowupSchema = z.object({
  customerId: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1, 'Title is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
});

router.post('/followups', async (req, res, next) => {
  try {
    const validated = createFollowupSchema.parse(req.body);
    const created = await crmRepo.addFollowup({
      customerId: validated.customerId,
      title: validated.title,
      dueDate: validated.dueDate,
      status: validated.status,
    });
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    next(err);
  }
});

// PATCH /api/followups/:id
const patchFollowupSchema = z.object({
  status: z.enum(['pending', 'completed']).optional(),
  title: z.string().optional(),
  dueDate: z.string().optional(),
});

router.patch('/followups/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = patchFollowupSchema.parse(req.body);

    const updated = await crmRepo.updateFollowup(id, validated);
    if (!updated) {
      return res.status(404).json({ error: 'Follow-up not found' });
    }

    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    next(err);
  }
});

module.exports = router;
