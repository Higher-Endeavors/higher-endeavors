import { z } from 'zod';

// Zod schema for client log entries
export const ClientLogEntrySchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']),
  message: z.string().min(1).max(1000),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  context: z.string().max(100).optional(),
  source: z.literal('client').optional(),
});

// TypeScript types derived from Zod schemas
export type ClientLogEntry = z.infer<typeof ClientLogEntrySchema>;

export interface RequestContext {
  requestId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}