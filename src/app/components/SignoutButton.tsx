"use client"
import { signOut } from 'next-auth/react';
import { clientLogger } from 'lib/logging/logger.client';

export function SignOut() {
  const cognitoClient = process.env.NEXT_PUBLIC_COGNITO_CLIENT
  const cognitoAuthUrl = process.env.NEXT_PUBLIC_COGNITO_AUTH_URL
  async function clickHandler() {

    try {
      await fetch('/api/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'plain/text' },
      });
    } catch (error) {
      clientLogger.error('Error signing out', error);
      // Handle sign out error
    }

    window.open(`https://auth.higherendeavors.com/logout?client_id=${cognitoClient}&logout_uri=${cognitoAuthUrl}`, "_self");
  }
  return (
    <button onClick={() => clickHandler()}>Sign Out</button>)
}