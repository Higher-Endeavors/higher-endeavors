import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";


export const metadata: Metadata = {
  title: "Higher Endeavors",
  description: "Facilitating your ideal life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
        <link rel="stylesheet" href="https://use.typekit.net/pvb4enq.css" />
      </head>
      <body className="">
        {children}
      </body>
    </html>
  );
}
