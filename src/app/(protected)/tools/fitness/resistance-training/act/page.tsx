import { auth } from 'auth';
import { SessionProvider } from 'next-auth/react';
import ResistanceTrainingActClient from './components/ResistanceTrainingActClient';

export default async function ResistanceTrainingActPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  return (
    <SessionProvider>
      <ResistanceTrainingActClient userId={loggedInUserId} />
    </SessionProvider>
  );
}
