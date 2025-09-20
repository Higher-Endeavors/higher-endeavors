import { auth } from "auth";
import { SessionProvider } from "next-auth/react";
import AboutUs from "(public)/about-us/components/AboutUs";
import Header from "components/Header";
import Footer from "components/Footer";

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
