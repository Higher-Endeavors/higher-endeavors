import { NextRequest } from 'next/server';
import { requestContext } from './request-context';
import { RequestContext } from '@/app/lib/types/logging';

export function withRequestContext<T extends any[], R>(
  handler: (...args: T) => R,
  getContextFromRequest: (req: NextRequest) => RequestContext
) {
  return (...args: T): R => {
    const req = args.find(arg => arg && typeof arg === 'object' && 'headers' in arg) as NextRequest;
    
    if (req) {
      const context = getContextFromRequest(req);
      return requestContext.run(context, () => handler(...args));
    }
    
    return handler(...args);
  };
}

// Helper to extract context from request
export function extractRequestContext(req: NextRequest): RequestContext {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const userId = req.headers.get('x-user-id') || undefined;
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return { requestId, userId, ip, userAgent };
}