import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '@/app/lib/types/logging';

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
}