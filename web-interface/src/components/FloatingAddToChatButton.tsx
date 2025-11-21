import React, { useEffect, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface FloatingAddToChatButtonProps {
  position: { x: number; y: number };
  onAddToChat: () => void;
}

const FloatingAddToChatButton: React.FC<FloatingAddToChatButtonProps> = ({
  position,
  onAddToChat
}) => {
  const [buttonPosition, setButtonPosition] = useState(position);

  // Update position when selection changes
  useEffect(() => {
    setButtonPosition(position);
  }, [position]);

  // Note: Click outside handling is done in MessageBubble to preserve selection

  return (
    <div
      className="floating-add-to-chat-button fixed z-50 animate-fade-in"
      style={{
        left: `${buttonPosition.x}px`,
        top: `${buttonPosition.y - 50}px`, // Position above the selection
        transform: 'translateX(-50%)'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToChat();
        }}
        className="flex items-center gap-2 px-3 py-2 bg-chatgpt-bg dark:bg-chatgpt-dark-bg border border-chatgpt-border dark:border-chatgpt-dark-border rounded-xl shadow-chatgpt-lg hover:shadow-chatgpt-xl transition-all duration-200 hover:scale-105 group"
        title="Add to chat"
        aria-label="Add selected text to chat"
      >
        <MessageSquarePlus 
          size={16} 
          className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary group-hover:text-alcon-blue transition-colors" 
        />
        <span className="text-sm font-medium text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary">
          Add to Chat
        </span>
      </button>
    </div>
  );
};

export default FloatingAddToChatButton;

