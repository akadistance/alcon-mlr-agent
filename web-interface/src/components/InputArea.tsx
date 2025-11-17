import React, { useState, useRef, useEffect, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { Paperclip, X } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string, file?: File | null) => Promise<void>;
  isLoading: boolean;
  hasMessages: boolean;
  onStop?: () => void;
  sidebarCollapsed?: boolean;
  sidebarOpen?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, hasMessages, onStop, sidebarCollapsed = false, sidebarOpen = false }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize contentEditable with placeholder on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent) {
      const placeholderText = hasMessages ? 'Ask anything' : 'How can EyeQ help you today?';
      editorRef.current.innerHTML = `<p data-placeholder="${placeholderText}" class="placeholder"><br class="ProseMirror-trailingBreak" /></p>`;
    }
  }, [hasMessages]);

  const handleSubmit = (e: FormEvent | KeyboardEvent) => {
    e.preventDefault();
    console.log('Submitting message:', message, 'File:', selectedFile);
    if ((!message.trim() && !selectedFile) || isLoading) return;

    onSendMessage(message, selectedFile);

    // Clear state first
    setMessage('');
    setSelectedFile(null);

    // Then reset editor to initial placeholder state after state flush
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (editorRef.current) {
        const placeholderText = hasMessages ? 'Ask anything' : 'How can EyeQ help you today?';
        editorRef.current.innerHTML = `<p data-placeholder="${placeholderText}" class="placeholder"><br class="ProseMirror-trailingBreak" /></p>`;
      }
    }, 0);
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.replace(/\n$/, '');
    setMessage(text);

    // If user started typing over the placeholder, replace with plain text and set caret
    const placeholder = editorRef.current.querySelector('.placeholder');
    if (text && placeholder && placeholder.parentNode === editorRef.current) {
      const textNode = document.createTextNode(text);
      editorRef.current.innerHTML = '';
      editorRef.current.appendChild(textNode);
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(editorRef.current.childNodes[0], text.length);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    // If emptied, restore placeholder
    if (!text && !editorRef.current.querySelector('.placeholder')) {
      const placeholderText = hasMessages ? 'Ask anything' : 'How can EyeQ help you today?';
      editorRef.current.innerHTML = `<p data-placeholder="${placeholderText}" class="placeholder"><br class="ProseMirror-trailingBreak" /></p>`;
    }
  };

  const handleEditorKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Textarea change:', e.target.value);
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (.txt, .docx, .pptx, .pdf, or images for OCR)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSend = (!!message.trim() || !!selectedFile) && !isLoading;

  // Conditional layout classes for Claude-like transition
  // On desktop (lg:), sidebar is static (w-16 or w-64) so we need matching left offset
  // On mobile, sidebar is fixed, so we need left offset only when sidebar is open
  const containerClass = hasMessages
    ? `fixed bottom-0 right-0 z-20 transition-all duration-300 ease-in-out ${
        // Desktop: sidebar is static, always account for its width
        // Mobile: only offset if sidebar is open
        sidebarCollapsed 
          ? sidebarOpen
            ? 'left-16 lg:left-16' // 64px when collapsed (both mobile when open and desktop)
            : 'left-0 lg:left-16' // 0 on mobile when closed, 64px on desktop
          : sidebarOpen
            ? 'left-64 lg:left-64' // 256px when expanded (both mobile when open and desktop)
            : 'left-0 lg:left-64' // 0 on mobile when closed, 256px on desktop
      }`
    : 'w-full transition-all duration-300 ease-in-out';

  const wrapperClass = hasMessages
    ? 'w-full max-w-4xl mx-auto px-6 pb-4 transition-all duration-300 ease-in-out'
    : 'w-full max-w-2xl mx-auto px-4 transition-all duration-300 ease-in-out';

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        {/* File attachment preview */}
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                <Paperclip size={14} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={removeFile}
              title="Remove file"
              aria-label="Remove file"
            >
              <X size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}

        {/* ChatGPT-style Input Box */}
        <form onSubmit={handleSubmit} className="group/composer w-full" data-type="text">
          <div className="bg-token-bg-primary cursor-text overflow-hidden bg-clip-padding p-3 min-h-[52px] contain-inline-size dark:bg-[#40414f] grid grid-cols-[auto_1fr_auto] [grid-template-areas:'header_header_header'_'leading_primary_trailing'_'._footer_.'] group-data-expanded/composer:[grid-template-areas:'header_header_header'_'primary_primary_primary'_'leading_footer_trailing'] shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.3)] rounded-2xl transition-all duration-200 ease-in-out focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15)] dark:focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.4)]">
            
            {/* Primary Input Area */}
            <div className="flex items-center overflow-x-hidden px-2 [grid-area:primary] group-data-expanded/composer:mb-0 group-data-expanded/composer:px-2.5">
              <div className="_prosemirror-parent_1dsxi_2 text-token-text-primary max-h-[max(35svh,5rem)] max-h-52 flex-1 overflow-auto [scrollbar-width:thin] default-browser vertical-scroll-fade-mask">
                {/* Hidden textarea fallback to keep existing logic */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaChange}
                  placeholder={hasMessages ? 'Ask anything' : 'How can EyeQ help you today?'}
                  className="sr-only"
                  disabled={isLoading}
                  rows={1}
                />
                {/* Visible ProseMirror-style contentEditable */}
                <div
                  ref={editorRef}
                  contentEditable={!isLoading}
                  translate="no"
                  className="ProseMirror"
                  id="prompt-textarea"
                  data-virtualkeyboard="true"
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                />
              </div>
            </div>
            
            {/* Leading Section - File Upload Button */}
            <div className="flex items-center [grid-area:leading] pr-1">
              <button
                type="button"
                className="composer-btn flex items-center justify-center w-8 h-8 rounded-lg hover:bg-token-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="composer-plus-btn"
                aria-label="Add files and more"
                id="composer-plus-btn"
                aria-haspopup="menu"
                aria-expanded="false"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-token-text-secondary">
                  <path d="M9.33496 16.5V10.665H3.5C3.13273 10.665 2.83496 10.3673 2.83496 10C2.83496 9.63273 3.13273 9.33496 3.5 9.33496H9.33496V3.5C9.33496 3.13273 9.63273 2.83496 10 2.83496C10.3673 2.83496 10.665 3.13273 10.665 3.5V9.33496H16.5L16.6338 9.34863C16.9369 9.41057 17.165 9.67857 17.165 10C17.165 10.3214 16.9369 10.5894 16.6338 10.6514L16.5 10.665H10.665V16.5C10.665 16.8673 10.3673 17.165 10 17.165C9.63273 17.165 9.33496 16.8673 9.33496 16.5Z" fill="currentColor"></path>
                </svg>
              </button>
            </div>
            
            {/* Trailing Section - Action Buttons */}
            <div className="flex items-center gap-1 [grid-area:trailing] pl-1">
              {isLoading ? (
                <button
                  type="button"
                  aria-label="Stop generation"
                  title="Stop"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-all hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={() => onStop?.()}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="10" height="10" rx="1"></rect>
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Send message"
                  title="Send"
                  disabled={!canSend}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    canSend 
                      ? 'bg-token-accent text-white hover:bg-token-accent-hover focus-visible:ring-token-accent shadow-sm' 
                      : 'bg-transparent text-token-text-tertiary cursor-not-allowed opacity-40'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={canSend ? 'text-white' : 'text-token-text-tertiary'}>
                    <path d="M2.94 2.94a1 1 0 0 1 1.02-.24l13.33 4.44a1 1 0 0 1 0 1.9L9.9 11.2a1 1 0 0 0-.7.7L7.04 17.29a1 1 0 0 1-1.9 0L.7 3.96a1 1 0 0 1 .24-1.02zm3.3 12.82l1.32-3.96a3 3 0 0 1 2.1-2.1l6.03-2-9.45-3.15 0 0 0 0L3.6 3.6l2.64 12.16z"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          id="upload-photos"
          accept=".txt,.docx,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp"
          multiple
          type="file"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
        <input className="sr-only" tabIndex={-1} aria-hidden="true" id="upload-camera" accept="image/*" capture="environment" multiple type="file" />

        {/* Disclaimer Footer */}
        <div className="text-token-text-secondary relative mt-1 flex min-h-6 w-full items-center justify-center p-1 text-center text-[10px] [view-transition-name:var(--vt-disclaimer)] md:px-[60px] transition-all duration-300 ease-in-out">
          <div className="pointer-events-auto">EyeQ can make mistakes. Check important info.</div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;

