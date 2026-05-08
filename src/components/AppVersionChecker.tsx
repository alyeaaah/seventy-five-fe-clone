import React, { useEffect, useState } from 'react';
import { clientEnv } from '../env';

interface VersionCheckerProps {
  children?: React.ReactNode;
}

export const AppVersionChecker: React.FC<VersionCheckerProps> = ({ children }) => {
  const [currentVersion, setCurrentVersion] = useState<string>(clientEnv.VERSION);
  const [storedVersion, setStoredVersion] = useState<string>('');
  const [versionMismatch, setVersionMismatch] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      // Get stored version from localStorage
      const stored = localStorage.getItem('app_version');
      setStoredVersion(stored || '');

      // Fetch latest version from backend config API
      let backendVersion: string | null = null;
      try {
        const response = await fetch(`${clientEnv.API_BASE_URL}/config/app_version`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add auth headers if needed
            'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          backendVersion = data.data?.value || data.value;
        }
      } catch (error) {
        console.warn('Failed to fetch version from backend:', error);
        // Continue with client version if backend fetch fails
      }

      // Determine the latest version to use
      const latestVersion = backendVersion || clientEnv.VERSION;
      setCurrentVersion(latestVersion);

      // Check for version mismatches
      const clientMismatch = clientEnv.VERSION !== stored;
      const backendMismatch = backendVersion && backendVersion !== stored;
      const hasMismatch = clientEnv.VERSION < (backendVersion || '');
      if (hasMismatch && !!backendVersion) {
        // Version mismatch detected
        setVersionMismatch(true);
        handleVersionMismatch(clientEnv.VERSION, latestVersion);
      } else {
        // No mismatch or first time loading
        // localStorage.setItem('app_version', latestVersion);
        // setVersionMismatch(false);
      }
    } catch (error) {
      console.error('Error checking version:', error);
      // Fallback to client version if anything fails
      localStorage.setItem('app_version', clientEnv.VERSION);
      setCurrentVersion(clientEnv.VERSION);
      setVersionMismatch(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleVersionMismatch = (oldVersion: string, newVersion: string) => {
    console.log(`Version mismatch detected: ${oldVersion} -> ${newVersion}`);

    // Clear all cached data
    clearCacheAndStorage();

    // Force reload with cache busting

    const url = new URL(window.location.href);
    url.searchParams.set('rlt', Date.now().toString());
    if (window.location.search.search('rlt') === -1) {
      window.location.href = url.toString();
    }
    // window.location.href = url.toString();
    // forceReloadWithCacheBusting();
  };

  const clearCacheAndStorage = () => {
    try {
      // Clear service worker cache if available
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        });
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
      return;

      // Clear localStorage except for essential items
      const essentialKeys = ['auth_token', 'user_preferences', 'theme'];
      const keysToKeep = new Set(essentialKeys);

      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.has(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const forceReloadWithCacheBusting = () => {
    // Add cache-busting parameter to force reload
    const timestamp = Date.now();
    const url = new URL(window.location.href);
    url.searchParams.set('v', timestamp.toString());

    // Force reload with new URL
    window.location.href = url.toString();
  };

  const handleManualReload = () => {
    handleVersionMismatch(clientEnv.VERSION, currentVersion);
  };

  // if (isChecking) {
  //   return (
  //     <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Checking application version...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (versionMismatch) {
  //   return (
  //     <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 border border-gray-200">
  //         <div className="text-center mb-6">
  //           <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
  //             <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //             </svg>
  //           </div>
  //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Update Available</h2>
  //           <p className="text-gray-600 mb-4">
  //             The application has been updated from version <span className="font-semibold">{storedVersion}</span> to <span className="font-semibold">{currentVersion}</span>
  //           </p>
  //           <p className="text-sm text-gray-500 mb-6">
  //             We need to clear your browser cache and reload the application to apply the update.
  //           </p>
  //         </div>

  //         <div className="space-y-3">
  //           <button
  //             onClick={handleManualReload}
  //             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
  //           >
  //             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //             </svg>
  //             Update & Reload
  //           </button>

  //           <button
  //             onClick={() => {
  //               // User chose to skip update - store current version to avoid showing again
  //               localStorage.setItem('app_version', currentVersion);
  //               setVersionMismatch(false);
  //             }}
  //             className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
  //           >
  //             Skip This Update
  //           </button>
  //         </div>

  //         <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  //           <div className="flex items-start gap-2">
  //             <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
  //             </svg>
  //             <div className="text-sm text-yellow-800">
  //               <p className="font-medium mb-1">What happens when you update?</p>
  //               <ul className="text-xs space-y-1 text-left">
  //                 <li>• Clears browser cache and stored data</li>
  //                 <li>• Loads the latest version with all improvements</li>
  //                 <li>• Ensures compatibility with new features</li>
  //               </ul>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
};

// Hook for manual version checking
export const useVersionCheck = () => {
  const [currentVersion] = useState<string>(clientEnv.VERSION);

  const checkForUpdates = () => {
    const storedVersion = localStorage.getItem('app_version');

    if (storedVersion && storedVersion !== currentVersion) {
      // Clear cache and force reload
      clearCacheAndStorage();
      // forceReloadWithCacheBusting();
      return true; // Update available
    }

    return false; // No update needed
  };

  const clearCacheAndStorage = () => {
    try {

      // Clear service worker cache if available
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        });
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
      return;
      // Clear localStorage except for essential items
      const essentialKeys = ['auth_token', 'user_preferences', 'theme'];
      const keysToKeep = new Set(essentialKeys);

      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.has(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const forceReloadWithCacheBusting = () => {
    // Add cache-busting parameter to force reload
    const timestamp = Date.now();
    const url = new URL(window.location.href);
    url.searchParams.set('v', timestamp.toString());

    // Force reload with new URL
    window.location.href = url.toString();
  };

  const forceVersionCheck = () => {
    localStorage.removeItem('app_version');
    window.location.reload();
  };

  return {
    currentVersion,
    checkForUpdates,
    forceVersionCheck
  };
};

export default AppVersionChecker;
