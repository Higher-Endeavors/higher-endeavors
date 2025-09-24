import { auth } from "auth";
import { SessionProvider } from "next-auth/react";
import Header from "components/Header";
import Footer from "components/Footer";
import Guide from "(public)/guide-overview/components/Guide";

export default function GuidePage() {
  return (
    <SessionProvider>
      <div>
        <Header />
        <Guide />
        <Footer />
      </div>
    </SessionProvider>
  );
}
