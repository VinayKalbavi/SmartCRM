const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.WOOCOMMERCE_URL;
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

const sampleProducts = [
  { name: 'Artisanal Brass Incense Burner', regular_price: '1250', type: 'simple' },
  { name: 'Organic Assam CTC Reserve Tea 250g', regular_price: '650', type: 'simple' },
  { name: 'Handcrafted Copper Water Carafe 1.2L', regular_price: '2450', type: 'simple' },
  { name: 'Ayurvedic Kumkumadi Facial Oil 30ml', regular_price: '1850', type: 'simple' },
  { name: 'Kashmiri Organic Mogra Saffron 2g', regular_price: '950', type: 'simple' },
];

const sampleCustomers = [
  { first: 'Aarav', last: 'Sharma', email: 'aarav.sharma@example.in', city: 'Mumbai', state: 'MH', phone: '+91 98765 43210' },
  { first: 'Diya', last: 'Patel', email: 'diya.patel@example.in', city: 'Ahmedabad', state: 'GJ', phone: '+91 98234 56789' },
  { first: 'Rohan', last: 'Mehta', email: 'rohan.mehta@example.in', city: 'Bengaluru', state: 'KA', phone: '+91 97123 45678' },
  { first: 'Pooja', last: 'Nair', email: 'pooja.nair@example.in', city: 'Kochi', state: 'KL', phone: '+91 96345 67890' },
  { first: 'Vikram', last: 'Singh', email: 'vikram.singh@example.in', city: 'Jaipur', state: 'RJ', phone: '+91 95456 78901' },
  { first: 'Ananya', last: 'Iyer', email: 'ananya.iyer@example.in', city: 'Chennai', state: 'TN', phone: '+91 94567 89012' },
  { first: 'Kabir', last: 'Verma', email: 'kabir.verma@example.in', city: 'Delhi', state: 'DL', phone: '+91 93678 90123' },
  { first: 'Neha', last: 'Gupta', email: 'neha.gupta@example.in', city: 'Lucknow', state: 'UP', phone: '+91 92789 01234' },
  { first: 'Aditya', last: 'Kulkarni', email: 'aditya.kulkarni@example.in', city: 'Pune', state: 'MH', phone: '+91 91890 12345' },
  { first: 'Meera', last: 'Sen', email: 'meera.sen@example.in', city: 'Kolkata', state: 'WB', phone: '+91 90901 23456' },
  { first: 'Siddharth', last: 'Rao', email: 'siddharth.rao@example.in', city: 'Hyderabad', state: 'TS', phone: '+91 89012 34567' },
  { first: 'Tanvi', last: 'Bhatt', email: 'tanvi.bhatt@example.in', city: 'Surat', state: 'GJ', phone: '+91 88123 45678' },
  { first: 'Arjun', last: 'Deshmukh', email: 'arjun.deshmukh@example.in', city: 'Nagpur', state: 'MH', phone: '+91 87234 56789' },
  { first: 'Ishaan', last: 'Chopra', email: 'ishaan.chopra@example.in', city: 'Chandigarh', state: 'PB', phone: '+91 86345 67890' },
  { first: 'Rhea', last: 'Kapoor', email: 'rhea.kapoor@example.in', city: 'Gurugram', state: 'HR', phone: '+91 85456 78901' },
];

async function seedWoo() {
  console.log('==================================================');
  console.log(' REAL WOOCOMMERCE STORE SEEDER');
  console.log('==================================================');

  if (!url || !consumerKey || !consumerSecret || url.includes('your-store')) {
    console.log('[FAIL] Cannot seed WooCommerce. server/.env does not contain valid live credentials.');
    process.exit(1);
  }

  const cleanUrl = url.replace(/\/+$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const client = axios.create({
    baseURL: `${cleanUrl}/wp-json/wc/v3`,
    headers: {
      Authorization: authHeader,
      'User-Agent': 'SmartCRM-WooHub/1.0',
    },
    timeout: 20000,
  });

  try {
    // 1. Check or create products
    console.log('Step 1: Checking store products...');
    const existingProductsRes = await client.get('/products', { params: { per_page: 20 } });
    let productList = existingProductsRes.data || [];

    if (productList.length < 5) {
      console.log(`Found only ${productList.length} products. Creating sample products...`);
      for (const p of sampleProducts) {
        const found = productList.find(x => x.name.toLowerCase() === p.name.toLowerCase());
        if (!found) {
          const created = await client.post('/products', p);
          productList.push(created.data);
          console.log(`+ Created product: ${p.name}`);
        }
      }
    } else {
      console.log(`Found ${productList.length} products ready for order line items.`);
    }

    // 2. Check and create customers
    console.log('\nStep 2: Checking/creating 15 sample customers...');
    const existingCustRes = await client.get('/customers', { params: { per_page: 100 } });
    const existingCusts = existingCustRes.data || [];
    const createdCustomers = [];

    for (const c of sampleCustomers) {
      const existing = existingCusts.find(x => x.email.toLowerCase() === c.email.toLowerCase());
      if (existing) {
        console.log(`~ Customer already exists: ${c.first} ${c.last} (${c.email}) - Skipping`);
        createdCustomers.push(existing);
      } else {
        const newCustRes = await client.post('/customers', {
          email: c.email,
          first_name: c.first,
          last_name: c.last,
          username: c.email.split('@')[0],
          billing: {
            first_name: c.first,
            last_name: c.last,
            address_1: '123 Heritage Lane',
            city: c.city,
            state: c.state,
            postcode: '400001',
            country: 'IN',
            email: c.email,
            phone: c.phone,
          },
          shipping: {
            first_name: c.first,
            last_name: c.last,
            address_1: '123 Heritage Lane',
            city: c.city,
            state: c.state,
            postcode: '400001',
            country: 'IN',
          }
        });
        createdCustomers.push(newCustRes.data);
        console.log(`+ Created customer: ${c.first} ${c.last} (${c.email})`);
      }
    }

    // 3. Create 40 sample orders
    console.log('\nStep 3: Creating 40 sample orders...');
    const statuses = ['completed', 'completed', 'processing', 'pending', 'cancelled', 'refunded'];
    let ordersCreated = 0;

    for (let i = 0; i < 40; i++) {
      const cust = createdCustomers[i % createdCustomers.length];
      const prod = productList[i % productList.length];
      const status = statuses[i % statuses.length];

      const orderPayload = {
        payment_method: i % 2 === 0 ? 'razorpay' : 'upi',
        payment_method_title: i % 2 === 0 ? 'Credit Card' : 'UPI Instant',
        set_paid: status === 'completed',
        status: status,
        customer_id: cust.id,
        billing: cust.billing,
        shipping: cust.shipping,
        line_items: [
          {
            product_id: prod.id,
            quantity: (i % 3) + 1,
          }
        ]
      };

      try {
        await client.post('/orders', orderPayload);
        ordersCreated++;
        process.stdout.write(`.` );
      } catch (err) {
        console.warn(`\nWarning creating order #${i+1}: ${err.message}`);
      }
    }

    console.log(`\n\n==================================================`);
    console.log(`[PASS] REAL WOOCOMMERCE SEED SUMMARY:`);
    console.log(`- Products active: ${productList.length}`);
    console.log(`- Customers synced: ${createdCustomers.length}`);
    console.log(`- Orders created: ${ordersCreated}`);
    console.log(`==================================================`);
  } catch (err) {
    console.error('[FAIL] Seeder failed:', err.message);
    if (err.response) {
      console.error(JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

seedWoo();
