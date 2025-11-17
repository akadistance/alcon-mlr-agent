import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, FileText, Copy, Check, RefreshCw, Share2, Download, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Analysis } from '../types';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onShare?: (message: Message) => void;
  onExport?: (format: string) => void;
  editable?: boolean;
  onEdit?: (newText: string) => void;
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
  onEdit
}) => {
  const { type, content, analysis, file, isLoading, isError, isStreaming } = message;
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content || '');
  const editRef = useRef<HTMLTextAreaElement>(null);
  
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

  // Auto-resize the textarea up to a max height, then enable scroll
  useEffect(() => {
    if (isEditing && editRef.current) {
      const el = editRef.current;
      el.style.height = 'auto';
      const maxHeight = 220; // px
      const newHeight = Math.min(el.scrollHeight, maxHeight);
      el.style.height = newHeight + 'px';
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [isEditing, editValue]);

  if (isLoading) {
    return (
      <div className="flex w-full justify-start">
        <div className="max-w-3xl w-full p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-alcon-blue to-alcon-blue/80 rounded-full animate-pulse-dot"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-alcon-blue to-alcon-blue/80 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-alcon-blue to-alcon-blue/80 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary font-medium">EyeQ is analyzing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full group ${isError ? 'opacity-75' : ''}`}
    >
      <div className={`flex w-full flex-wrap ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
        
        <div className={`
          transition-all duration-300
          ${type === 'user' 
            ? 'inline-flex max-w-[65%] rounded-2xl shadow-chatgpt hover:shadow-chatgpt-lg bg-[#003595] text-white border border-[#003595] hover:scale-[1.02] hover:shadow-xl animate-message-in' 
            : 'max-w-4xl w-full text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary animate-message-in'}
          ${isError ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : ''}
        `}>
        <div className={`${type === 'user' ? 'px-3 py-2' : 'p-3 sm:p-4'} space-y-2 sm:space-y-3`}>
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
                    className="w-full bg-[#002870] text-white rounded-lg p-3 border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent focus:outline-none resize-none text-sm leading-relaxed min-h-[80px]"
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
              <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
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
                className="p-2.5 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors" 
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy'}
                aria-label="Copy message"
              >
                {copied ? <Check size={16} className="text-alcon-blue" /> : <Copy size={16} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />}
              </button>
              
              {isLast && onRegenerate && (
                <button 
                  className="p-2.5 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors" 
                  onClick={onRegenerate}
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RefreshCw size={16} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              )}

              {onShare && (
                <button
                  className="p-2.5 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors"
                  onClick={() => onShare(message)}
                  title="Share conversation"
                  aria-label="Share conversation"
                >
                  <Share2 size={16} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              )}

              {onExport && (
                <button
                  className="p-2.5 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors"
                  onClick={() => onExport('markdown')}
                  title="Export conversation"
                  aria-label="Export conversation"
                >
                  <Download size={16} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User edit button row under the bubble */}
      {type === 'user' && !isEditing && (
        <div className="basis-full flex justify-end mt-2">
          <button
            className="p-2.5 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors"
            onClick={startEdit}
            title="Edit message"
            aria-label="Edit message"
          >
            <Pencil size={16} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
          </button>
        </div>
      )}
      
      </div>
    </div>
  );
};

export default MessageBubble;

