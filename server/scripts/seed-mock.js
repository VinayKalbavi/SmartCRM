const fs = require('fs');
const path = require('path');
const crmRepo = require('../src/db/crmRepository');

const MOCK_FILE = path.join(__dirname, '../data/mock-woo.json');

const indianNames = [
  { first: 'Aarav', last: 'Sharma', city: 'Mumbai', state: 'Maharashtra', phone: '+91 98765 43210' },
  { first: 'Diya', last: 'Patel', city: 'Ahmedabad', state: 'Gujarat', phone: '+91 98234 56789' },
  { first: 'Rohan', last: 'Mehta', city: 'Bengaluru', state: 'Karnataka', phone: '+91 97123 45678' },
  { first: 'Pooja', last: 'Nair', city: 'Kochi', state: 'Kerala', phone: '+91 96345 67890' },
  { first: 'Vikram', last: 'Singh', city: 'Jaipur', state: 'Rajasthan', phone: '+91 95456 78901' },
  { first: 'Ananya', last: 'Iyer', city: 'Chennai', state: 'Tamil Nadu', phone: '+91 94567 89012' },
  { first: 'Kabir', last: 'Verma', city: 'Delhi', state: 'Delhi', phone: '+91 93678 90123' },
  { first: 'Neha', last: 'Gupta', city: 'Lucknow', state: 'Uttar Pradesh', phone: '+91 92789 01234' },
  { first: 'Aditya', last: 'Kulkarni', city: 'Pune', state: 'Maharashtra', phone: '+91 91890 12345' },
  { first: 'Meera', last: 'Sen', city: 'Kolkata', state: 'West Bengal', phone: '+91 90901 23456' },
  { first: 'Siddharth', last: 'Rao', city: 'Hyderabad', state: 'Telangana', phone: '+91 89012 34567' },
  { first: 'Tanvi', last: 'Bhatt', city: 'Surat', state: 'Gujarat', phone: '+91 88123 45678' },
  { first: 'Arjun', last: 'Deshmukh', city: 'Nagpur', state: 'Maharashtra', phone: '+91 87234 56789' },
  { first: 'Ishaan', last: 'Chopra', city: 'Chandigarh', state: 'Punjab', phone: '+91 86345 67890' },
  { first: 'Rhea', last: 'Kapoor', city: 'Gurugram', state: 'Haryana', phone: '+91 85456 78901' },
  { first: 'Dev', last: 'Malhotra', city: 'Noida', state: 'Uttar Pradesh', phone: '+91 84567 89012' },
  { first: 'Kavya', last: 'Reddy', city: 'Visakhapatnam', state: 'Andhra Pradesh', phone: '+91 83678 90123' },
  { first: 'Varun', last: 'Joshi', city: 'Indore', state: 'Madhya Pradesh', phone: '+91 82789 01234' },
  { first: 'Sneha', last: 'Pillai', city: 'Thiruvananthapuram', state: 'Kerala', phone: '+91 81890 12345' },
  { first: 'Karan', last: 'Saxena', city: 'Bhopal', state: 'Madhya Pradesh', phone: '+91 80901 23456' },
  { first: 'Tara', last: 'Bose', city: 'Kolkata', state: 'West Bengal', phone: '+91 79012 34567' },
  { first: 'Nikhil', last: 'Menon', city: 'Coimbatore', state: 'Tamil Nadu', phone: '+91 78123 45678' },
  { first: 'Priyanka', last: 'Chauhan', city: 'Dehradun', state: 'Uttarakhand', phone: '+91 77234 56789' },
  { first: 'Amitabh', last: 'Pandey', city: 'Varanasi', state: 'Uttar Pradesh', phone: '+91 76345 67890' },
  { first: 'Shreya', last: 'Mukherjee', city: 'Patna', state: 'Bihar', phone: '+91 75456 78901' },
];

