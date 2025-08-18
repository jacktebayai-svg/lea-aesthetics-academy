import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const indexQueue = new Queue("index", { connection });

new Worker(
  "index",
  async (job) => {
    console.log("Index job", job.id, job.name, job.data);
  },
  { connection },
);

console.log("Worker started. Queues: index");
