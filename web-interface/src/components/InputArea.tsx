import React, { useState, useRef, useEffect, FormEvent, KeyboardEvent, ChangeEvent, useContext } from 'react';
import { Paperclip, X, Plus } from 'lucide-react';
import { ChatContext } from '../ChatContext';
import { Attachment } from '../types';
import AddToChatPopover from './AddToChatPopover';

interface InputAreaProps {
  onSendMessage: (message: string, file?: File | null, attachments?: Attachment[]) => Promise<void>;
  isLoading: boolean;
  hasMessages: boolean;
  onStop?: () => void;
  sidebarCollapsed?: boolean;
  sidebarOpen?: boolean;
  isHomepage?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, hasMessages, onStop, sidebarCollapsed = false, sidebarOpen = false, isHomepage = false }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const { selectedTextContext, clearSelectedTextContext } = useContext(ChatContext);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });

  // Initialize contentEditable with placeholder on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent) {
      const placeholderText = isHomepage ? 'What do you want to know?' : (hasMessages ? 'Ask anything' : 'How can EyeQ help you today?');
      editorRef.current.innerHTML = `<p data-placeholder="${placeholderText}" class="placeholder" style="line-height: 1.5; display: inline-block; vertical-align: middle;"><br class="ProseMirror-trailingBreak" /></p>`;
    }
  }, [hasMessages, isHomepage]);

  // Prevent selection clearing from interfering with input focus
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If clicking on input area, prevent selection clearing
      if (target.closest('#prompt-textarea') || 
          target.closest('.ProseMirror') || 
          target.closest('[data-type="text"]')) {
        e.stopPropagation();
      }
    };

    // Use capture phase to catch events early
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);

  const handleSubmit = (e: FormEvent | KeyboardEvent) => {
    e.preventDefault();
    console.log('Submitting message:', message, 'File:', selectedFile);
    if ((!message.trim() && !selectedFile && !selectedTextContext) || isLoading) return;

    // Prepare attachments array if we have selected text context
    const attachments = selectedTextContext ? [{
      id: Date.now().toString(),
      type: 'text' as const,
      title: 'Selected text',
      content: selectedTextContext.text,
      sourceMessageId: selectedTextContext.sourceMessageId
    }] : undefined;

    // Include selected text context in message if available
    let messageToSend = message;
    if (selectedTextContext) {
      messageToSend = `[Context from previous message]\n"${selectedTextContext.text}"\n\n[User question]\n${message}`;
      clearSelectedTextContext();
    }

    // Pass attachments to onSendMessage - we'll need to update the signature
    onSendMessage(messageToSend, selectedFile, attachments);

    // Clear state first
    setMessage('');
    setSelectedFile(null);
    // Note: selectedTextContext is cleared in handleSubmit above

    // Then reset editor to initial placeholder state after state flush
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (editorRef.current) {
        const placeholderText = isHomepage ? 'What do you want to know?' : (hasMessages ? 'Ask anything' : 'How can EyeQ help you today?');
        editorRef.current.innerHTML = `<p data-placeholder="${placeholderText}" class="placeholder" style="line-height: 1.5; display: inline-block; vertical-align: middle;"><br class="ProseMirror-trailingBreak" /></p>`;
      }
    }, 0);
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    // Remove zero-width space and newlines
    const text = editorRef.current.innerText.replace(/\u200B/g, '').replace(/\n$/, '');
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
      const placeholderText = isHomepage ? 'What do you want to know?' : (hasMessages ? 'Ask anything' : 'How can EyeQ help you today?');
      editorRef.current.innerHTML = `<p data-placeholder="${placeholderText}" class="placeholder" style="line-height: 1.5; display: inline-block; vertical-align: middle;"><br class="ProseMirror-trailingBreak" /></p>`;
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
    : 'w-full max-w-4xl mx-auto px-6 transition-all duration-300 ease-in-out';

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

        {/* Grok-style Input Box */}
        <form onSubmit={handleSubmit} className="group/composer w-full" data-type="text">
          <div className={`${isHomepage ? 'bg-white dark:bg-[#2a2a2a] min-h-[44px] py-2 px-3' : 'bg-white dark:bg-[#40414f] py-1.5 px-2 min-h-[40px]'} cursor-text overflow-hidden bg-clip-padding contain-inline-size grid grid-cols-[auto_1fr_auto] items-center [grid-template-areas:'header_header_header'_'leading_primary_trailing'_'._footer_.'] group-data-expanded/composer:[grid-template-areas:'header_header_header'_'primary_primary_primary'_'leading_footer_trailing'] shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.3)] rounded-[24px] transition-all duration-200 ease-in-out focus-within:shadow-[0_0_0_3px_rgba(0,53,149,0.1),0_4px_12px_rgba(0,0,0,0.15)] dark:focus-within:shadow-[0_0_0_3px_rgba(0,53,149,0.2),0_4px_12px_rgba(0,0,0,0.4)]`}>
            
            {/* Primary Input Area */}
            <div className="flex flex-col overflow-x-hidden px-2 [grid-area:primary] group-data-expanded/composer:mb-0 group-data-expanded/composer:px-3 justify-center py-0">
              {/* Referenced Text Section - Grok style with separator line */}
              {selectedTextContext && (
                <>
                  <div className="flex items-start gap-2 px-2 py-2.5 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-token-text-secondary">
                        <path d="M2.94 2.94a1 1 0 0 1 1.02-.24l13.33 4.44a1 1 0 0 1 0 1.9L9.9 11.2a1 1 0 0 0-.7.7L7.04 17.29a1 1 0 0 1-1.9 0L.7 3.96a1 1 0 0 1 .24-1.02zm3.3 12.82l1.32-3.96a3 3 0 0 1 2.1-2.1l6.03-2-9.45-3.15 0 0 0 0L3.6 3.6l2.64 12.16z" fill="currentColor"></path>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-token-text-primary dark:text-token-text-primary leading-relaxed break-words">
                        {selectedTextContext.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded-md hover:bg-token-surface-hover dark:hover:bg-token-surface-hover transition-colors flex-shrink-0 mt-0.5"
                      onClick={clearSelectedTextContext}
                      title="Remove"
                      aria-label="Remove attachment"
                    >
                      <X size={14} className="text-token-text-secondary dark:text-token-text-secondary" />
                    </button>
                  </div>
                  {/* Thin separator line */}
                  <div className="w-full h-px bg-token-border-subtle dark:bg-token-border-subtle mx-2"></div>
                </>
              )}
              
              <div className={`_prosemirror-parent_1dsxi_2 text-gray-900 dark:text-[#ececf1] max-h-[max(35svh,5rem)] max-h-52 flex-1 overflow-auto [scrollbar-width:thin] default-browser vertical-scroll-fade-mask flex items-center min-h-[20px] py-0 px-0 ${selectedTextContext ? 'pt-2' : ''}`}>
                {/* Hidden textarea fallback to keep existing logic */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaChange}
                  placeholder={isHomepage ? 'What do you want to know?' : (hasMessages ? 'Ask anything' : 'How can EyeQ help you today?')}
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
                  onClick={(e) => {
                    // Ensure focus is maintained when clicking
                    e.stopPropagation();
                    if (editorRef.current) {
                      editorRef.current.focus();
                      // If empty, ensure cursor is visible by creating a text node
                      if (!editorRef.current.textContent || editorRef.current.textContent.trim() === '') {
                        // Remove placeholder and create empty text node for cursor
                        const range = document.createRange();
                        const sel = window.getSelection();
                        editorRef.current.innerHTML = '';
                        const textNode = document.createTextNode('\u200B'); // Zero-width space
                        editorRef.current.appendChild(textNode);
                        range.setStart(textNode, 0);
                        range.setEnd(textNode, 0);
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                      } else {
                        // Restore cursor position at end if there's text
                        const range = document.createRange();
                        const sel = window.getSelection();
                        if (sel && editorRef.current.childNodes.length > 0) {
                          range.selectNodeContents(editorRef.current);
                          range.collapse(false);
                          sel.removeAllRanges();
                          sel.addRange(range);
                        }
                      }
                    }
                  }}
                  onFocus={(e) => {
                    // Ensure cursor is visible when focused
                    e.stopPropagation();
                    if (editorRef.current && (!editorRef.current.textContent || editorRef.current.textContent.trim() === '')) {
                      // If empty when focused, create a zero-width space so cursor shows
                      const range = document.createRange();
                      const sel = window.getSelection();
                      if (editorRef.current.innerHTML.includes('data-placeholder') || editorRef.current.textContent === '') {
                        editorRef.current.innerHTML = '';
                        const textNode = document.createTextNode('\u200B'); // Zero-width space
                        editorRef.current.appendChild(textNode);
                        range.setStart(textNode, 0);
                        range.setEnd(textNode, 0);
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Leading Section - Add Button and File Upload */}
            <div className="flex items-center justify-center gap-1 [grid-area:leading] pr-1 self-center">
              {/* Circular Add Button */}
              <button
                ref={addButtonRef}
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2f2f2f] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add to chat"
                aria-haspopup="menu"
                aria-expanded={isAddMenuOpen}
                onClick={() => {
                  if (addButtonRef.current) {
                    const rect = addButtonRef.current.getBoundingClientRect();
                    setAddMenuPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                    setIsAddMenuOpen(!isAddMenuOpen);
                  }
                }}
                disabled={isLoading}
              >
                <Plus size={18} className="text-gray-600 dark:text-white" strokeWidth={2.5} />
              </button>
              
              {/* File Upload Button (hidden, triggered by Add menu) */}
              <button
                type="button"
                className="sr-only"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              />
            </div>
            
            {/* Add to Chat Popover */}
            <AddToChatPopover
              isOpen={isAddMenuOpen}
              onClose={() => setIsAddMenuOpen(false)}
              onSelectFile={() => {
                fileInputRef.current?.click();
                setIsAddMenuOpen(false);
              }}
              onSelectText={() => {
                // If there's selected text context, it will show as pill
                // Otherwise, this could trigger text selection mode
                setIsAddMenuOpen(false);
              }}
              position={addMenuPosition}
            />
            
            {/* Trailing Section - Action Buttons - Grok style */}
            <div className="flex items-center justify-center gap-2 [grid-area:trailing] pl-1 self-center">
              {isLoading ? (
                <button
                  type="button"
                  aria-label="Stop generation"
                  title="Stop"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 shadow-sm"
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
                  className={`flex h-8 w-8 items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    canSend 
                      ? 'rounded-full bg-[#003595] text-white hover:bg-[#1a4ba3] hover:scale-105 active:scale-95 focus-visible:ring-[#003595] shadow-sm' 
                      : 'rounded-lg bg-transparent text-gray-400 dark:text-[#8e8ea0] cursor-not-allowed opacity-40'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={canSend ? 'text-white' : 'text-gray-400 dark:text-[#8e8ea0]'}>
                    <path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="currentColor"/>
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

