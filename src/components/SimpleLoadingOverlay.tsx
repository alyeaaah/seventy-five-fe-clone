import { LottieAnimation } from "./LottieAnimation";
import loadingBounce from "@/assets/json/loading-bounce.json";
import loadingBounceWhite from "@/assets/json/loading-bounce-w.json";
import { useState, useEffect } from "react";

interface SimpleLoadingOverlayProps {
  show: boolean;
}

export const SimpleLoadingOverlay = ({ show }: SimpleLoadingOverlayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const loadingTexts = ["Warming up...", "Ready...", "Set...", "Match!"];

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [show]);

  useEffect(() => {
    // Check for dark mode preference
    const checkDarkMode = () => {
      const isDark =
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => mediaQuery.removeEventListener('change', checkDarkMode);
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-[#084930]' : 'bg-white'}`}>
      <div className="flex flex-col items-center space-y-2">
        <div className="h-12 w-16 sm:w-20 max-w-[80px]">
          <LottieAnimation
            animationData={isDarkMode ? loadingBounceWhite : loadingBounce}
            loop={true}
            autoplay={true}
          />
        </div>

        <div className="h-4 overflow-hidden">
          <div
            className={`font-medium transition-transform duration-300 ease-out ${isDarkMode ? 'text-gray-100' : 'text-[#084930]'}`}
            style={{ transform: `translateY(-${currentIndex * 16}px)` }}
          >
            {loadingTexts.map((text, index) => (
              <div key={index} className="h-4 flex items-center justify-center">
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
