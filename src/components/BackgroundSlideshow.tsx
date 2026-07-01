'use client';

import { useState, useEffect } from "react";

const images = [
  "/images/gym-bg-1.jpg",
  "/images/gym-bg-2.jpg",
  "/images/gym-bg-3.jpg",
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}
    </>
  );
}
