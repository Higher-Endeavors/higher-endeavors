import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { UserSettingsProvider } from './context/UserSettingsContext';
import { getUserSettings } from './lib/actions/userSettings';


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
        <UserSettingsProvider userSettings={userSettings}>
          {children}
        </UserSettingsProvider>
      </body>
    </html>
  );
}
