const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class JsonCrmRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      customersCrm: {}, // customerId -> { tags: [], owner: '', preferredContact: '' }
      interactions: [], // [{ id, customerId, type, summary, createdAt }]
      followups: [],   // [{ id, customerId, title, dueDate, status, createdAt, completedAt }]
    };
    this.init();
  }

  init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.data = {
            customersCrm: parsed.customersCrm || {},
            interactions: parsed.interactions || [],
            followups: parsed.followups || [],
          };
        }
      } catch (err) {
        console.error('Error reading db.json, re-initializing:', err.message);
        this.seedDefaultCrmData();
      }
    } else {
      this.seedDefaultCrmData();
    }

    // If completely empty, seed sample CRM data
    if (Object.keys(this.data.customersCrm).length === 0 && this.data.interactions.length === 0) {
      this.seedDefaultCrmData();
    }
  }

  save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      // Fallback direct write
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    }
  }

  seedDefaultCrmData() {
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
    const daysAhead = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

    this.data = {
      customersCrm: {
        "1": {
          tags: ["VIP", "High Value", "Early Adopter"],
          owner: "Priya Patel",
          preferredContact: "WhatsApp",
          notes: "Key account - primary contact for enterprise gifting orders."
        },
        "2": {
          tags: ["Loyal", "Repeat Buyer"],
          owner: "Rahul Verma",
          preferredContact: "Phone",
          notes: "Prefers evening calls after 6 PM."
        },
        "3": {
          tags: ["New", "Inquiry"],
          owner: "Priya Patel",
          preferredContact: "Email",
          notes: "Interested in upcoming summer catalogue."
        },
        "4": {
          tags: ["At-Risk", "Needs Win-Back"],
          owner: "Ananya Iyer",
          preferredContact: "Email",
          notes: "Has not ordered in 75 days. Send discount coupon."
        }
      },
      interactions: [
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
        },
        {
          id: "int-105",
          customerId: "2",
          type: "call",
          summary: "Followed up on recent shipment delivery. Everything arrived in good condition.",
          createdAt: daysAgo(7)
        },
        {
          id: "int-106",
          customerId: "3",
          type: "email",
          summary: "Welcome email sent with 10% coupon code for first order.",
          createdAt: daysAgo(3)
        }
      ],
      followups: [
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
          status: "pending", // Overdue!
          createdAt: daysAgo(6),
          completedAt: null
        },
        {
          id: "fol-205",
          customerId: "2",
          title: "Send replenishment reminder for quarterly supplies",
          dueDate: daysAhead(5),
          status: "pending",
          createdAt: daysAgo(1),
          completedAt: null
        },
        {
          id: "fol-206",
          customerId: "4",
          title: "Execute win-back campaign call with 20% discount offer",
          dueDate: daysAgo(1),
          status: "pending", // Overdue!
          createdAt: daysAgo(5),
          completedAt: null
        }
      ]
    };
    this.save();
  }

  // Customer CRM data methods
  async getCustomerCrm(customerId) {
    const id = String(customerId);
    return this.data.customersCrm[id] || { tags: [], owner: '', preferredContact: '', notes: '' };
  }

  async getAllCustomerCrm() {
    return this.data.customersCrm || {};
  }

  async updateCustomerCrm(customerId, updates) {
    const id = String(customerId);
    const existing = this.data.customersCrm[id] || { tags: [], owner: '', preferredContact: '', notes: '' };
    
    this.data.customersCrm[id] = {
      ...existing,
      ...(updates.tags !== undefined ? { tags: Array.isArray(updates.tags) ? updates.tags : updates.tags.split(',').map(t => t.trim()).filter(Boolean) } : {}),
      ...(updates.owner !== undefined ? { owner: updates.owner } : {}),
      ...(updates.preferredContact !== undefined ? { preferredContact: updates.preferredContact } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
    };

    this.save();
    return this.data.customersCrm[id];
  }

  // Interactions methods
  async getInteractions(customerId = null) {
    if (customerId) {
      const id = String(customerId);
      return this.data.interactions
        .filter(item => String(item.customerId) === id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [...this.data.interactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async addInteraction({ customerId, type, summary, createdAt }) {
    const item = {
      id: `int-${uuidv4().slice(0, 8)}`,
      customerId: String(customerId),
      type: type || 'note',
      summary: summary || '',
      createdAt: createdAt || new Date().toISOString(),
    };
    this.data.interactions.unshift(item);
    this.save();
    return item;
  }

  // Followups methods
  async getFollowups(filter = {}) {
    let list = [...this.data.followups];
    const now = new Date();

    if (filter.customerId) {
      list = list.filter(f => String(f.customerId) === String(filter.customerId));
    }

    if (filter.status) {
      const statusLower = filter.status.toLowerCase();
      if (statusLower === 'overdue') {
        list = list.filter(f => f.status === 'pending' && new Date(f.dueDate) < now);
      } else if (statusLower === 'pending') {
        list = list.filter(f => f.status === 'pending');
      } else if (statusLower === 'completed') {
        list = list.filter(f => f.status === 'completed');
      }
    }

    // Sort: overdue & pending first by due date, then completed by completedAt
    return list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  async addFollowup({ customerId, title, dueDate, status }) {
    const item = {
      id: `fol-${uuidv4().slice(0, 8)}`,
      customerId: String(customerId),
      title: title || '',
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : null,
    };
    this.data.followups.unshift(item);
    this.save();
    return item;
  }

  async updateFollowup(id, updates) {
    const index = this.data.followups.findIndex(f => String(f.id) === String(id));
    if (index === -1) return null;

    const existing = this.data.followups[index];
    const newStatus = updates.status !== undefined ? updates.status : existing.status;
    let completedAt = existing.completedAt;

    if (updates.status === 'completed' && existing.status !== 'completed') {
      completedAt = new Date().toISOString();
    } else if (updates.status === 'pending') {
      completedAt = null;
    }

    this.data.followups[index] = {
      ...existing,
      ...updates,
      status: newStatus,
      completedAt,
    };

    this.save();
    return this.data.followups[index];
  }
}

// Single instance for JSON store
const jsonRepository = new JsonCrmRepository(config.dbJsonPath);

let mongoRepository = null;
let isConnectedToMongo = false;

if (config.mongodbUri) {
  try {
    const mongoose = require('mongoose');
    mongoRepository = require('./mongoRepository');
    mongoose.connect(config.mongodbUri)
      .then(() => {
        isConnectedToMongo = true;
        console.log('[Database] Connected to MongoDB Atlas successfully.');
        mongoRepository.init();
      })
      .catch(err => {
        console.error('[Database] MongoDB connection failed, using JSON file store:', err.message);
      });
  } catch (err) {
    console.error('[Database] Failed to initialize MongoDB connection:', err.message);
  }
}

const unifiedRepository = {
  init() {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.init();
    }
    return jsonRepository.init();
  },
  async getCustomerCrm(customerId) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.getCustomerCrm(customerId);
    }
    return jsonRepository.getCustomerCrm(customerId);
  },
  async getAllCustomerCrm() {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.getAllCustomerCrm();
    }
    return jsonRepository.getAllCustomerCrm();
  },
  async updateCustomerCrm(customerId, updates) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.updateCustomerCrm(customerId, updates);
    }
    return jsonRepository.updateCustomerCrm(customerId, updates);
  },
  async getInteractions(customerId = null) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.getInteractions(customerId);
    }
    return jsonRepository.getInteractions(customerId);
  },
  async addInteraction(data) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.addInteraction(data);
    }
    return jsonRepository.addInteraction(data);
  },
  async getFollowups(filter = {}) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.getFollowups(filter);
    }
    return jsonRepository.getFollowups(filter);
  },
  async addFollowup(data) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.addFollowup(data);
    }
    return jsonRepository.addFollowup(data);
  },
  async updateFollowup(id, updates) {
    if (isConnectedToMongo && mongoRepository) {
      return mongoRepository.updateFollowup(id, updates);
    }
    return jsonRepository.updateFollowup(id, updates);
  },
  seedDefaultCrmData() {
    return jsonRepository.seedDefaultCrmData();
  }
};

module.exports = unifiedRepository;
