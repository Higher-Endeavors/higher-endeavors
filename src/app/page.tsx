import React from 'react';

import Header from './components/Header.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import MissionStatement from './components/MissionStatement.jsx';
import Footer from './components/Footer.jsx';

export default function Home() {

  return (
    <div className="App">
    <Header />
    <HeroBanner />
    <MissionStatement />
    <Footer />
  </div>
  );
}