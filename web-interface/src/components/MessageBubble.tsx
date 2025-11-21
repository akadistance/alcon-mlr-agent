import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, FileText, Copy, Check, RefreshCw, Share2, Download, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Analysis } from '../types';
import FloatingAddToChatButton from './FloatingAddToChatButton';
import { ChatContext } from '../ChatContext';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onShare?: (message: Message) => void;
  onExport?: (format: string) => void;
  editable?: boolean;
  onEdit?: (newText: string) => void;
  isLastUserMessage?: boolean;
}

interface ParsedContent {
  mainContent: string;
  referencesText: string | null;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLast,
  onRegenerate,
  onShare,
  onExport,
  onEdit,
  isLastUserMessage = false
}) => {
  const { type, content, analysis, file, isLoading, isError, isStreaming } = message;
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content || '');
  const editRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const selectedTextRef = useRef<string>('');
  const { setSelectedTextContext } = React.useContext(ChatContext);
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedTextRef.current = selectedText;
  }, [selectedText]);
  
  // Parse content to separate main text from references section
  const parseContentAndReferences = (text: string): ParsedContent => {
    if (!text) return { mainContent: '', referencesText: null };
    
    // Check for References section
    const referencesMatch = text.match(/(?:^|\n)(References?:[\s\S]*)$/i);
    
    if (referencesMatch) {
      const mainContent = text.substring(0, referencesMatch.index!).trim();
      const referencesText = referencesMatch[1];
      return { mainContent, referencesText };
    }
    
    return { mainContent: text, referencesText: null };
  };
  
  const { mainContent } = type === 'assistant' 
    ? parseContentAndReferences(content) 
    : { mainContent: content };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderAnalysis = (analysis: Analysis) => {
    if (!analysis) return null;

    return (
      <div className="mt-4 space-y-3">
        {analysis.summary && (
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Summary</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.summary}</p>
          </div>
        )}

        {analysis.approved_claims && analysis.approved_claims.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-2 text-green-900 dark:text-green-300">
              <CheckCircle size={16} /> Approved Claims
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              {analysis.approved_claims.map((claim, index) => (
                <li key={index} className="text-sm text-green-800 dark:text-green-200">{claim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const startEdit = () => {
    if (type !== 'user') return;
    setEditValue(content || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(content || '');
  };

  const saveEdit = () => {
    if (onEdit && typeof onEdit === 'function') {
      onEdit(editValue);
    }
    setIsEditing(false);
  };

  // Set initial height when editing starts
  useEffect(() => {
    if (isEditing && editRef.current) {
      // Set cursor to end of text
      editRef.current.focus();
      editRef.current.selectionStart = editRef.current.value.length;
      editRef.current.selectionEnd = editRef.current.value.length;
    }
  }, [isEditing]);

  // Handle text selection for "Add to Chat" feature
  useEffect(() => {
    if (type !== 'assistant' || isLoading || isError) return;

    let savedRange: Range | null = null;
    let restoreInterval: NodeJS.Timeout | null = null;
    let selectionStartContainer: Node | null = null;
    let selectionStartOffset: number = 0;
    let selectionEndContainer: Node | null = null;
    let selectionEndOffset: number = 0;

    const handleMouseUp = (e: MouseEvent) => {
      // Check if this is within our message bubble
      const target = e.target as HTMLElement;
      if (!messageRef.current || !messageRef.current.contains(target)) {
        return;
      }

      // Capture selection IMMEDIATELY and synchronously before anything else can clear it
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedTextValue = selection.toString().trim();
      
      // Only show button if selection is meaningful (more than 10 chars)
      if (selectedTextValue.length < 10) {
        return;
      }

      // Check if selection is within this message bubble
      if (!messageRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      // Save range details for restoration
      try {
        savedRange = range.cloneRange();
        selectionStartContainer = range.startContainer;
        selectionStartOffset = range.startOffset;
        selectionEndContainer = range.endContainer;
        selectionEndOffset = range.endOffset;
      } catch (err) {
        console.warn('Failed to save range:', err);
        return;
      }

      // Store the selected text and position IMMEDIATELY
      setSelectedText(selectedTextValue);

      // Get selection position
      const rect = range.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });

      // Clear any existing interval
      if (restoreInterval) {
        clearInterval(restoreInterval);
        restoreInterval = null;
      }

      // Function to restore selection
      const preserveSelection = () => {
        if (!selectedTextRef.current) return;
        
        try {
          const currentSelection = window.getSelection();
          if (!currentSelection) return;
          
          // Check if selection is already there
          if (currentSelection.rangeCount > 0) {
            const currentRange = currentSelection.getRangeAt(0);
            const currentText = currentRange.toString().trim();
            // If selection matches, keep it
            if (currentText === selectedTextRef.current) {
              return;
            }
          }
          
          // Try to restore using saved range first
          if (savedRange) {
            try {
              currentSelection.removeAllRanges();
              currentSelection.addRange(savedRange.cloneRange());
              return;
            } catch (err) {
              // Range might be invalid, try recreating from offsets
            }
          }
          
          // Fallback: try to recreate from saved offsets
          if (selectionStartContainer && selectionEndContainer) {
            try {
              const newRange = document.createRange();
              newRange.setStart(selectionStartContainer, selectionStartOffset);
              newRange.setEnd(selectionEndContainer, selectionEndOffset);
              currentSelection.removeAllRanges();
              currentSelection.addRange(newRange);
            } catch (err) {
              // Containers might be invalid, ignore
            }
          }
        } catch (err) {
          // Ignore errors
        }
      };

      // Try to preserve immediately multiple times
      setTimeout(preserveSelection, 0);
      setTimeout(preserveSelection, 10);
      setTimeout(preserveSelection, 50);
      setTimeout(preserveSelection, 100);

      // Keep restoring selection periodically until button is clicked
      restoreInterval = setInterval(() => {
        // Check if we still have selectedText state using ref (more reliable)
        if (!selectedTextRef.current) {
          if (restoreInterval) {
            clearInterval(restoreInterval);
            restoreInterval = null;
          }
          savedRange = null;
          return;
        }
        
        preserveSelection();
      }, 100); // Check frequently to maintain highlight
    };

    // Listen for clicks outside to clear selection (with delay to avoid immediate clearing)
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't clear if clicking on the button itself
      if (target.closest('.floating-add-to-chat-button')) {
        return;
      }
      
      // Don't clear if clicking within the message bubble
      if (messageRef.current && messageRef.current.contains(target)) {
        return;
      }

      // Don't clear if clicking on the input area (contentEditable or its container)
      if (target.closest('#prompt-textarea') || 
          target.closest('.ProseMirror') || 
          target.closest('[data-type="text"]') ||
          target.closest('form[data-type="text"]')) {
        return;
      }

      // Delay clearing to avoid interfering with selection
      setTimeout(() => {
        const currentSelection = window.getSelection();
        if (currentSelection) {
          // Only clear if the selection is not in the input area
          const activeElement = document.activeElement;
          const isInputFocused = activeElement?.closest('#prompt-textarea') || 
                                 activeElement?.closest('.ProseMirror') ||
                                 activeElement?.closest('[data-type="text"]');
          
          if (!isInputFocused) {
            currentSelection.removeAllRanges();
          }
        }
        setSelectedText('');
        setSelectionPosition(null);
      }, 50);
    };

    // Use capture phase to catch mouseup early
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      if (restoreInterval) {
        clearInterval(restoreInterval);
      }
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [type, isLoading, isError, selectedText]);

  const handleAddToChat = () => {
    if (selectedText) {
      setSelectedTextContext({
        text: selectedText,
        sourceMessageId: message.id
      });
      // Clear selection and state AFTER adding to chat
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
      setSelectedText('');
      setSelectionPosition(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full justify-start animate-message-in">
        <div className="max-w-3xl w-full p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-[#003595] to-[#1a4ba3] rounded-full animate-typing-dot"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-[#003595] to-[#1a4ba3] rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-[#003595] to-[#1a4ba3] rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-base text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary font-medium">EyeQ is analyzing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messageRef}
      className={`w-full group ${isError ? 'opacity-75' : ''}`}
    >
      <div className={`flex w-full flex-wrap ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
        
        <div className={`
          transition-all duration-300
          ${type === 'user' 
            ? 'inline-flex max-w-[85%] rounded-2xl bg-gradient-to-br from-[#003595] to-[#1a4ba3] text-white shadow-lg shadow-[#003595]/20 hover:shadow-xl hover:shadow-[#003595]/30 hover:scale-[1.01] animate-message-in' 
            : 'max-w-3xl w-full text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary animate-message-in'}
          ${isError ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : ''}
        `}>
        <div className={`${type === 'user' ? 'px-4 py-3' : 'p-4 sm:p-5'} space-y-2 sm:space-y-3`}>
          {/* Render attachments as clean cards (ChatGPT style) - Only for user messages */}
          {type === 'user' && message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2 mb-2">
              {message.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="inline-flex flex-col p-3 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#4B5563] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-w-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {attachment.type === 'text' ? (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6B7280] dark:text-[#9CA3AF]">
                          <path d="M2.94 2.94a1 1 0 0 1 1.02-.24l13.33 4.44a1 1 0 0 1 0 1.9L9.9 11.2a1 1 0 0 0-.7.7L7.04 17.29a1 1 0 0 1-1.9 0L.7 3.96a1 1 0 0 1 .24-1.02zm3.3 12.82l1.32-3.96a3 3 0 0 1 2.1-2.1l6.03-2-9.45-3.15 0 0 0 0L3.6 3.6l2.64 12.16z" fill="currentColor"></path>
                        </svg>
                      ) : attachment.type === 'file' ? (
                        <FileText size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      ) : (
                        <FileText size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      )}
                    </div>
                    <span className="text-[15px] font-medium text-[#1F2937] dark:text-[#F9FAFB]">
                      {attachment.title}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                    Attachment
                  </span>
                </div>
              ))}
            </div>
          )}

          {file && (
            <div className={`flex items-center gap-3 text-sm p-3 rounded-2xl ${
              type === 'user' 
                ? 'bg-white/20 text-white' 
                : 'bg-chatgpt-bg-secondary dark:bg-chatgpt-dark-bg-secondary'
            }`}>
              <div className={`p-1.5 rounded-lg ${type === 'user' ? 'bg-white/20' : 'bg-alcon-blue/10'}`}>
                <FileText size={16} className={type === 'user' ? 'text-white' : 'text-alcon-blue'} />
              </div>
              <span className={`font-medium ${type === 'user' ? 'text-white' : 'text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary'}`}>Uploaded: {file.name}</span>
            </div>
          )}

          <div className={`${isEditing && type === 'user' ? 'space-y-2' : ''}`}>
            {type === 'user' ? (
              isEditing ? (
                <div className="space-y-2">
                  <textarea
                    ref={editRef}
                    className="w-full bg-[#002870] text-white rounded-lg p-3 border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent focus:outline-none resize-none text-sm leading-relaxed overflow-y-auto"
                    style={{ minHeight: '100px', maxHeight: '200px' }}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-3 py-1.5 rounded-lg bg-white text-[#003595] hover:bg-white/90 transition-colors text-sm font-medium"
                      onClick={saveEdit}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || ''}
                  </ReactMarkdown>
                </div>
              )
            ) : (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none text-base leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 select-text"
                style={{ userSelect: 'text', WebkitUserSelect: 'text', lineHeight: '1.7' }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {mainContent || ''}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {isStreaming && type === 'assistant' && (
            <span className="inline-block w-2 h-5 bg-chatgpt-text-primary dark:bg-chatgpt-dark-text-primary animate-pulse-subtle ml-1">▋</span>
          )}

          {analysis && renderAnalysis(analysis)}

          {/* Action buttons for assistant messages - under the message */}
          {type === 'assistant' && !isLoading && !isError && (
            <div className="flex gap-2">
              <button 
                className="p-3 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy'}
                aria-label="Copy message"
              >
                {copied ? <Check size={18} className="text-alcon-blue" /> : <Copy size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />}
              </button>
              
              {isLast && onRegenerate && (
                <button 
                  className="p-3 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
                  onClick={onRegenerate}
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RefreshCw size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              )}

              {onShare && (
                <button
                  className="p-3 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => onShare(message)}
                  title="Share conversation"
                  aria-label="Share conversation"
                >
                  <Share2 size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              )}

              {onExport && (
                <button
                  className="p-3 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => onExport('markdown')}
                  title="Export conversation"
                  aria-label="Export conversation"
                >
                  <Download size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User action buttons row under the bubble */}
      {type === 'user' && !isEditing && (
        <div className="basis-full flex justify-end gap-2 mt-2">
          <button
            className="p-3 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy'}
            aria-label="Copy message"
          >
            {copied ? <Check size={18} className="text-alcon-blue" /> : <Copy size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />}
          </button>
          {isLastUserMessage && (
            <button
              className="p-3 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={startEdit}
              title="Edit message"
              aria-label="Edit message"
            >
              <Pencil size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
            </button>
          )}
        </div>
      )}
      
      </div>

      {/* Floating "Add to Chat" button */}
      {selectedText && selectionPosition && type === 'assistant' && !isLoading && !isError && (
        <FloatingAddToChatButton
          position={selectionPosition}
          onAddToChat={handleAddToChat}
        />
      )}
    </div>
  );
};

export default MessageBubble;

