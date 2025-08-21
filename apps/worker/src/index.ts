import 'dotenv/config';
import { Queue, Worker } from "bullmq";

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  // BullMQ 5 requires this to be null when using blocking commands
  maxRetriesPerRequest: null as any,
  // Skip ready check for local dev
  enableReadyCheck: false,
};

export const indexQueue = new Queue("index", { connection });

new Worker(
  "index",
  async (job) => {
    console.log("Index job", job.id, job.name, job.data);
  },
  { connection },
);

console.log("Worker started. Queues: index");
