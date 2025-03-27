// src/app/lib/utils/grant-adapter.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationCode } from 'simple-oauth2';
import grant from 'grant';
import session from 'express-session';

// Create a session middleware adapter for Next.js
const createSessionAdapter = (req: NextRequest, res: NextResponse) => {
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  });
  
  return new Promise((resolve, reject) => {
    sessionMiddleware(req, res, (err) => {
      if (err) reject(err);
      resolve(req.session);
    });
  });
};

// Create a Grant adapter for Next.js API routes
export const grantAdapter = async (
  req: NextRequest, 
  res: NextResponse, 
  config: any
) => {
  // Set up session
  await createSessionAdapter(req, res);
  
  // Initialize Grant with the provided config
  const grantInstance = grant.express()(config);
  
  // Run the grant middleware
  return new Promise((resolve, reject) => {
    grantInstance(req, res, (err) => {
      if (err) reject(err);
      resolve(req.session.grant);
    });
  });
};