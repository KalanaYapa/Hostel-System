"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselSlide {
  title: string;
  description: string;
  image: string;
}

const slides: CarouselSlide[] = [
  {
    title: "Welcome to SUSL Hostel",
    description: "Experience modern living with world-class facilities at Sabaragamuwa University's premier student accommodation.",
    image: "/carosel1.webp",
  },
  {
    title: "Smart Room Management",
    description: "Easily manage your room allocation, track availability, and request room changes through our intuitive portal.",
    image: "/carosel2.jpg",
  },
  {
    title: "24/7 Maintenance Support",
    description: "Submit maintenance requests instantly and track their status in real-time for a hassle-free hostel experience.",
    image: "/carosel3.jpg",
  },
  {
    title: "Online Fee Payment",
    description: "Pay your hostel fees securely online and keep track of all your payment history in one place.",
    image: "/carosel4.jpg",
  },
  {
    title: "Digital Attendance",
    description: "Mark your daily attendance digitally and monitor your attendance records throughout the semester.",
    image: "/carosel5.webp",
  },
];

export default function AuthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Full Screen Image Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
          {/* Subtle dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
        {/* University Branding - Top */}
        <div className="text-white z-10">
          <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">SUSL</h3>
          <p className="text-base md:text-lg drop-shadow-lg">Hostel Management</p>
        </div>

        {/* Text Content - Bottom */}
        <div className="z-10 mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 max-w-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-lg">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-10 h-3 bg-white"
                  : "w-3 h-3 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
