import React, { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { ArrowUp, Paperclip, Square, X } from 'lucide-react';
import './InputArea.css';

interface InputAreaProps {
  onSendMessage: (message: string, file?: File | null) => Promise<void>;
  isLoading: boolean;
  hasMessages: boolean;
  onStop?: () => void;
  sidebarCollapsed?: boolean;
  sidebarOpen?: boolean;
  isHomepage?: boolean;
}

const ALLOWED_FILE_TYPES = [
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading,
  hasMessages,
  onStop,
  sidebarCollapsed = false,
  sidebarOpen: _sidebarOpen = false,
  isHomepage = false
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const next = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${next}px`;
    }
  }, [message]);

  const resetInput = () => {
    setMessage('');
    setSelectedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((!message.trim() && !selectedFile) || isLoading) {
      return;
    }
    await onSendMessage(message.trim(), selectedFile);
    resetInput();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Please select a valid file type (.txt, .docx, .pptx, .pdf, or supported images).');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSend = (!!message.trim() || !!selectedFile) && !isLoading;
  const wrapperClassName = hasMessages 
    ? `chatgpt-input-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}` 
    : 'chatgpt-input-wrapper chatgpt-input-wrapper--standalone';

  return (
    <div className={wrapperClassName}>
      <div className="chatgpt-input-container">
        {selectedFile && (
          <div className="chatgpt-file-preview" aria-live="polite">
            <span>{selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)} KB</span>
            <button type="button" onClick={handleRemoveFile} aria-label="Remove attached file">
              <X size={16} />
            </button>
          </div>
        )}
        <form className="chatgpt-input-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHomepage ? 'Ask EyeQ anything…' : (hasMessages ? 'Message EyeQ…' : 'How can EyeQ help you today?')}
            rows={1}
            className="chatgpt-input-textarea"
            aria-label="Message input"
            disabled={isLoading}
          />
          <div className="chatgpt-input-actions">
            <button
              type="button"
              className="chatgpt-attach-btn"
              aria-label="Attach a file"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip size={16} />
            </button>
            {isLoading ? (
              <button
                type="button"
                className="chatgpt-stop-btn"
                aria-label="Stop response"
                onClick={() => onStop?.()}
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="chatgpt-send-btn"
                aria-label="Send message"
                disabled={!canSend}
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp"
          onChange={handleFileChange}
          className="chatgpt-hidden-input"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <div className="chatgpt-input-footer">EyeQ can make mistakes. Check important info.</div>
    </div>
  );
};

export default InputArea;
