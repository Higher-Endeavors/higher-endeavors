import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/app/lib/context/ToastContext';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function ResistanceTrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </SessionProvider>
  );
} 