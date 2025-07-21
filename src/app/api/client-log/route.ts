import { NextRequest, NextResponse } from 'next/server';
import { serverLogger } from '@/app/lib/logging/server-logger';
import { ClientLogEntrySchema, ClientLogEntry } from '@/app/lib/types/logging';
import { z } from 'zod';

// Response schemas
const SuccessResponseSchema = z.object({
  success: z.literal(true),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json();
    const validatedLogEntry = ClientLogEntrySchema.parse(body);
    
    // Log client-side log entry through server logger
    const metadata = {
      source: 'client' as const,
      clientTimestamp: validatedLogEntry.timestamp,
      context: validatedLogEntry.context,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      ...validatedLogEntry.metadata,
    };
    
    // Log based on level
    switch (validatedLogEntry.level) {
      case 'info':
        serverLogger.info(`[CLIENT] ${validatedLogEntry.message}`, metadata);
        break;
      case 'warn':
        serverLogger.warn(`[CLIENT] ${validatedLogEntry.message}`, metadata);
        break;
      case 'error':
        serverLogger.error(`[CLIENT] ${validatedLogEntry.message}`, undefined, metadata);
        break;
      case 'debug':
        serverLogger.debug(`[CLIENT] ${validatedLogEntry.message}`, metadata);
        break;
    }
    
    const response: z.infer<typeof SuccessResponseSchema> = { success: true };
    return NextResponse.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      serverLogger.warn('Invalid client log entry received', {
        validationErrors: error.errors,
        ip: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
      });
      
      const response: z.infer<typeof ErrorResponseSchema> = {
        error: 'Invalid log entry format',
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    if (error instanceof SyntaxError) {
      serverLogger.warn('Invalid JSON in client log request', {
        error: error.message,
        ip: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
      });
      
      const response: z.infer<typeof ErrorResponseSchema> = {
        error: 'Invalid JSON format',
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    serverLogger.error('Failed to process client log', error, {
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
    });
    
    const response: z.infer<typeof ErrorResponseSchema> = {
      error: 'Internal server error',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}