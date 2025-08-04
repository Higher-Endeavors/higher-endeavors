import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { UserSettingsProvider } from './context/UserSettingsContext';
import { getUserSettings } from './lib/actions/userSettings';
import GoogleAnalytics from './components/GoogleAnalytics';
import { ErrorBoundary } from '@/app/components/error-boundary.client'


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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
  return (
    <html suppressHydrationWarning={true}>
      <head>
        <ThemeModeScript />
        <link rel="stylesheet" href="https://use.typekit.net/pvb4enq.css" />
      </head>
      <body >
        <ErrorBoundary>
          {gaId && <GoogleAnalytics gaId={gaId} />}
        <UserSettingsProvider userSettings={userSettings}>
            {children}
          </UserSettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
