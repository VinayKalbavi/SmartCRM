# SmartCRM - Beginner Setup & WooCommerce Integration Guide

This guide walks you through connecting SmartCRM to a **free live test WooCommerce store** in under 5 minutes, running sample seeders, configuring databases, and troubleshooting common issues.

---

## Part 1: Get a Free Test WooCommerce Store (Under 3 Minutes)

You can launch a free WordPress sandbox instantly without any credit card or local server setup:

### Option A: InstaWP (Recommended)
1. Go to [https://instawp.com](https://instawp.com) and click **"Create Site"**.
2. Select **WooCommerce** from the quick template list or standard WordPress.
3. Click **"Create Site"** and access your dashboard with 1 click.

### Option B: TasteWP
1. Visit [https://tastewp.com](https://tastewp.com).
2. Click **"Set it up"** to spin up a free instant WordPress site.
3. Go to **Plugins -> Add New**, search for **WooCommerce**, click **Install**, and **Activate**.

### Option C: LocalWP
1. Download [LocalWP](https://localwp.com) on your computer.
2. Click **"Create a new site"** and follow the prompts.

---

## Part 2: Generate WooCommerce REST API Keys

1. In your WordPress admin dashboard, navigate to:
   `WooCommerce -> Settings -> Advanced -> REST API`.
2. Click the **"Add key"** button.
3. Fill in the fields:
   - **Description**: `SmartCRM Hub Integration`
   - **User**: Select your Admin user
   - **Permissions**: Select **Read/Write** (Required for syncing and seeding)
4. Click **"Generate API key"**.
5. Copy your **Consumer Key** (`ck_...`) and **Consumer Secret** (`cs_...`).
   *(WordPress only displays the secret once!)*

---

## Part 3: Configure `server/.env`

Open `server/.env` in your project folder and update the fields:

```env
PORT=5000
USE_MOCK_DATA=false
WOOCOMMERCE_URL=https://your-test-site.instawp.xyz
WOOCOMMERCE_CONSUMER_KEY=ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
WOOCOMMERCE_CONSUMER_SECRET=cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MONGODB_URI=
```

---

## Part 4: Test Connection and Seed Your Store

Run the verification script to confirm connectivity:

```bash
npm run test:woo
```
**Expected Output:**
```
==================================================
 SMARTCRM - WOOCOMMERCE REST API VERIFICATION
==================================================
1. Connecting to WooCommerce Store...
[PASS] Customer endpoint reachable. Total store customers: 0
2. Testing Orders endpoint...
[PASS] Order endpoint reachable. Total store orders: 0
--------------------------------------------------
[PASS] WooCommerce REST API credentials verified successfully!
```

### Seed 15 Customers and 40 Orders into your Live Store:
```bash
npm run seed:woo
```
This automated script:
1. Checks for products; if fewer than 5 exist, creates 5 artisanal products automatically.
2. Creates 15 realistic Indian customers with billing addresses.
3. Creates 40 orders spanning varied statuses (`completed`, `processing`, `pending`, `cancelled`, `refunded`).
4. Is safe to run multiple times (skips existing customer emails).

---

## Part 5: Switching Between Mock and Live Mode

SmartCRM features an explicit mode switch without silent fallbacks:

- **To run in Mock Mode (zero external dependencies):**
  Set `USE_MOCK_DATA=true` in `server/.env` and restart the server.
  The topbar displays: `Mock Mode (simulated integration)`.
- **To run in Live Mode:**
  Set `USE_MOCK_DATA=false` in `server/.env` with valid credentials.
  The topbar displays: `Live WooCommerce: https://your-store.example.com`.
  If credentials fail or the server is unreachable, an explicit red banner alerts staff.

---

## Part 6: (Optional) MongoDB Atlas Setup

By default, SmartCRM persists all CRM interactions, notes, tags, and follow-ups to `server/data/db.json` synchronously. To connect a cloud MongoDB database:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow your IP in Network Access (`0.0.0.0/0` for testing).
3. Copy your connection URI and paste it in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/smartcrm?retryWrites=true&w=majority
   ```
4. Restart the server. SmartCRM will automatically detect `MONGODB_URI` and route through Mongoose.

---

## Part 7: Troubleshooting Table

| Error / Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| **`401 Unauthorized`** | Incorrect Consumer Key / Secret or User has insufficient permissions | Verify key is copied accurately; confirm Key permissions are set to **Read/Write** in WooCommerce -> Advanced -> REST API. |
| **`404 rest_no_route`** | Pretty Permalinks are disabled in WordPress | In WordPress admin, go to **Settings -> Permalinks**, choose **"Post name"**, and click **Save Changes**. |
| **`SSL / CERT_HAS_EXPIRED`** | Self-signed or expired SSL certificate on development store | If using local environment or self-signed cert, ensure Node accepts the certificate or use an HTTPS tunneling service like ngrok or LocalWP Live Links. |
| **`CORS Error`** in Browser | Calling WooCommerce API directly from frontend | SmartCRM resolves this by design: all WooCommerce calls are routed securely through the backend adapter layer (`/api`), eliminating CORS issues. |
| **`Port 5000 in use`** | A dangling process is occupying port 5000 | In PowerShell, run `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess \| Stop-Process -Force` or change `PORT=5050` in `server/.env` and update `client/vite.config.js`. |
| **Empty Results on Dashboard** | Cache has not refreshed or store is newly created | Click the **"Sync"** button in the SmartCRM topbar or run `POST /api/sync` to force a cache refresh. |
