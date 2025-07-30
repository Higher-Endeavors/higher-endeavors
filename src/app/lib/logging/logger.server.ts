import pino from 'pino';
import { headers } from 'next/headers';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: null,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  ...(process.env.RUNTIME_ENV === 'dev' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});

async function getLogContext() {
  try {
    const headersList = await headers();
    const requestId = headersList.get('x-request-id');
    const forwarded = headersList.get('x-forwarded-for');
    const userAgent = headersList.get('user-agent');
    
    return {
      requestId: requestId || undefined,
      ip: forwarded || undefined,
      userAgent: userAgent || undefined,
    };
  } catch {
    // headers() throws in non-request contexts
    return {};
  }
}

async function createContextualLogger() {
  const context = await getLogContext();
  
  if (context.requestId || context.ip || context.userAgent) {
    return logger.child(context);
  }
  
  return logger;
}

export const serverLogger = {
  info: async (message: string, metadata?: Record<string, any>) => {
    (await createContextualLogger()).info(metadata || {}, message);
  },
  warn: async (message: string, metadata?: Record<string, any>) => {
    (await createContextualLogger()).warn(metadata || {}, message);
  },
  error: async (message: string, error?: Error | unknown, metadata?: Record<string, any>) => {
    const logData = {
      ...metadata,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };
    (await createContextualLogger()).error(logData, message);
  },
  debug: async (message: string, metadata?: Record<string, any>) => {
    (await createContextualLogger()).debug(metadata || {}, message);
  },
};

export { logger as pinoLogger };