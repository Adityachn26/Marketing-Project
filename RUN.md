# How to Run the Marketing Analytics Dashboard

Follow these steps **in order** to run the project.

---

## Prerequisites

- **Node.js** v18 or newer
- **npm** (comes with Node)
- **PostgreSQL** (only needed if you want to use the database later; the app works with mock data without it)

---

## Step 1: Install Backend Dependencies

Open a terminal and run:

```bash
cd /Users/adityasinghchauhan/Desktop/Mproject/server
npm install
```

Optional (from project root): install both backend + frontend in one command:

```bash
cd /Users/adityasinghchauhan/Desktop/Mproject
npm run install:all
```

---

## Step 2: Install Frontend Dependencies

In the same or a new terminal:

```bash
cd /Users/adityasinghchauhan/Desktop/Mproject/web
npm install
```

---

## Step 3: (Optional) Set Up Database

**You can skip this step** if you only want to run the app with mock data. The dashboard works without a database.

If you want to use PostgreSQL later:

1. Create a database (e.g. `marketing_analytics`)
2. Copy the example env file:
   ```bash
   cd /Users/adityasinghchauhan/Desktop/Mproject/server
   cp env.example .env
   ```
3. Edit `.env` and set your `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/marketing_analytics?schema=public"
   PORT=4000
   ```
4. Generate Prisma client and create tables:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

---

## Step 4: Start the Backend (API Server)

In a terminal:

```bash
cd /Users/adityasinghchauhan/Desktop/Mproject/server
npm run dev
```

You should see: `API server listening on port 4000`

**Leave this terminal running.**

---

## Step 5: Start the Frontend (React App)

Open a **new terminal** and run:

```bash
cd /Users/adityasinghchauhan/Desktop/Mproject/web
npm run dev
```

You should see something like: `Local: http://localhost:5173/`

---

## Step 6: Open the Dashboard

In your browser, go to:

**http://localhost:5173**

You should see the Marketing Analytics dashboard with:

- **Executive** – KPI cards and Spend vs Revenue chart
- **Channels** – Spend by channel, conversion efficiency, campaign table
- **Funnel** – User journey funnel and stage conversion %
- **Attribution** – Model selector, channel credit distribution, revenue redistribution, ranking

---

## CSV upload (to load another company’s report)

Use the **Upload CSV** button in the header.

### Recommended CSV columns

Your CSV should contain at least these columns (header names are case-insensitive):

- `channel` (or `promo_method` / `source` / `platform`)
- `spend` (or `cost` / `amount_spent`)
- `revenue` (or `sales` / `value`)

Optional (improves more metrics):

- `conversions` (or `purchases` / `orders`)
- `date` (or `day` / `timestamp`) – enables the trend chart
- `campaign` (or `campaign_name` / `ad_name`) – enables campaign table

---

## Quick Reference: Run Order

Each time you want to run the project:

1. **Terminal 1:** `cd server && npm run dev`
2. **Terminal 2:** `cd web && npm run dev`
3. Open **http://localhost:5173** in your browser

---

## Troubleshooting

| Problem | Solution |
|--------|----------|
| `Cannot find module '@fastify/cors'` | Already fixed – the broken import was removed. |
| `EADDRINUSE: port 4000` | Another process is using port 4000. Stop it or set `PORT=4001` in `server/.env`. |
| Blank page or "Failed to fetch" | Make sure the backend is running on port 4000. The frontend proxies `/api` to it. |
| Charts not showing | Wait a moment for the API to respond. Check the browser console (F12) for errors. |
