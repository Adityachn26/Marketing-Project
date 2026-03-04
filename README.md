# Marketing Analytics Dashboard

A marketing analytics platform with React + TypeScript frontend and Fastify + Prisma backend.

## Quick Start

**See [RUN.md](./RUN.md) for step-by-step run instructions.**

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, TypeScript, Fastify
- **Database**: Prisma ORM, PostgreSQL

---

## Project Structure

```
Mproject/
├── server/                 # Fastify API
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   └── index.ts        # API routes (mock data)
│   └── env.example         # Copy to .env for DB config
├── web/                    # React frontend
│   └── src/
│       ├── App.tsx         # Layout + routing
│       └── pages/          # Executive, Channels, Funnel, Attribution
└── RUN.md                  # Step-by-step run guide
```

---

## Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| Executive Overview | `/` | KPIs, Spend vs Revenue trend, channel ranking |
| Channel Analytics | `/channels` | Spend by channel, conversion efficiency, campaign table |
| Funnel View | `/funnel` | User journey funnel, stage conversion %, drop-off |
| Attribution Studio | `/attribution` | Model selector, channel credit, revenue redistribution, ranking |

All pages use **mock data** from the API. No database required to run.

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
