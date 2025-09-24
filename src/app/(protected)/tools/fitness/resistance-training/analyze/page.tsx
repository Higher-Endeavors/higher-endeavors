import { auth } from 'auth';
import { SessionProvider } from 'next-auth/react';
import ResistanceTrainingAnalyzeClient from '(protected)/tools/fitness/resistance-training/analyze/components/ResistanceTrainingAnalyzeClient';

export default async function ResistanceTrainingAnalyzePage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  return (
    <SessionProvider>
      <ResistanceTrainingAnalyzeClient userId={loggedInUserId} />
    </SessionProvider>
  );
}
