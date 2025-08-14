import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const prisma = new PrismaClient();

export const indexQueue = new Queue("index", { connection });

new Worker(
  "index",
  async (job) => {
    console.log("Index job", job.id, job.name, job.data);
  },
  { connection },
);

// Poll DB events as a simple notifications stub
async function pollEvents() {
  try {
    const since = new Date(Date.now() - 60_000);
    const events = await prisma.event.findMany({
      where: { occurredAt: { gte: since }, type: "BookingCreated" },
      orderBy: { occurredAt: "desc" },
      take: 20,
    });
    for (const e of events) {
      console.log(
        `[notify] ${e.type} tenant=${e.tenantId} data=${JSON.stringify(e.payload)}`,
      );
    }
  } catch (e) {
    console.error("poll error", e);
  } finally {
    setTimeout(pollEvents, 10000);
  }
}

pollEvents();

console.log("Worker started. Queues: index; Notifications: DB poller active");
