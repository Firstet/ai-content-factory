// ============================================================
// Worker Base — Shared setup for all BullMQ workers
// Connects to Redis and Postgres, provides logging utilities
// ============================================================
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

export const prisma = new PrismaClient();

function parseRedisConfig() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname || 'redis',
        port: parseInt(parsed.port || '6379', 10),
      };
    } catch {
      // Ignore URL parse error
    }
  }
  return {
    host: process.env.REDIS_HOST?.trim() || 'redis',
    port: parseInt(process.env.REDIS_PORT?.trim() || '6379', 10),
  };
}

export const redisConnection = parseRedisConfig();

export function createWorker(
  queueName: string,
  processor: (job: Job) => Promise<unknown>,
) {
  const worker = new Worker(queueName, processor, {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
  });

  worker.on('completed', (job) => {
    console.log(`✅ [${queueName}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [${queueName}] Job ${job?.id} failed:`, err.message);
    // Update DB job status
    if (job?.data?.videoId) {
      prisma.job.updateMany({
        where: { bullJobId: String(job.id) },
        data: { status: 'FAILED', error: err.message },
      }).catch(console.error);
    }
  });

  worker.on('active', (job) => {
    console.log(`⚡ [${queueName}] Job ${job.id} started`);
    prisma.job.updateMany({
      where: { bullJobId: String(job.id) },
      data: { status: 'ACTIVE' },
    }).catch(console.error);
  });

  process.on('SIGTERM', async () => {
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
  });

  console.log(`🚀 Worker started: ${queueName}`);
  return worker;
}

/**
 * Helper: emit WebSocket event via Redis pub/sub to the API server.
 * Workers can't directly access the Socket.io server, so they publish
 * to a Redis channel that the API subscribes to.
 */
export async function emitJobProgress(
  videoId: string,
  step: string,
  progress: number,
  message: string,
) {
  const client = new Redis({ host: redisConnection.host, port: redisConnection.port });
  await client.publish(
    'acf:job-progress',
    JSON.stringify({ videoId, step, progress, message, timestamp: new Date().toISOString() }),
  );
  await client.quit();
}

/**
 * Helper: enqueue the next step in the pipeline.
 */
export async function enqueueNextStep(
  nextQueue: string,
  videoId: string,
  brandId: string,
  step: string,
  metadata: Record<string, unknown>,
) {
  const { Queue } = await import('bullmq');
  const queue = new Queue(nextQueue, { connection: redisConnection });
  await queue.add(step, { videoId, brandId, step, metadata }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
  await queue.close();
}
