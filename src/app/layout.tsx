import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { UserSettingsProvider } from './context/UserSettingsContext';
import { getUserSettings } from './lib/actions/userSettings';
import { ErrorBoundary } from '@/app/components/error-boundary.client'
import { WebVitalsProvider } from './components/web-vitals-provider';
import { WebVitalsErrorBoundary } from './components/web-vitals-error-boundary';
import { webVitalsConfig } from './lib/web-vitals/web-vitals-config';


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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
        <link rel="stylesheet" href="https://use.typekit.net/pvb4enq.css" />
      </head>
      <body className="">
        {/* Wrap Web Vitals in error boundary */}
        {webVitalsConfig.enabled && (
          <WebVitalsErrorBoundary>
            <WebVitalsProvider config={webVitalsConfig} />
          </WebVitalsErrorBoundary>
        )}

        <ErrorBoundary>
          <UserSettingsProvider userSettings={userSettings}>
            {children}
          </UserSettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
