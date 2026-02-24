import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Basic CORS for local dev – you can tighten this later
// Fastify has its own CORS plugin, but for a quick start we can use a simple wrapper.
fastify.addHook("onRequest", (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    reply.status(204).send();
    return;
  }
  done();
});

// Routes
fastify.get("/api/overview/kpis", async () => {
  // TODO: replace with Prisma queries
  return {
    totalSpend: 120000,
    revenue: 360000,
    roas: 3.0,
    conversions: 4200,
    cac: 28.6,
  };
});

fastify.get("/api/overview/trend", async () => {
  // TODO: replace with Prisma queries
  const days = 14;
  const today = new Date();
  const data = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dateLabel = d.toISOString().slice(0, 10);
    const spend = 5000 + Math.random() * 2000;
    const revenue = spend * (2.5 + Math.random() * 1);
    return { date: dateLabel, spend, revenue };
  });
  return data;
});

const port = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

