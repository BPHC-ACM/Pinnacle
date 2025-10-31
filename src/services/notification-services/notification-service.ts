/* eslint-disable import/no-named-as-default-member */
import 'dotenv/config';
import type amqplib from 'amqplib';
import amqp from 'amqplib';
import type nodemailer from 'nodemailer';
import nodemailerLib from 'nodemailer';

interface Notification {
  to: string;
  subject: string;
  text: string;
}

interface Config {
  rabbitmqUrl: string;
  queueName: string;
  emailFrom: string;
  emailService: string;
  emailUser: string;
  emailPassword: string;
}

export function getConfig(): Config {
  return {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqps://USERNAME:PASSWORD@your-rabbitmq-host:5671',
    queueName: process.env.QUEUE_NAME || 'notifications',
    emailFrom: process.env.EMAIL_FROM || 'youremail@gmail.com',
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    emailUser: process.env.EMAIL_USER || 'youremail@gmail.com',
    emailPassword: process.env.EMAIL_PASSWORD || 'your-app-password',
  };
}

export function createTransporter(config: Config): nodemailer.Transporter {
  return nodemailerLib.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
}

export async function connectToQueue(config: Config): Promise<amqplib.Channel> {
  const connection = await amqp.connect(config.rabbitmqUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(config.queueName, { durable: true });
  await channel.prefetch(1);
  return channel;
}

export async function sendEmail(
  transporter: nodemailer.Transporter,
  notification: Notification,
  emailFrom: string,
): Promise<void> {
  await transporter.sendMail({
    from: emailFrom,
    to: notification.to,
    subject: notification.subject,
    text: notification.text,
  });
}

export async function processMessage(
  msg: amqplib.ConsumeMessage,
  channel: amqplib.Channel,
  transporter: nodemailer.Transporter,
  emailFrom: string,
): Promise<void> {
  try {
    const notification = JSON.parse(msg.content.toString()) as Notification;
    await sendEmail(transporter, notification, emailFrom);
    console.log('Email sent to:', notification.to);
    channel.ack(msg);
  } catch (error) {
    console.error('Failed to send email:', error);
    channel.nack(msg, false, true);
  }
}

export async function startWorker(config: Config): Promise<void> {
  const transporter = createTransporter(config);
  const channel = await connectToQueue(config);

  console.log('Notification worker started');

  await channel.consume(config.queueName, (msg) => {
    if (!msg) return;
    void processMessage(msg, channel, transporter, config.emailFrom);
  });
}

export async function shutdown(
  channel: amqplib.Channel,
  connection: amqplib.ChannelModel,
): Promise<void> {
  await channel.close();
  await connection.close();
}

// Run if this is the main module
if (require.main === module) {
  const config = getConfig();
  void startWorker(config).catch((error) => {
    console.error('Worker failed:', error);
    process.exit(1);
  });
}
