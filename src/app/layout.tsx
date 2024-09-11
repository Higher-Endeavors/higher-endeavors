import type { Metadata } from "next";
import ClientLayout from './ClientLayout'
import { UserProvider } from './contexts/UserProvider';
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
    <html lang="en">
      <body className="font-newzen">
        <UserProvider>
          <ClientLayout>{children}</ClientLayout>
        </UserProvider>
      </body>
    </html>
  );
}
