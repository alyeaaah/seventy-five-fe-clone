import { useEffect, useState } from 'react';

interface RouteLoadingOverlayProps {
  isLoading?: boolean;
}

export const RouteLoadingOverlay = ({ isLoading = false }: RouteLoadingOverlayProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    console.log('RouteLoadingOverlay isLoading:', isLoading);
    if (isLoading) {
      setShowOverlay(true);
      setIsFadingOut(false);
    } else {
      // Start fade out animation
      setIsFadingOut(true);
      // Remove overlay after animation completes
      const timer = setTimeout(() => {
        setShowOverlay(false);
        setIsFadingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!showOverlay) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
        <div className="text-emerald-800 font-medium">Loading...</div>
      </div>
    </div>
  );
};
