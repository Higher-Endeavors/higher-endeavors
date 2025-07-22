import { ClientLogEntry, ClientLogEntrySchema } from '@/app/lib/types/logging';

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
      console.error('Invalid log entry format:', error);
      return;
    }
    
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });
    
    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/client-log', blob);
    } else {
      // Fallback for older browsers
      fetch('/api/client-log', {
        method: 'POST',
        body: blob,
        keepalive: true,
      }).catch((error) => {
        // Silent fail - logging shouldn't break the app
        console.warn('Failed to send log to server:', error);
      });
    }
  }
  
  info(message: string, metadata?: Record<string, any>, context?: string): void {
    this.sendLog({
      level: 'info',
      message,
      metadata,
      context,
    });
  }
  
  warn(message: string, metadata?: Record<string, any>, context?: string): void {
    this.sendLog({
      level: 'warn',
      message,
      metadata,
      context,
    });
  }
  
  error(message: string, error?: Error | unknown, metadata?: Record<string, any>, context?: string): void {
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
      context,
    });
  }
  
  debug(message: string, metadata?: Record<string, any>, context?: string): void {
    this.sendLog({
      level: 'debug',
      message,
      metadata,
      context,
    });
  }
}

export const clientLogger = new ClientLogger();