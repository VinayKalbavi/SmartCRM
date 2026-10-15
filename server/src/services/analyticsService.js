function calculateCustomerHealthScore(orders = [], interactions = [], registrationDate = null) {
  const now = new Date();
  
  // Only non-cancelled orders count towards monetary/frequency metrics
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const ordersCount = validOrders.length;
  const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Recency
  let recencyScore = 0;
  let daysSinceLastOrder = 999;
  let lastOrderDate = null;

  if (validOrders.length > 0) {
    const dates = validOrders.map(o => new Date(o.dateCreated).getTime());
    const latestTime = Math.max(...dates);
    lastOrderDate = new Date(latestTime).toISOString();
    daysSinceLastOrder = Math.max(0, Math.floor((now.getTime() - latestTime) / (1000 * 60 * 60 * 24)));

    if (daysSinceLastOrder <= 14) recencyScore = 35;
    else if (daysSinceLastOrder <= 30) recencyScore = 30;
    else if (daysSinceLastOrder <= 60) recencyScore = 20;
    else if (daysSinceLastOrder <= 90) recencyScore = 10;
    else if (daysSinceLastOrder <= 120) recencyScore = 5;
    else recencyScore = 0;
  }

  // Frequency
  let freqScore = 0;
  if (ordersCount >= 5) freqScore = 30;
  else if (ordersCount >= 3) freqScore = 22;
  else if (ordersCount === 2) freqScore = 15;
  else if (ordersCount === 1) freqScore = 8;
  else freqScore = 0;

  // Monetary
  let monetaryScore = 0;
  if (totalSpent >= 25000) monetaryScore = 25;
  else if (totalSpent >= 15000) monetaryScore = 20;
  else if (totalSpent >= 8000) monetaryScore = 15;
  else if (totalSpent >= 3000) monetaryScore = 10;
  else if (totalSpent > 0) monetaryScore = 5;

  // Interactions activity bonus
  let interactionScore = 0;
  if (interactions && interactions.length > 0) {
    const interactionDates = interactions.map(i => new Date(i.createdAt).getTime());
    const latestInt = Math.max(...interactionDates);
    const daysSinceInt = Math.floor((now.getTime() - latestInt) / (1000 * 60 * 60 * 24));
    if (daysSinceInt <= 30) interactionScore = 10;
    else if (daysSinceInt <= 60) interactionScore = 5;
  }

  const rawScore = recencyScore + freqScore + monetaryScore + interactionScore;
  const healthScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Segment classification
  let segment = 'Active';
  const regDaysAgo = registrationDate ? Math.floor((now.getTime() - new Date(registrationDate).getTime()) / (1000 * 60 * 60 * 24)) : 100;

  if (healthScore >= 80 || (totalSpent >= 20000 && ordersCount >= 4)) {
    segment = 'VIP';
  } else if (healthScore >= 65 || ordersCount >= 3) {
    segment = 'Loyal';
  } else if (regDaysAgo <= 45 && ordersCount <= 2 && daysSinceLastOrder <= 45) {
    segment = 'New';
  } else if (daysSinceLastOrder > 120 || (healthScore < 25 && ordersCount > 0)) {
    segment = 'Churned';
  } else if (daysSinceLastOrder >= 60 || (healthScore < 45 && ordersCount > 0)) {
    segment = 'At-Risk';
  } else {
    segment = 'Active';
  }

  return {
    healthScore,
    segment,
    metrics: {
      recencyScore,
      freqScore,
      monetaryScore,
      interactionScore,
      daysSinceLastOrder: daysSinceLastOrder === 999 ? null : daysSinceLastOrder,
      lastOrderDate,
      totalSpent,
      ordersCount,
    }
  };
}

module.exports = {
  calculateCustomerHealthScore,
};
