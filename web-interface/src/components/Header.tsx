import React, { useState, useRef } from 'react';
import { HelpCircle, Menu, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';

// Header component - sidebar toggle moved to sidebar itself

interface HeaderProps {
  onToggleSidebar: () => void;
  onStartTour?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onStartTour }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const settingsRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="h-14 bg-chatgpt-bg dark:bg-chatgpt-dark-bg sticky top-0 z-50 transition-colors duration-200">
        <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center" 
              onClick={onToggleSidebar}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="text-gray-700 dark:text-chatgpt-dark-text-primary" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button 
              data-tour="help-button"
              className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
              title="Help & FAQ"
              aria-label="Help & FAQ"
              onClick={() => setIsHelpOpen(true)}
            >
              <HelpCircle size={18} className="text-gray-700 dark:text-chatgpt-dark-text-primary" />
            </button>
            <button 
              data-tour="settings-button"
              ref={settingsRef}
              className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
              title="Settings" 
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Settings"
            >
              <Settings size={18} className="text-gray-700 dark:text-chatgpt-dark-text-primary" />
            </button>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        onRestartTour={() => {
          setIsHelpOpen(false);
          onStartTour?.();
        }}
      />
    </>
  );
};

export default Header;

