import React from "react";
import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import Tools from "./components/Tools";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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
