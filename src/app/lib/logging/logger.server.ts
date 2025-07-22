import pino from 'pino';
import { headers } from 'next/headers';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' && {
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

function getLogContext() {
  try {
    const headersList = headers() as unknown as Headers;
    const requestId = headersList.get('x-request-id');
    const userId = headersList.get('x-user-id');
    const forwarded = headersList.get('x-forwarded-for');
    const userAgent = headersList.get('user-agent');
    
    return {
      requestId: requestId || undefined,
      userId: userId || undefined,
      ip: forwarded || undefined,
      userAgent: userAgent || undefined,
    };
  } catch {
    // headers() throws in non-request contexts
    return {};
  }
}

function createContextualLogger() {
  const context = getLogContext();
  
  if (context.requestId || context.userId) {
    return logger.child(context);
  }
  
  return logger;
}

export const serverLogger = {
  info: (message: string, metadata?: Record<string, any>) => {
    createContextualLogger().info(metadata || {}, message);
  },
  warn: (message: string, metadata?: Record<string, any>) => {
    createContextualLogger().warn(metadata || {}, message);
  },
  error: (message: string, error?: Error | unknown, metadata?: Record<string, any>) => {
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
    createContextualLogger().error(logData, message);
  },
  debug: (message: string, metadata?: Record<string, any>) => {
    createContextualLogger().debug(metadata || {}, message);
  },
};

export { logger as pinoLogger };