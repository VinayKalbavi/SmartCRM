const fs = require('fs');
const path = require('path');
const config = require('../config');
const crmRepo = require('../db/crmRepository');
const { calculateCustomerHealthScore } = require('../services/analyticsService');

class MockAdapter {
  constructor() {
    this.filePath = config.mockWooJsonPath;
  }

  loadRawData() {
    if (!fs.existsSync(this.filePath)) {
      // If file doesn't exist yet, run generator
      const generateMockData = require('../../scripts/seed-mock');
      generateMockData();
    }
    const raw = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(raw);
  }

  normalizeOrder(rawOrder) {
    return {
      id: rawOrder.id,
      number: rawOrder.number || `CMD-${rawOrder.id}`,
      status: (rawOrder.status || 'pending').toLowerCase(),
      dateCreated: rawOrder.date_created,
      dateModified: rawOrder.date_modified || rawOrder.date_created,
      total: parseFloat(rawOrder.total || 0),
      currency: rawOrder.currency || 'INR',
      currencySymbol: rawOrder.currency_symbol || '₹',
      customerId: String(rawOrder.customer_id),
      isGuest: Number(rawOrder.customer_id) === 0,
      customerNote: rawOrder.customer_note || '',
      customerName: `${rawOrder.billing?.first_name || ''} ${rawOrder.billing?.last_name || ''}`.trim() || 'Guest Customer',
      customerEmail: rawOrder.billing?.email || '',
      customerPhone: rawOrder.billing?.phone || '',
      paymentMethod: rawOrder.payment_method || 'card',
      paymentMethodTitle: rawOrder.payment_method_title || 'Payment Gateway',
      shippingAddress: {
        city: rawOrder.shipping?.city || rawOrder.billing?.city || '',
        state: rawOrder.shipping?.state || rawOrder.billing?.state || '',
        address: rawOrder.shipping?.address_1 || rawOrder.billing?.address_1 || '',
      },
      lineItems: (rawOrder.line_items || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price || item.total / item.quantity || 0),
        total: parseFloat(item.total || 0),
      })),
    };
  }

  async getOrders() {
    const data = this.loadRawData();
    return (data.orders || []).map(o => this.normalizeOrder(o));
  }

  async getOrdersByCustomer(customerId) {
    const allOrders = await this.getOrders();
    const customer = await this.getCustomer(customerId);
    const targetEmail = customer?.email?.toLowerCase().trim();

    return allOrders.filter(order => {
      // Direct customer id match
      if (String(order.customerId) === String(customerId)) {
        return true;
      }
      // Guest order linked by verified billing email
      if (order.isGuest && targetEmail && order.customerEmail.toLowerCase().trim() === targetEmail) {
        return true;
      }
      return false;
    });
  }

  async getCustomers() {
    const data = this.loadRawData();
    const rawCustomers = data.customers || [];
    const allOrders = await this.getOrders();
    const crmDataMap = await crmRepo.getAllCustomerCrm();
    const allInteractions = await crmRepo.getInteractions();

    return rawCustomers.map(raw => {
      const idStr = String(raw.id);
      const email = (raw.email || raw.billing?.email || '').toLowerCase().trim();

      // Find all orders for this customer (direct + linked guest orders by email)
      const customerOrders = allOrders.filter(o => 
        String(o.customerId) === idStr || 
        (o.isGuest && email && o.customerEmail.toLowerCase().trim() === email)
      );

      const customerInteractions = allInteractions.filter(i => String(i.customerId) === idStr);
      const crmFields = crmDataMap[idStr] || { tags: [], owner: '', preferredContact: '', notes: '' };
      
      const healthAnalysis = calculateCustomerHealthScore(customerOrders, customerInteractions, raw.date_created);

      return {
        id: idStr,
        firstName: raw.first_name || '',
        lastName: raw.last_name || '',
        fullName: `${raw.first_name || ''} ${raw.last_name || ''}`.trim() || raw.username || 'Customer',
        email: email,
        phone: raw.billing?.phone || '',
        city: raw.billing?.city || '',
        state: raw.billing?.state || '',
        country: raw.billing?.country || 'IN',
        address: `${raw.billing?.address_1 || ''} ${raw.billing?.city || ''}`.trim(),
        dateCreated: raw.date_created,
        avatarUrl: raw.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(raw.first_name || 'User')}`,
        ordersCount: healthAnalysis.metrics.ordersCount,
        totalSpent: healthAnalysis.metrics.totalSpent,
        lastOrderDate: healthAnalysis.metrics.lastOrderDate,
        daysSinceLastOrder: healthAnalysis.metrics.daysSinceLastOrder,
        healthScore: healthAnalysis.healthScore,
        segment: healthAnalysis.segment,
        tags: crmFields.tags || [],
        owner: crmFields.owner || 'Unassigned',
        preferredContact: crmFields.preferredContact || 'Email',
        crmNotes: crmFields.notes || '',
      };
    });
  }

  async getCustomer(id) {
    const customers = await this.getCustomers();
    return customers.find(c => String(c.id) === String(id)) || null;
  }

  async sync() {
    // In mock mode, re-read disk
    this.loadRawData();
    return { success: true, timestamp: new Date().toISOString() };
  }

  async getStatus() {
    const data = this.loadRawData();
    return {
      connected: true,
      isMock: true,
      storeUrl: data.store_url || 'https://demo-woo.kilowatt-stores.in',
      customerCount: (data.customers || []).length,
      orderCount: (data.orders || []).length,
      error: null,
    };
  }
}

module.exports = new MockAdapter();