const sampleProducts = [
  { id: 501, name: 'Artisanal Brass Incense Burner', price: 1250 },
  { id: 502, name: 'Organic Assam CTC Reserve Tea 250g', price: 650 },
  { id: 503, name: 'Handcrafted Copper Water Carafe 1.2L', price: 2450 },
  { id: 504, name: 'Ayurvedic Kumkumadi Facial Oil 30ml', price: 1850 },
  { id: 505, name: 'Kashmiri Organic Mogra Saffron 2g', price: 950 },
  { id: 506, name: 'Handwoven Khadi Cotton Throw Blanket', price: 3200 },
  { id: 507, name: 'Cold-Pressed Wild Forest Honey 500g', price: 750 },
  { id: 508, name: 'Studio Stoneware Coffee Mug Set of 2', price: 1100 },
];

function generateMockData() {
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  // Generate 25 customers
  const customers = indianNames.map((person, idx) => {
    const id = idx + 1;
    const email = `${person.first.toLowerCase()}.${person.last.toLowerCase()}@example.in`;
    const registeredDaysAgo = 180 - Math.floor(idx * 6);

    return {
      id: id,
      date_created: daysAgo(registeredDaysAgo),
      email: email,
      first_name: person.first,
      last_name: person.last,
      username: `${person.first.toLowerCase()}${id}`,
      billing: {
        first_name: person.first,
        last_name: person.last,
        company: idx % 4 === 0 ? `${person.last} Enterprises Pvt Ltd` : '',
        address_1: `${10 + idx * 4}, MG Road, Sector ${idx + 2}`,
        address_2: 'Near City Center',
        city: person.city,
        state: person.state,
        postcode: `4000${10 + idx}`,
        country: 'IN',
        email: email,
        phone: person.phone,
      },
      shipping: {
        first_name: person.first,
        last_name: person.last,
        company: idx % 4 === 0 ? `${person.last} Enterprises Pvt Ltd` : '',
        address_1: `${10 + idx * 4}, MG Road, Sector ${idx + 2}`,
        city: person.city,
        state: person.state,
        postcode: `4000${10 + idx}`,
        country: 'IN',
      },
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${person.first}%20${person.last}&backgroundColor=6366f1,4f46e5,3b82f6`,
    };
  });

  const orders = [];
  let orderNumberCounter = 5200;

  // Helper to generate line items
  function generateLineItems(count) {
    const items = [];
    const chosenIndices = [];
    while (items.length < count) {
      const idx = Math.floor(Math.random() * sampleProducts.length);
      if (!chosenIndices.includes(idx)) {
        chosenIndices.push(idx);
        const prod = sampleProducts[idx];
        const qty = Math.floor(Math.random() * 2) + 1;
        items.push({
          id: 9000 + items.length,
          name: prod.name,
          product_id: prod.id,
          quantity: qty,
          subtotal: String(prod.price * qty),
          total: String(prod.price * qty),
          price: prod.price,
        });
      }
    }
    return items;
  }

  // Showcase customer: Aarav Sharma (id: 1) has 6 orders
  const aaravOrders = [
    { days: 145, status: 'completed', itemsCount: 2, note: 'Initial trial package' },
    { days: 110, status: 'completed', itemsCount: 3, note: 'Repeat purchase for household' },
    { days: 70, status: 'completed', itemsCount: 4, note: 'Client corporate sample pack' },
    { days: 38, status: 'completed', itemsCount: 2, note: 'Festive advance reservation' },
    { days: 12, status: 'processing', itemsCount: 3, note: 'Bulk gifting pre-order' },
    { days: 3, status: 'cancelled', itemsCount: 1, note: 'Accidental double checkout' },
  ];

  aaravOrders.forEach((o, index) => {
    const items = generateLineItems(o.itemsCount);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.total), 0);
    orderNumberCounter++;
    orders.push({
      id: orderNumberCounter,
      number: `CMD-${orderNumberCounter}`,
      status: o.status,
      currency: 'INR',
      currency_symbol: '₹',
      date_created: daysAgo(o.days),
      date_modified: daysAgo(Math.max(0, o.days - 1)),
      total: totalAmount.toFixed(2),
      customer_id: 1,
      customer_note: o.note,
      billing: { ...customers[0].billing },
      shipping: { ...customers[0].shipping },
      payment_method: index % 2 === 0 ? 'razorpay' : 'upi',
      payment_method_title: index % 2 === 0 ? 'Credit / Debit Card (Razorpay)' : 'UPI (Instant Transfer)',
      line_items: items,
    });
  });

  // Next: 81 orders for customers 2 through 25, plus 3 guest orders (customer_id = 0)
  // Total orders = 6 (Aarav) + 81 + 3 (Guest) = 90 orders!
  const statuses = ['completed', 'completed', 'completed', 'processing', 'pending', 'cancelled', 'refunded'];

  for (let i = 0; i < 81; i++) {
    orderNumberCounter++;
    const custIndex = (i % (customers.length - 1)) + 1; // 1 to 24
    const cust = customers[custIndex];
    const status = statuses[i % statuses.length];
    const days = Math.floor(Math.random() * 160) + 1;
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const items = generateLineItems(itemsCount);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.total), 0);

    orders.push({
      id: orderNumberCounter,
      number: `CMD-${orderNumberCounter}`,
      status: status,
      currency: 'INR',
      currency_symbol: '₹',
      date_created: daysAgo(days),
      date_modified: daysAgo(Math.max(0, days - 1)),
      total: totalAmount.toFixed(2),
      customer_id: cust.id,
      customer_note: '',
      billing: { ...cust.billing },
      shipping: { ...cust.shipping },
      payment_method: i % 3 === 0 ? 'razorpay' : (i % 3 === 1 ? 'upi' : 'netbanking'),
      payment_method_title: i % 3 === 0 ? 'Credit Card' : (i % 3 === 1 ? 'UPI' : 'Net Banking'),
      line_items: items,
    });
  }

  // 3 guest orders linked to customers by verified billing email
  const guestLinkTargets = [
    { targetCust: customers[0], note: 'Guest checkout by Aarav' },
    { targetCust: customers[1], note: 'Quick checkout without login' },
    { targetCust: customers[2], note: 'Mobile guest buy' }
  ];

  guestLinkTargets.forEach((guest, idx) => {
    orderNumberCounter++;
    const days = 15 + idx * 8;
    const items = generateLineItems(2);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.total), 0);

    orders.push({
      id: orderNumberCounter,
      number: `CMD-${orderNumberCounter}`,
      status: 'completed',
      currency: 'INR',
      currency_symbol: '₹',
      date_created: daysAgo(days),
      date_modified: daysAgo(days),
      total: totalAmount.toFixed(2),
      customer_id: 0, // GUEST ORDER!
      customer_note: guest.note,
      billing: {
        first_name: guest.targetCust.first_name,
        last_name: guest.targetCust.last_name,
        company: '',
        address_1: guest.targetCust.billing.address_1,
        city: guest.targetCust.billing.city,
        state: guest.targetCust.billing.state,
        postcode: guest.targetCust.billing.postcode,
        country: 'IN',
        email: guest.targetCust.email, // Exact verified email match
        phone: guest.targetCust.billing.phone,
      },
      shipping: {
        first_name: guest.targetCust.first_name,
        last_name: guest.targetCust.last_name,
        city: guest.targetCust.shipping.city,
        state: guest.targetCust.shipping.state,
        postcode: guest.targetCust.shipping.postcode,
        country: 'IN',
      },
      payment_method: 'upi',
      payment_method_title: 'UPI Express Guest Checkout',
      line_items: items,
    });
  });

  // Sort orders descending by date_created
  orders.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

  const output = {
    generated_at: new Date().toISOString(),
    store_name: 'Kilowatt Artisanal Stores (WooCommerce Hub)',
    store_url: 'https://demo-woo.kilowatt-stores.in',
    stats: {
      customer_count: customers.length,
      order_count: orders.length,
      guest_orders_count: 3,
    },
    customers,
    orders,
  };

  const dataDir = path.dirname(MOCK_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(MOCK_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[SEED MOCK] Created ${MOCK_FILE} successfully:`);
  console.log(`- Customers: ${customers.length}`);
  console.log(`- Orders: ${orders.length} (including 3 guest orders linked by billing email)`);
  console.log(`- Showcase Customer: Aarav Sharma (ID: 1, ${aaravOrders.length} direct orders + 1 linked guest order)`);

  // Ensure CRM sample data is seeded
  crmRepo.seedDefaultCrmData();
  console.log(`[SEED MOCK] Auto-seeded CRM db.json with tags, notes, and followups.`);
}

if (require.main === module) {
  generateMockData();
}

module.exports = generateMockData;
