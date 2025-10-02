import { ClientLogEntry, ClientLogEntrySchema } from 'lib/types/logging';

class ClientLogger {
  private sendLog(logEntry: Omit<ClientLogEntry, 'timestamp' | 'source'>): void {
    const payload: ClientLogEntry = {
      ...logEntry,
      timestamp: new Date().toISOString(),
      source: 'client',
    };
    
    // Validate payload before sending
    try {
      ClientLogEntrySchema.parse(payload);
    } catch (error) {
      // Silently fail - logging shouldn't break the app
      return;
    }
    
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });
    
    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/logging/client-log', blob);
    } else {
      // Fallback for older browsers
      fetch('/api/logging/client-log', {
        method: 'POST',
        body: blob,
        keepalive: true,
      }).catch(() => {
        // Silent fail - logging shouldn't break the app
      });
    }
  }
  
  info(message: string, metadata?: Record<string, any>, logContext?: string): void {
    this.sendLog({
      level: 'info',
      message,
      metadata,
      context: logContext, // Renamed parameter for clarity
    });
  }
  
  warn(message: string, metadata?: Record<string, any>, logContext?: string): void {
    this.sendLog({
      level: 'warn',
      message,
      metadata,
      context: logContext,
    });
  }
  
  error(message: string, error?: Error | unknown, metadata?: Record<string, any>, logContext?: string): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    
    this.sendLog({
      level: 'error',
      message,
      metadata: {
        ...metadata,
        error: errorData,
      },
      context: logContext,
    });
  }
  
  debug(message: string, metadata?: Record<string, any>, logContext?: string): void {
    this.sendLog({
      level: 'debug',
      message,
      metadata,
      context: logContext,
    });
  }
}

export const clientLogger = new ClientLogger();