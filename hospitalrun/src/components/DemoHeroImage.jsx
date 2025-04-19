import { useEffect, useState } from 'react';
import './animations.css'; // Import animation styles

export default function HeroImage({ images, overlayTexts }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => {
        const next = (prev + 1) % overlayTexts.length;
        setFadeKey(next);
        return next;
      });
    }, 3000); // Change text every 3 seconds

    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
    };
  }, [images, overlayTexts]);

  return (
    <div className="relative w-full h-96">
      <img
        src={images[currentImageIndex]}
        alt="Gallery Example"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 p-4">
        <h2
          key={fadeKey}
          className="text-white text-xl md:text-3xl font-bold drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] fade-slide-up"
        >
          {overlayTexts[currentTextIndex]}
        </h2>
      </div>
    </div>
  );
}
