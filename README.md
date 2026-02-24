## Marketing Analytics Dashboard – Starter

This project is a minimal starter for a marketing analytics platform with:

- **Frontend**: React + TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Node + TypeScript, Fastify
- **ORM / DB**: Prisma ORM + PostgreSQL

It currently implements:

- An API skeleton with mocked data for the **Executive Overview** KPIs and trend
- A React dashboard with 4 pages (Executive, Channels, Funnel, Attribution) wired to the backend for Page 1

---

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm (or pnpm / yarn, adjust commands accordingly)
- PostgreSQL instance you can connect to

---

### 2. Project structure

- `server/` – Fastify API (TypeScript)
- `web/` – React + Vite frontend
- `prisma/schema.prisma` – Prisma data model for PostgreSQL

Key files:

- `server/src/index.ts` – Fastify server + `/api/overview/*` endpoints (mocked data)
- `web/src/pages/ExecutiveOverviewPage.tsx` – Executive Overview dashboard page
- `web/src/App.tsx` – App shell + navigation between the 4 main pages

---

### 3. Configure environment variables

Create a `.env` file inside `server/` (you can copy from `.env.example` if present) and set:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/YOUR_DB?schema=public"
PORT=4000
```

Replace `USER`, `PASSWORD`, and `YOUR_DB` with your local PostgreSQL details.

---

### 4. Install dependencies

In the **backend** folder:

```bash
cd server
npm install
```

In the **frontend** folder:

```bash
cd web
npm install
```

---

### 5. Set up Prisma and the database

From the project root:

```bash
cd server
npx prisma generate         # generate Prisma client
npx prisma migrate dev      # create DB tables from schema.prisma
```

At this stage you have empty tables; the current Executive Overview uses **mocked data**, so the dashboard will still show values even without real data.

Later, you can:

- Add seed scripts or Node analytics scripts to insert real data into:
  - `Channel`, `Campaign`, `DailyPerformance`, `FunnelEvent`, `Touchpoint`, `Conversion`, `AttributionResult`
- Replace the mock responses in `server/src/index.ts` with real Prisma queries.

---

### 6. Run the backend (API server)

From `server/`:

```bash
npm run dev
```

This starts Fastify on `http://localhost:4000` by default.

Endpoints available now:

- `GET /api/overview/kpis` – mocked KPIs
- `GET /api/overview/trend` – mocked 14‑day Spend vs Revenue trend

---

### 7. Run the frontend (React app)

Open a new terminal, then from `web/`:

```bash
npm run dev
```

Vite starts the dev server on `http://localhost:5173`.

The Vite config proxies `/api` calls to the backend (`http://localhost:4000`), so the frontend can use relative URLs like `/api/overview/kpis`.

---

### 8. Navigate the dashboard

Open `http://localhost:5173` in your browser. You’ll see:

- **Executive** (default route `/`):
  - KPI cards: Total Spend, Revenue, ROAS, Conversions, CAC (from `/api/overview/kpis`)
  - Spend vs Revenue line chart (from `/api/overview/trend`)
  - Placeholder area for Channel performance ranking
- **Channels** (`/channels`): layout placeholders for spend by channel, CPA/CVR, campaign table, heatmap.
- **Funnel** (`/funnel`): layout placeholders for funnel diagram, drop-off, stage conversion %.
- **Attribution** (`/attribution`): layout placeholders plus a model selector dropdown.

---

### 9. Next steps (when you’re ready)

1. **Replace mock data with real queries**
   - In `server/src/index.ts`, use Prisma client to read from `DailyPerformance` and compute:
     - Total Spend, Revenue, ROAS, Conversions, CAC
     - Spend vs Revenue trend grouped by day
2. **Add more API routes**
   - Channel Analytics: channel + campaign aggregates for Page 2
   - Funnel View: stage counts / drop-offs from `FunnelEvent` and `FunnelStage`
   - Attribution Studio: read from `AttributionResult` for selectable models
3. **Add Node analytics scripts**
   - Create scripts to:
     - Import raw marketing data (CSV/API) into staging tables
     - Aggregate into `DailyPerformance`, `FunnelEvent`, `Touchpoint`, `Conversion`
     - Compute and store attribution results in `AttributionResult`

