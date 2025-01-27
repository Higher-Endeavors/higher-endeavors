"use client"

// src/components/HeroBanner.js
import { useState, useEffect } from "react";
import Image from "next/image";

// Import banner images
import nutritionImage from "/public/Nutrition-1.webp";
import fitnessImage from "/public/Fitness-1.webp";
import healthImage from "/public/Health-1.webp";
import lifeImage from "/public/Life-1.webp";

const bannerImages = [
  {
    src: lifeImage,
    alt: "Life and Wellness",
    title: "Live Your Best Life",
    description: "Embrace the journey of self-discovery and personal growth"
  },
  {
    src: healthImage,
    alt: "Health and Wellness",
    title: "Optimize Your Health",
    description: "Create lasting vitality through holistic health practices"
  },
  {
    src: nutritionImage,
    alt: "Nutrition and Wellness",
    title: "Nourish Your Body",
    description: "Discover the power of mindful nutrition and balanced living"
  },
  {
    src: fitnessImage,
    alt: "Fitness Training",
    title: "Train for Life",
    description: "Build strength, resilience, and capability through purposeful training"
  }
];

const HeroBanner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % bannerImages.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Manual navigation
  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <section className="relative w-full h-[60vh] overflow-hidden">
      {bannerImages.map((image, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            className={`object-cover ${
              image.src === lifeImage 
                ? "object-[70%_center] sm:object-center" 
                : "object-center"
            }`}
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30">
            <div className="container mx-auto h-full flex flex-col justify-center items-center text-white px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
                {image.title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-center max-w-3xl">
                {image.description}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentImageIndex
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
