import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Guide from "./components/Guide";

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
