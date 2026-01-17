import React from 'react';
import { Button, message } from 'antd';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isiOS, install } = usePWAInstall();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      message.success('App installed successfully!');
    } else if (isiOS) {
      message.info('Follow the instructions to add to home screen');
    } else {
      message.info('Follow the instructions to bookmark the page');
    }
  };

  if (isInstalled) {
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        type="primary"
        size="large"
        icon={isiOS ? <Smartphone className="w-5 h-5" /> : <Download className="w-5 h-5" />}
        onClick={handleInstall}
        className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 py-3 flex items-center gap-2"
      >
        <span className="hidden sm:inline font-medium">
          {isiOS ? 'Add to Home Screen' : 'Bookmark App'}
        </span>
        <Smartphone className="w-5 h-5 sm:hidden" />
      </Button>
    </div>
  );
};

export default PWAInstallButton;
