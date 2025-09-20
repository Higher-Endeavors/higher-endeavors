import { auth } from "auth";
import { SessionProvider } from "next-auth/react"
import PrivacyPolicy from "(public)/privacy-policy/components/Privacy-Policy";
import Header from "components/Header";
import Footer from "components/Footer";

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
