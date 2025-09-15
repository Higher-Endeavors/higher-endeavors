import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { UserSettingsProvider } from './context/UserSettingsContext';
import { getUserSettings } from './lib/actions/userSettings';
import { getServerEnvironment } from './lib/utils/serverEnvironment';
import GoogleAnalytics from './components/GoogleAnalytics';
import { ErrorBoundary } from '@/app/components/error-boundary.client'
import { ToastProvider } from './lib/toast';


export const metadata: Metadata = {
  title: "Higher Endeavors",
  description: "Facilitating your ideal life",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSettings = await getUserSettings();
  const environment = await getServerEnvironment();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Determine environment class for styling
  const environmentClass = environment === 'qa' ? 'qa-environment' : 
                          environment === 'development' ? 'dev-environment' : '';

  return (
    <html suppressHydrationWarning={true} className={environmentClass}>
      <head>
        <ThemeModeScript />
        <link rel="stylesheet" href="https://use.typekit.net/pvb4enq.css" />
      </head>
      <body>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <ErrorBoundary>
            <UserSettingsProvider userSettings={userSettings}>
              <ToastProvider>
                {children}
              </ToastProvider>
            </UserSettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
