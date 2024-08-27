// src/components/HeroBanner.js
import Image from "next/image";
import heroImage from "/public/Mountain-Hiking.jpg";

const HeroBanner = () => {
  return (
    <section className="hero-banner">
      <Image priority src={heroImage} />
    </section>
  );
};

export default HeroBanner;
