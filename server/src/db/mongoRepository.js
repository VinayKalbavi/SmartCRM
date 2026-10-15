const { v4: uuidv4 } = require('uuid');
const { CustomerCrm, Interaction, Followup } = require('./models');

class MongoCrmRepository {
  async init() {
    try {
      const count = await CustomerCrm.countDocuments();
      if (count === 0) {
        await this.seedDefaultCrmData();
      }
    } catch (err) {
      console.error('[MongoDB Init Warning]:', err.message);
    }
  }

  async seedDefaultCrmData() {
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
    const daysAhead = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

    const initialCustomers = [
      {
        customerId: "1",
        tags: ["VIP", "High Value", "Early Adopter"],
        owner: "Priya Patel",
        preferredContact: "WhatsApp",
        notes: "Key account - primary contact for enterprise gifting orders."
      },
      {
        customerId: "2",
        tags: ["Loyal", "Repeat Buyer"],
        owner: "Rahul Verma",
        preferredContact: "Phone",
        notes: "Prefers evening calls after 6 PM."
      },
      {
        customerId: "3",
        tags: ["New", "Inquiry"],
        owner: "Priya Patel",
        preferredContact: "Email",
        notes: "Interested in upcoming summer catalogue."
      },
      {
        customerId: "4",
        tags: ["At-Risk", "Needs Win-Back"],
        owner: "Ananya Iyer",
        preferredContact: "Email",
        notes: "Has not ordered in 75 days. Send discount coupon."
      }
    ];

    const initialInteractions = [
      {
        id: "int-101",
        customerId: "1",
        type: "call",
        summary: "Discussed bulk festive order requirements for Diwali corporate gifts.",
        createdAt: daysAgo(14)
      },
      {
        id: "int-102",
        customerId: "1",
        type: "email",
        summary: "Sent custom pricing catalog and wholesale volume discount slabs.",
        createdAt: daysAgo(10)
      },
      {
        id: "int-103",
        customerId: "1",
        type: "meeting",
        summary: "Quarterly account review via Zoom. Customer expressed strong satisfaction with delivery speed.",
        createdAt: daysAgo(5)
      },
      {
        id: "int-104",
        customerId: "1",
        type: "note",
        summary: "Requested tax invoice with registered GST number for previous bulk order.",
        createdAt: daysAgo(1)
      }
    ];

    const initialFollowups = [
      {
        id: "fol-201",
        customerId: "1",
        title: "Send updated winter product catalog & lookbook",
        dueDate: daysAgo(8),
        status: "completed",
        createdAt: daysAgo(12),
        completedAt: daysAgo(8)
      },
      {
        id: "fol-202",
        customerId: "1",
        title: "Confirm GST invoice generation and dispatch",
        dueDate: daysAgo(4),
        status: "completed",
        createdAt: daysAgo(7),
        completedAt: daysAgo(4)
      },
      {
        id: "fol-203",
        customerId: "1",
        title: "Follow up on festive corporate gift sample approval",
        dueDate: daysAhead(3),
        status: "pending",
        createdAt: daysAgo(2),
        completedAt: null
      },
      {
        id: "fol-204",
        customerId: "1",
        title: "Check on courier tracking for custom engraved samples",
        dueDate: daysAgo(2),
        status: "pending",
        createdAt: daysAgo(6),
        completedAt: null
      }
    ];

    await Promise.all([
      CustomerCrm.insertMany(initialCustomers),
      Interaction.insertMany(initialInteractions),
      Followup.insertMany(initialFollowups),
    ]);

    console.log('[MongoDB Seeder] Successfully seeded default CRM data into MongoDB Atlas.');
  }

  async getCustomerCrm(customerId) {
    const doc = await CustomerCrm.findOne({ customerId: String(customerId) }).lean();
    return doc || { tags: [], owner: '', preferredContact: '', notes: '' };
  }

  async getAllCustomerCrm() {
    const list = await CustomerCrm.find({}).lean();
    const map = {};
    list.forEach(item => {
      map[item.customerId] = item;
    });
    return map;
  }

  async updateCustomerCrm(customerId, updates) {
    const id = String(customerId);
    const existing = await CustomerCrm.findOne({ customerId: id });
    
    const fields = {
      ...(updates.tags !== undefined ? { tags: Array.isArray(updates.tags) ? updates.tags : updates.tags.split(',').map(t => t.trim()).filter(Boolean) } : {}),
      ...(updates.owner !== undefined ? { owner: updates.owner } : {}),
      ...(updates.preferredContact !== undefined ? { preferredContact: updates.preferredContact } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
    };

    if (existing) {
      Object.assign(existing, fields);
      await existing.save();
      return existing.toObject();
    } else {
      const created = await CustomerCrm.create({
        customerId: id,
        ...fields,
      });
      return created.toObject();
    }
  }

  async getInteractions(customerId = null) {
    const query = customerId ? { customerId: String(customerId) } : {};
    return Interaction.find(query).sort({ createdAt: -1 }).lean();
  }

  async addInteraction({ customerId, type, summary, createdAt }) {
    const created = await Interaction.create({
      id: `int-${uuidv4().slice(0, 8)}`,
      customerId: String(customerId),
      type: type || 'note',
      summary: summary || '',
      createdAt: createdAt || new Date().toISOString(),
    });
    return created.toObject();
  }

  async getFollowups(filter = {}) {
    const query = {};
    const now = new Date();

    if (filter.customerId) {
      query.customerId = String(filter.customerId);
    }

    if (filter.status) {
      const s = filter.status.toLowerCase();
      if (s === 'overdue') {
        query.status = 'pending';
        query.dueDate = { $lt: now.toISOString() };
      } else if (s === 'pending') {
        query.status = 'pending';
      } else if (s === 'completed') {
        query.status = 'completed';
      }
    }

    return Followup.find(query).sort({ dueDate: 1 }).lean();
  }

  async addFollowup({ customerId, title, dueDate, status }) {
    const created = await Followup.create({
      id: `fol-${uuidv4().slice(0, 8)}`,
      customerId: String(customerId),
      title: title || '',
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : null,
    });
    return created.toObject();
  }

  async updateFollowup(id, updates) {
    const existing = await Followup.findOne({ id: String(id) });
    if (!existing) return null;

    if (updates.status !== undefined) {
      if (updates.status === 'completed' && existing.status !== 'completed') {
        existing.completedAt = new Date().toISOString();
      } else if (updates.status === 'pending') {
        existing.completedAt = null;
      }
      existing.status = updates.status;
    }

    if (updates.title) existing.title = updates.title;
    if (updates.dueDate) existing.dueDate = updates.dueDate;

    await existing.save();
    return existing.toObject();
  }
}

module.exports = new MongoCrmRepository();
