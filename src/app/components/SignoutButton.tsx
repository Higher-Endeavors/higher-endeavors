"use client"
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
      console.error('Failed to send error email:', error);
    }

    window.open(`https://auth.higherendeavors.com/logout?client_id=${cognitoClient}&logout_uri=${cognitoAuthUrl}`, "_self");
  }
  return (
    <button onClick={() => clickHandler()}>Sign Out</button>)
}