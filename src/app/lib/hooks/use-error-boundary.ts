import { useEffect } from 'react';
import { clientLogger } from 'lib/logging/logger.client';

export function useErrorBoundary() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      clientLogger.error('Uncaught error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, 'error-boundary');
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      clientLogger.error('Unhandled promise rejection', event.reason, {}, 'error-boundary');
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}