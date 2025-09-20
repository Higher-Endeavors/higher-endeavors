import React from "react";
import { auth } from "auth";
import { SessionProvider } from "next-auth/react";
import Tools from "(public)/tools/components/Tools";
import Header from "components/Header";
import Footer from "components/Footer";

const ToolsPage = () => {
  return (
    <SessionProvider>
      <div>
        <Header />
        <Tools />
        <Footer />
      </div>
    </SessionProvider>
  );
};

export default ToolsPage;
