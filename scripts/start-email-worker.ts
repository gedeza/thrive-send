#!/usr/bin/env ts-node

/**
 * Email Worker Startup Script
 * 
 * This script starts the email processing worker that handles:
 * - Single email sending
 * - Bulk email campaigns
 * - Newsletter distribution
 * - Campaign email processing
 * 
 * Usage:
 *   pnpm worker:start    # Start worker (add to package.json scripts)
 *   ts-node scripts/start-email-worker.ts
 */

import { emailWorker, EmailWorkerManager } from '../src/lib/queue/email-worker';
import { EmailQueueManager } from '../src/lib/queue/email-queue';
import { logger } from '../src/lib/utils/logger';

// Graceful shutdown handling
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn('Force shutdown requested');
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    // Stop accepting new jobs
    await EmailWorkerManager.pauseWorker();
    logger.info('Worker paused, no new jobs will be processed');

    // Wait for current jobs to complete (max 30 seconds)
    const shutdownTimeout = setTimeout(() => {
      logger.warn('Shutdown timeout reached, forcing exit');
      process.exit(1);
    }, 30000);

    // Stop the worker
    await EmailWorkerManager.stopWorker();
    clearTimeout(shutdownTimeout);

    logger.info('Email worker stopped gracefully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
}

// Setup signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in email worker', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection in email worker', reason as Error, {
    promise: promise.toString(),
  });
  gracefulShutdown('unhandledRejection');
});

// Main startup function
async function startEmailWorker() {
  try {
    logger.info('Starting email worker process...', {
      nodeVersion: process.version,
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
    });

    // Initialize worker
    await EmailWorkerManager.startWorker();

    // Log worker configuration
    const stats = EmailWorkerManager.getWorkerStats();
    logger.info('Email worker started successfully', {
      concurrency: stats.concurrency,
      stalledInterval: stats.stalledInterval,
      maxStalledCount: stats.maxStalledCount,
      isRunning: stats.isRunning,
      isPaused: stats.isPaused,
    });

    // Log queue statistics periodically
    const logQueueStats = async () => {
      try {
        const queueStats = await EmailQueueManager.getQueueStats();
        if (queueStats) {
          logger.info('Queue statistics', {
            waiting: queueStats.waiting,
            active: queueStats.active,
            completed: queueStats.completed,
            failed: queueStats.failed,
            delayed: queueStats.delayed,
            total: queueStats.total,
          });
        }
      } catch (error) {
        logger.error('Failed to get queue statistics', error);
      }
    };

    // Log queue stats every 5 minutes
    const statsInterval = setInterval(logQueueStats, 5 * 60 * 1000);

    // Log initial stats
    await logQueueStats();

    logger.info('Email worker is running and ready to process jobs');
    logger.info('Press Ctrl+C to stop gracefully');

    // Keep the process alive
    return new Promise((resolve) => {
      // This promise never resolves to keep the worker running
      process.on('SIGTERM', () => {
        clearInterval(statsInterval);
        resolve(undefined);
      });
      process.on('SIGINT', () => {
        clearInterval(statsInterval);
        resolve(undefined);
      });
    });

  } catch (error) {
    logger.error('Failed to start email worker', error);
    process.exit(1);
  }
}

// Display startup banner
console.log(`
┌─────────────────────────────────────────────────────────────┐
│                    Thrive-Send Email Worker                 │
│                                                             │
│  🚀 Starting background email processing service...        │
│  📧 Handles: Single emails, Bulk campaigns, Newsletters    │
│  ⚡ Redis-backed queue with BullMQ                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
`);

// Start the worker
startEmailWorker().catch((error) => {
  logger.error('Email worker startup failed', error);
  process.exit(1);
});