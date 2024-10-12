import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import PerformanceTherapyPage from "./components/Performance-Therapy";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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
