import React, { useState, useRef } from 'react';
import { HelpCircle, Menu, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

// Header component - sidebar toggle moved to sidebar itself

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="h-14 border-b border-chatgpt-border dark:border-chatgpt-dark-border bg-chatgpt-bg dark:bg-chatgpt-dark-bg sticky top-0 z-50 transition-colors duration-200">
        <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center" 
              onClick={onToggleSidebar}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-[color:var(--alcon-primary)]">
                EyeQ
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
              title="Help"
              aria-label="Help"
            >
              <HelpCircle size={18} className="text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary" />
            </button>
            <button 
              ref={settingsRef}
              className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
              title="Settings" 
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Settings"
            >
              <Settings size={18} className="text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary" />
            </button>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Header;

