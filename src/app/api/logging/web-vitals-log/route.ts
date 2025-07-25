// pages/api/log-web-vitals.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serverLogger } from '@/app/lib/logging/logger.server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle both JSON payload and raw body for robustness
    const metric = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    serverLogger.info({ webVital: metric }, 'Received web-vital metric');
    res.status(200).end('Logged');
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
