import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { UserSettingsProvider } from './context/UserSettingsContext';
import { getUserSettings } from './lib/actions/userSettings';
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
  return (
    <html suppressHydrationWarning={true}>
      <head>
        <ThemeModeScript />
        <link rel="stylesheet" href="https://use.typekit.net/pvb4enq.css" />
      </head>
      <body >
        <ErrorBoundary>
          <UserSettingsProvider userSettings={userSettings}>
            {children}
          </UserSettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
