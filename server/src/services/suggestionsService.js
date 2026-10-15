function generateCustomerSuggestions(customer, orders = [], interactions = []) {
  const suggestions = [];
  const now = new Date();

  // Find latest order and any problematic order
  const sortedOrders = [...orders].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  const latestOrder = sortedOrders[0] || null;
  const recentProblemOrder = sortedOrders.find(o => o.status === 'cancelled' || o.status === 'refunded');
  const highValueThreshold = 10000;

  // 1. Cancelled or refunded order -> apology / resolution call
  if (recentProblemOrder) {
    const daysSinceIssue = Math.floor((now.getTime() - new Date(recentProblemOrder.dateCreated).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceIssue <= 30) {
      suggestions.push({
        id: 'sugg-issue-resolution',
        type: 'call',
        priority: 'high',
        title: `Service Recovery Call for Order #${recentProblemOrder.number || recentProblemOrder.id}`,
        reason: `Customer experienced an issue with their recent ${recentProblemOrder.status} order totaling ₹${Number(recentProblemOrder.total).toLocaleString('en-IN')}.`,
        defaultDueDateDays: 1,
        suggestedAction: 'Call customer to understand reason and offer resolution or coupon discount.',
        referenceOrderId: recentProblemOrder.id,
      });
    }
  }

  // 2. High spender -> VIP thank you & relationship check-in
  if (customer.totalSpent >= highValueThreshold || customer.segment === 'VIP') {
    suggestions.push({
      id: 'sugg-vip-appreciation',
      type: 'email',
      priority: 'medium',
      title: 'Send Executive VIP Appreciation & Custom Catalog',
      reason: `Customer has accumulated ₹${customer.totalSpent.toLocaleString('en-IN')} in total spend across ${customer.ordersCount} orders.`,
      defaultDueDateDays: 3,
      suggestedAction: 'Send personalized VIP gift voucher or preview of new private collections.',
      referenceOrderId: latestOrder ? latestOrder.id : null,
    });
  }

  // 3. No order in 60+ days -> win-back call or special offer
  if (customer.daysSinceLastOrder !== null && customer.daysSinceLastOrder >= 60) {
    suggestions.push({
      id: 'sugg-winback-outreach',
      type: 'call',
      priority: 'high',
      title: 'Dormant Customer Win-Back Outreach',
      reason: `No purchase activity recorded in ${customer.daysSinceLastOrder} days. Customer is at risk of churning.`,
      defaultDueDateDays: 2,
      suggestedAction: 'Reach out with an exclusive "We miss you" 15% discount code.',
      referenceOrderId: latestOrder ? latestOrder.id : null,
    });
  }

  // 4. Completed order with no feedback / review follow-up
  if (latestOrder && latestOrder.status === 'completed') {
    const daysSinceDelivery = Math.floor((now.getTime() - new Date(latestOrder.dateCreated).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery >= 3 && daysSinceDelivery <= 30) {
      const hasRecentFeedback = interactions.some(i => i.summary.toLowerCase().includes('feedback') || i.summary.toLowerCase().includes('review'));
      if (!hasRecentFeedback) {
        suggestions.push({
          id: 'sugg-feedback-review',
          type: 'email',
          priority: 'low',
          title: `Delivery Experience & Review Follow-up for #${latestOrder.number || latestOrder.id}`,
          reason: `Order #${latestOrder.number || latestOrder.id} was delivered ${daysSinceDelivery} days ago without recorded feedback.`,
          defaultDueDateDays: 2,
          suggestedAction: 'Request product rating and gather unboxing experience feedback.',
          referenceOrderId: latestOrder.id,
        });
      }
    }
  }

  // Fallback default suggestion if list is empty
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'sugg-quarterly-touchpoint',
      type: 'call',
      priority: 'medium',
      title: 'Quarterly Relationship Health Check-in',
      reason: 'Regular proactive engagement keeps retention and brand recall high.',
      defaultDueDateDays: 7,
      suggestedAction: 'Check in on product satisfaction and upcoming replenishment requirements.',
      referenceOrderId: latestOrder ? latestOrder.id : null,
    });
  }

  return suggestions;
}

function generatePersonalizedMessages(customer, order = null) {
  const customerName = customer.fullName || `${customer.firstName} ${customer.lastName}`.trim() || 'Valued Customer';
  const orderId = order ? (order.number || `#${order.id}`) : 'recent purchase';
  const orderAmount = order ? `₹${Number(order.total).toLocaleString('en-IN')}` : 'your order';
  const storeName = 'Kilowatt Stores';

  // Email Template
  const emailSubject = `Special note regarding your order ${orderId} at ${storeName}`;
  const emailBody = `Dear ${customerName},

Thank you for being a valued patron of ${storeName}. We are reaching out regarding your order ${orderId} (${orderAmount}).

We want to make sure your shopping experience met every expectation. If there is anything we can do to assist you, or if you have any feedback on your items, please reply directly to this email.

As a gesture of our gratitude, we would love to offer you a 10% privilege discount on your next visit using code: VIPKILOWATT10.

Warm regards,
Customer Success Team
${storeName}`;

  // WhatsApp Template
  const whatsappBody = `Namaste ${customerName}! 🙏

Thank you for choosing ${storeName}. We hope you are loving your items from order ${orderId} (${orderAmount}).

If you have any questions or need quick assistance with anything, our priority support team is right here for you.

Feel free to reply here on WhatsApp anytime! ✨
Warm regards,
Team ${storeName}`;

  return {
    customerName,
    orderId,
    orderAmount,
    email: {
      subject: emailSubject,
      body: emailBody,
    },
    whatsapp: {
      body: whatsappBody,
    }
  };
}

module.exports = {
  generateCustomerSuggestions,
  generatePersonalizedMessages,
};
