import 'dotenv/config';
import * as amqplib from 'amqplib';
import type { Application, Request, Response } from 'express';
import express, { json } from 'express';

import { logger } from '../../config/logger.config';

interface Notification {
  to: string;
  subject: string;
  text: string;
}

interface Config {
  rabbitmqUrl: string;
  queueName: string;
  port: number;
  maxRetries: number;
  retryDelayMs: number;
}

interface QueueConnection {
  connection: Awaited<ReturnType<typeof amqplib.connect>> | null;
  channel: amqplib.Channel | null;
}

export function getConfig(): Config {
  return {
    rabbitmqUrl: process.env.RABBITMQ_URL ?? 'amqps://USERNAME:PASSWORD@your-rabbitmq-host:5671',
    queueName: process.env.QUEUE_NAME ?? 'notifications',
    port: Number(process.env.PORT) || 4000,
    maxRetries: Number(process.env.RABBITMQ_MAX_RETRIES) || 5,
    retryDelayMs: Number(process.env.RABBITMQ_RETRY_DELAY_MS) || 3000,
  };
}

export function validateNotification(data: unknown): data is Notification {
  const record = data as Record<string, unknown>;
  return (
    typeof record.to === 'string' &&
    record.to.trim().length > 0 &&
    typeof record.subject === 'string' &&
    record.subject.trim().length > 0 &&
    typeof record.text === 'string' &&
    record.text.trim().length > 0
  );
}

export async function connectToQueue(
  config: Config,
  connection: QueueConnection,
): Promise<amqplib.Channel> {
  if (!connection.channel) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        logger.info(
          `Attempting to connect to RabbitMQ (attempt ${attempt}/${config.maxRetries})...`,
        );
        const conn = await amqplib.connect(config.rabbitmqUrl);
        const chan = await conn.createChannel();
        await chan.assertQueue(config.queueName, { durable: true });
        connection.connection = conn;
        connection.channel = chan;
        logger.info('Successfully connected to RabbitMQ');
        return connection.channel;
      } catch (error) {
        lastError = error as Error;
        logger.error({ err: error, attempt }, `RabbitMQ connection attempt ${attempt} failed`);

        if (attempt < config.maxRetries) {
          logger.info(`Retrying in ${config.retryDelayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, config.retryDelayMs));
        }
      }
    }

    throw new Error(
      `Failed to connect to RabbitMQ after ${config.maxRetries} attempts: ${lastError?.message}`,
    );
  }
  return connection.channel;
}

export function createNotificationHandler(
  config: Config,
  connection: QueueConnection,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      if (!validateNotification(req.body)) {
        res.status(400).json({
          error: 'Invalid request: to, subject, and text are required and cannot be empty',
        });
        return;
      }

      const channel = await connectToQueue(config, connection);
      channel.sendToQueue(config.queueName, Buffer.from(JSON.stringify(req.body)), {
        persistent: true,
      });
      res.json({ message: 'Notification queued successfully' });
    } catch (error) {
      const body = req.body as Record<string, unknown>;
      logger.error(
        {
          err: error,
          request: { to: body?.to, subject: body?.subject },
        },
        'Failed to queue notification',
      );
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function createApp(config: Config, connection: QueueConnection): Application {
  const app = express();
  app.use(json({ limit: '1mb' }));
  app.post('/notify', createNotificationHandler(config, connection));
  return app;
}

// Run if this is the main module
if (require.main === module) {
  const config = getConfig();
  const connection: QueueConnection = { connection: null, channel: null };
  const app = createApp(config, connection);

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully...`);
    try {
      if (connection.channel) await connection.channel.close();
      if (connection.connection) await connection.connection.close();
      logger.info('Connections closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', (): void => {
    void gracefulShutdown('SIGINT');
  });

  process.on('SIGTERM', (): void => {
    void gracefulShutdown('SIGTERM');
  });

  app.listen(config.port, () => {
    logger.info(`App-Service running on port ${config.port}`);
  });
}
