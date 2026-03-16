# Marketing Analytics Dashboard

A modern, production-grade marketing analytics platform built with React + TypeScript frontend and Fastify + Prisma backend. Features a beautiful glassmorphism UI, dark mode, animated components, and comprehensive marketing data visualization.

## ✨ Features

- 📊 **Executive Overview** — KPI cards with animated counters, area charts, smart recommendations
- 📈 **Channel Analytics** — Bar charts, pie charts, conversion efficiency tables, campaign performance
- 🔽 **Funnel View** — Visual conversion funnel, stage analysis, drop-off tracking
- 🎯 **Attribution Studio** — 5 attribution models, radar charts, revenue redistribution analysis
- ⚙️ **Settings** — Dark mode, currency preferences, notification controls, data management
- 🌙 **Dark Mode** — Full dark theme support with smooth transitions
- 📤 **CSV Upload** — Upload your own marketing data to power the dashboard
- 🔔 **Notifications** — Activity notification system
- 🔍 **Search** — Quick search across dashboard
- 📱 **Responsive** — Collapsible sidebar, mobile-friendly layout

## Quick Start

**See [RUN.md](./RUN.md) for step-by-step run instructions.**

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Framer Motion
- **Backend**: Node.js, TypeScript, Fastify
- **Database**: Prisma ORM, PostgreSQL
- **UI**: Glassmorphism design, custom component library, CSS animations

---

## Project Structure

```
Mproject/
├── server/                 # Fastify API
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── index.ts        # API routes (mock data)
│   │   ├── reportAnalytics.ts
│   │   ├── reportStore.ts
│   │   └── reportTypes.ts
│   └── env.example         # Copy to .env for DB config
├── web/                    # React frontend
│   └── src/
│       ├── App.tsx         # Sidebar layout + routing
│       ├── themeContext.tsx # Dark mode provider
│       ├── reportContext.tsx
│       ├── components/
│       │   ├── Sidebar.tsx         # Collapsible navigation
│       │   ├── TopBar.tsx          # Search, notifications, upload
│       │   ├── Card.tsx            # Reusable card component
│       │   ├── AnimatedNumber.tsx  # Animated counter
│       │   ├── EmptyState.tsx      # Empty state illustrations
│       │   ├── Skeleton.tsx        # Loading skeletons
│       │   ├── PageHeader.tsx      # Page titles with badges
│       │   ├── Footer.tsx          # App footer
│       │   └── UploadBar.tsx       # CSV upload
│       └── pages/
│           ├── ExecutiveOverviewPage.tsx
│           ├── ChannelAnalyticsPage.tsx
│           ├── FunnelViewPage.tsx
│           ├── AttributionStudioPage.tsx
│           └── SettingsPage.tsx
└── RUN.md                  # Step-by-step run guide
```

---

## Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| Executive Overview | `/` | KPIs with animated counters, area charts, smart recommendations, channel ranking |
| Channel Analytics | `/channels` | Bar charts, pie charts, conversion efficiency, campaign table |
| Funnel View | `/funnel` | Visual funnel, stage analysis, conversion rates, drop-off tracking |
| Attribution Studio | `/attribution` | 5 attribution models, radar chart, revenue redistribution, ranking cards |
| Settings | `/settings` | Theme, currency, notifications, data management, about info |

All pages use **mock data** from the API. Upload a CSV to replace with real data.

---

## API Endpoints

- `GET /api/overview/kpis` – Executive KPIs
- `GET /api/overview/trend` – Spend vs Revenue trend
- `GET /api/channels/summary` – Channel summary
- `GET /api/channels/campaigns` – Campaign performance
- `GET /api/funnel/summary` – Funnel stages
- `GET /api/attribution/overview?model=LAST_CLICK` – Attribution by model

---

## Database (Optional)

To use PostgreSQL:

1. Copy `server/env.example` to `server/.env`
2. Set `DATABASE_URL` for your PostgreSQL instance
3. Run `npx prisma generate` and `npx prisma migrate dev` from `server/`
