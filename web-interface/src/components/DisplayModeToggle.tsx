/**
 * Display Mode Toggle Component
 * Allows users to switch between compact, expanded, and fullscreen modes
 */

import React from 'react';
import { Maximize2, Minimize2, Square } from 'lucide-react';
import { DisplayMode } from '../hooks/useDisplayMode';

interface DisplayModeToggleProps {
  displayMode: DisplayMode;
  onToggle: () => void;
  className?: string;
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
  displayMode,
  onToggle,
  className = '',
}) => {
  const Icon = displayMode === 'compact' 
    ? Square 
    : displayMode === 'expanded' 
      ? Maximize2 
      : Minimize2;

  const label = displayMode === 'compact'
    ? 'Expand'
    : displayMode === 'expanded'
      ? 'Fullscreen'
      : 'Compact';

  return (
    <button
      onClick={onToggle}
      aria-label={label}
      className={`
        p-2 rounded-lg
        hover:bg-gray-100 dark:hover:bg-zinc-800
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      title={label}
    >
      <Icon size={20} className="text-gray-700 dark:text-gray-300" />
    </button>
  );
};

