import { SessionProvider } from 'next-auth/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AccessRedirectContent from './components/AccessRedirectContent';
import { Suspense } from 'react';

export const metadata = {
  title: 'Authentication Required',
  description: 'Please log in to access this content',
}

export default function AccessRedirectPage() {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Suspense>
            <AccessRedirectContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  )
} 