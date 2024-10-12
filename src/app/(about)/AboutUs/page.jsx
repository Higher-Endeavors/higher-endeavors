import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import AboutUs from "./components/AboutUs";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function AboutUsPage() {
  return (
    <SessionProvider>
      <div>
        <Header />
        <AboutUs />
        <Footer />
      </div>
    </SessionProvider>
  );
}
