import { auth } from "auth";
import { SessionProvider } from "next-auth/react";
import PerformanceTherapyPage from "(public)/services/PerformanceTherapy/components/Performance-Therapy";
import Header from "components/Header";
import Footer from "components/Footer";

export default function PerformanceTherapy() {
  return (
    <SessionProvider>
      <div>
        <Header />
        <PerformanceTherapyPage />
        <Footer />
      </div>
    </SessionProvider>
  );
}
