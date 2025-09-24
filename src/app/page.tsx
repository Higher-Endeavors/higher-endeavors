// Home/ Landing page 

import React from 'react';
import { auth } from 'auth';
import { SessionProvider } from "next-auth/react"

import Header from 'components/Header.jsx';
import HeroBanner from 'components/HeroBanner.jsx';
import MissionStatement from 'components/MissionStatement.jsx';
import Promotion from 'components/Promotion.jsx';
import Footer from 'components/Footer.jsx';
import Services from 'components/Services.jsx';
import Pillars from 'components/Pillars';
import Continuum from 'components/Continuum';

export default async function Home() {

  return (
    <SessionProvider>
      <div className="App">
        <Header />
        <HeroBanner />
        <MissionStatement />
        <Promotion />
        <Services />
        <Pillars />
        <Continuum />
        <Footer />
      </div>
    </SessionProvider>
  );
}
