const axios = require('axios');
const config = require('../config');
const crmRepo = require('../db/crmRepository');
const { calculateCustomerHealthScore } = require('../services/analyticsService');

class WooAdapter {
  constructor() {
    this.cache = {
      customers: null,
      orders: null,
      lastFetched: 0,
    };
    this.cacheTtlMs = 60 * 1000; // 60 seconds
  }

  getClient() {
    const { url, consumerKey, consumerSecret } = config.wooCommerce;
    if (!url || !consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials are missing in server/.env');
    }

    const cleanUrl = url.replace(/\/+$/, '');
    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    return axios.create({
      baseURL: `${cleanUrl}/wp-json/wc/v3`,
      headers: {
        Authorization: authHeader,
        'User-Agent': 'SmartCRM-WooHub/1.0',
      },
      timeout: 15000,
    });
  }

  async fetchAllPages(endpoint) {
    const client = this.getClient();
    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await client.get(`/${endpoint}`, {
          params: {
            per_page: 100,
            page: page,
          },
        });

        const items = response.data;
        if (Array.isArray(items) && items.length > 0) {
          allData = allData.concat(items);
          const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
          if (page >= totalPages || items.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (err) {
        if (page === 1) throw err;
        hasMore = false;
      }
    }

    return allData;
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

  async ensureCache(force = false) {
    const now = Date.now();
    if (!force && this.cache.customers && this.cache.orders && (now - this.cache.lastFetched < this.cacheTtlMs)) {
      return;
    }

    const [rawCustomers, rawOrders] = await Promise.all([
      this.fetchAllPages('customers'),
      this.fetchAllPages('orders'),
    ]);

    this.cache.customers = rawCustomers;
    this.cache.orders = rawOrders;
    this.cache.lastFetched = now;
  }

  async sync() {
    await this.ensureCache(true);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      customerCount: this.cache.customers.length,
      orderCount: this.cache.orders.length,
    };
  }

  async getOrders() {
    await this.ensureCache();
    return (this.cache.orders || []).map(o => this.normalizeOrder(o));
  }

  async getOrdersByCustomer(customerId) {
    const allOrders = await this.getOrders();
    const customer = await this.getCustomer(customerId);
    const targetEmail = customer?.email?.toLowerCase().trim();

    return allOrders.filter(order => {
      if (String(order.customerId) === String(customerId)) {
        return true;
      }
      if (order.isGuest && targetEmail && order.customerEmail.toLowerCase().trim() === targetEmail) {
        return true;
      }
      return false;
    });
  }

  async getCustomers() {
    await this.ensureCache();
    const rawCustomers = this.cache.customers || [];
    const allOrders = await this.getOrders();
    const crmDataMap = await crmRepo.getAllCustomerCrm();
    const allInteractions = await crmRepo.getInteractions();

    return rawCustomers.map(raw => {
      const idStr = String(raw.id);
      const email = (raw.email || raw.billing?.email || '').toLowerCase().trim();

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

  async getStatus() {
    try {
      const client = this.getClient();
      // Test ping with per_page=1
      const [custRes, ordRes] = await Promise.all([
        client.get('/customers', { params: { per_page: 1 } }),
        client.get('/orders', { params: { per_page: 1 } }),
      ]);

      const totalCustomers = parseInt(custRes.headers['x-wp-total'] || '0', 10);
      const totalOrders = parseInt(ordRes.headers['x-wp-total'] || '0', 10);

      return {
        connected: true,
        isMock: false,
        storeUrl: config.wooCommerce.url,
        customerCount: totalCustomers,
        orderCount: totalOrders,
        error: null,
      };
    } catch (err) {
      let errorMsg = err.message;
      if (err.response) {
        errorMsg = `WooCommerce API Error (${err.response.status}): ${err.response.data?.message || err.response.statusText}`;
      }
      return {
        connected: false,
        isMock: false,
        storeUrl: config.wooCommerce.url,
        customerCount: 0,
        orderCount: 0,
        error: errorMsg,
      };
    }
  }
}

module.exports = new WooAdapter();
