const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

async function testMongo() {
  console.log('==================================================');
  console.log(' TESTING MONGODB ATLAS CONNECTION');
  console.log('==================================================');
  console.log('URI:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'NOT SET');

  if (!uri) {
    console.error('[FAIL] MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  try {
    console.log('1. Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[PASS] Successfully connected to MongoDB Atlas!');

    console.log('2. Loading models & testing collections...');
    const { CustomerCrm, Interaction, Followup } = require('../src/db/models');

    const customerCount = await CustomerCrm.countDocuments();
    const interactionCount = await Interaction.countDocuments();
    const followupCount = await Followup.countDocuments();

    console.log(`- Current Customers in Mongo: ${customerCount}`);
    console.log(`- Current Interactions in Mongo: ${interactionCount}`);
    console.log(`- Current Follow-ups in Mongo: ${followupCount}`);

    console.log('3. Testing write operation (heartbeat check)...');
    const testDoc = await Interaction.create({
      id: `int-test-${Date.now().toString().slice(-6)}`,
      customerId: '1',
      type: 'note',
      summary: 'Automated Atlas MongoDB healthcheck verified.',
      createdAt: new Date().toISOString(),
    });
    console.log(`[PASS] Write operation succeeded! Document ID: ${testDoc.id}`);

    console.log('4. Testing read operation...');
    const readDoc = await Interaction.findOne({ id: testDoc.id }).lean();
    if (readDoc) {
      console.log(`[PASS] Read operation verified: "${readDoc.summary}"`);
    }

    console.log('--------------------------------------------------');
    console.log('[PASS] MongoDB Atlas is 100% operational and ready!');
    console.log('==================================================');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('--------------------------------------------------');
    console.error('[FAIL] MongoDB Atlas connection failed.');
    console.error('Error Details:', err.message);
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('Hint: The username or password in MONGODB_URI might be incorrect.');
    } else if (err.message.includes('whitelisted') || err.message.includes('whitelist') || err.message.includes('timed out') || err.message.includes('querySrv ENOTFOUND')) {
      console.error('Hint: Please ensure your IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0).');
    }
    console.error('==================================================');
    process.exit(1);
  }
}

testMongo();
