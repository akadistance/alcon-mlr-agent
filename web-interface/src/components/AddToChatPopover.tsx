import React, { useRef, useEffect } from 'react';
import { FileText, MessageSquare } from 'lucide-react';

interface AddToChatPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: () => void;
  onSelectText: () => void;
  position: { x: number; y: number };
}

const AddToChatPopover: React.FC<AddToChatPopoverProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  onSelectText,
  position
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#4B5563] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] animate-fade-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px'
      }}
    >
      <div className="py-1">
        <button
          onClick={() => {
            onSelectFile();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] dark:hover:bg-[#374151] transition-colors text-left"
        >
          <FileText size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          <span className="text-sm text-[#1F2937] dark:text-[#F9FAFB]">File</span>
        </button>
        <button
          onClick={() => {
            onSelectText();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] dark:hover:bg-[#374151] transition-colors text-left"
        >
          <MessageSquare size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          <span className="text-sm text-[#1F2937] dark:text-[#F9FAFB]">Selected text</span>
        </button>
      </div>
    </div>
  );
};

export default AddToChatPopover;

