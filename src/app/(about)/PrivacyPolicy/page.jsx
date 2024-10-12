import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react"
import PrivacyPolicy from "./components/Privacy-Policy";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const PrivacyPolicyPage = () => {
  return (
    <SessionProvider>
      <div>
        <Header />
        <PrivacyPolicy />
        <Footer />
      </div>
    </SessionProvider>
  );
};

export default PrivacyPolicyPage;
