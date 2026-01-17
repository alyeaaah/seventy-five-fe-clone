import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isiOS, setIsiOS] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    // Check if device is iOS
    const checkIfiOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      
      setIsiOS(isIOSDevice);
      
      // For iOS, show install button if not already installed
      if (isIOSDevice && !isStandalone && !isInWebAppiOS) {
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    checkIfInstalled();
    checkIfiOS();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    // For iOS, show instructions for manual installation
    if (isiOS) {
      // Show instructions for iOS users
      const message = `
        To install this app on your iOS device:
        1. Tap the Share button (square with arrow) at the bottom of Safari
        2. Scroll down and tap "Add to Home Screen"
        3. Tap "Add" to confirm
      `;
      alert(message.trim());
      return false; // Return false since it's manual installation
    }

    // For desktop browsers, try to use bookmark API if available
    if ((window as any).sidebar && (window as any).sidebar.addPanel) {
      // Firefox (<23)
      (window as any).sidebar.addPanel('75 Tennis Club', window.location.href, '');
      return true;
    } else if (window.external && ('AddFavorite' in (window as any).external)) {
      // Internet Explorer
      (window as any).external.AddFavorite(window.location.href, '75 Tennis Club');
      return true;
    } else if ((window as any).opera && typeof (window as any).opera === 'object') {
      // Opera
      return false; // Opera doesn't support programmatic bookmarking
    } else if (navigator.userAgent.includes('Chrome')) {
      // Chrome - show instructions
      const message = `
        To bookmark this page:
        1. Press Ctrl+D (Windows) or Cmd+D (Mac)
        2. or click the star icon in the address bar
      `;
      alert(message.trim());
      return false;
    }

    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isiOS,
    install
  };
};
