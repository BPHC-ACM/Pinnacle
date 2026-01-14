import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard', // Human readable time
      ignore: 'pid,hostname', // <--- Hides the noise
      messageFormat: '{msg}', // Just show the message clearly
    },
  },
});
