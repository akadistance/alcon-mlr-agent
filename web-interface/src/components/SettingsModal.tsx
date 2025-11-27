import React, { useContext, useState } from 'react';
import { ThemeContext } from '../ThemeContext';
import { ChatContext } from '../ChatContext';
import { X, Moon, Sun, Download, Trash2, Send } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { conversations, clearAllConversations } = useContext(ChatContext);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'other'>('bug');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleClearAllChats = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      clearAllConversations();
    }
  };

  const handleExportChats = () => {
    const data = JSON.stringify(conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eyeq-chats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    // In a real application, this would send to a backend API
    // For now, we'll just show a confirmation
    const feedbackData = {
      type: feedbackType,
      message: feedbackText,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      version: '2.0.0'
    };

    console.log('Feedback submitted:', feedbackData);
    
    // Show success message
    setFeedbackSubmitted(true);
    setFeedbackText('');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 z-[1000] transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0f1113] backdrop-blur-xl border border-[#003595]/10 dark:border-white/10 rounded-2xl w-[420px] max-w-[90vw] max-h-[80vh] overflow-y-auto relative shadow-2xl transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0 border-b border-[#003595]/10 dark:border-white/10 mb-4 bg-gradient-to-br from-[#003595]/5 to-transparent">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#003595] to-[#0079c1] bg-clip-text text-transparent dark:text-gray-100 m-0 font-['Poppins',sans-serif]">
            Settings
          </h2>
          <button 
            className="bg-transparent border-none text-slate-500 dark:text-slate-400 p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100" 
            onClick={onClose} 
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          {/* Appearance Section */}
          <div className="mb-6 last:mb-0">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
              Appearance
            </h3>
            <div className="flex items-center justify-between mb-3 py-2">
              <div className="flex items-center gap-3 font-medium text-slate-900 dark:text-slate-100 text-[0.95rem]">
                <span className="text-[#003595] dark:text-[#0079c1] flex items-center">
                  {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </span>
                <span>Theme</span>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5">
                <button 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-none cursor-pointer text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    !isDarkMode 
                      ? 'bg-[#003595] text-white shadow-md' 
                      : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => isDarkMode && toggleDarkMode()}
                >
                  <Sun size={14} className={!isDarkMode ? 'text-white' : 'text-slate-600 dark:text-slate-300'} />
                  Light
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-none cursor-pointer text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isDarkMode 
                      ? 'bg-[#003595] text-white shadow-md' 
                      : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => !isDarkMode && toggleDarkMode()}
                >
                  <Moon size={14} className={isDarkMode ? 'text-white' : 'text-slate-600 dark:text-slate-300'} />
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="mb-6 last:mb-0">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
              Data Management
            </h3>
            <div className="mb-2">
              <button 
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 mb-2 bg-[#003595] text-white shadow-lg hover:bg-[#002a7a] hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0" 
                onClick={handleExportChats}
              >
                <Download size={18} />
                Export Chat History
              </button>
            </div>
            <div className="mb-2">
              <button 
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 mb-2 bg-red-500 text-white shadow-lg hover:bg-red-600 hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0" 
                onClick={handleClearAllChats}
              >
                <Trash2 size={18} />
                Clear All Chats
              </button>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mb-6 last:mb-0">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
              Feedback & Support
            </h3>
            {feedbackSubmitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                  ✓ Thank you! Your feedback has been submitted.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Feedback Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFeedbackType('bug')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        feedbackType === 'bug'
                          ? 'bg-[#003595] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Bug Report
                    </button>
                    <button
                      onClick={() => setFeedbackType('suggestion')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        feedbackType === 'suggestion'
                          ? 'bg-[#003595] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Suggestion
                    </button>
                    <button
                      onClick={() => setFeedbackType('other')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        feedbackType === 'other'
                          ? 'bg-[#003595] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Other
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={`Describe the ${feedbackType === 'bug' ? 'issue' : feedbackType === 'suggestion' ? 'suggestion' : 'feedback'}...`}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003595] focus:border-transparent"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleSubmitFeedback}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 bg-[#003595] text-white shadow-lg hover:bg-[#002a7a] hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0"
                >
                  <Send size={18} />
                  Submit Feedback
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Help us improve EyeQ by reporting issues or sharing your ideas
                </p>
              </>
            )}
          </div>

          {/* About Section */}
          <div className="mb-6 last:mb-0">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
              About EyeQ
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-[#003595]/10 dark:border-white/10">
              <p className="my-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed first:mt-0 last:mb-0">
                <strong className="text-slate-900 dark:text-slate-100 font-semibold">Version:</strong> 2.0.0
              </p>
              <p className="my-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed first:mt-0 last:mb-0">
                <strong className="text-slate-900 dark:text-slate-100 font-semibold">Developer:</strong> Jason Jiwan
              </p>
              <p className="my-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed first:mt-0 last:mb-0">
                <strong className="text-slate-900 dark:text-slate-100 font-semibold">Purpose:</strong> AI-powered ophthalmic compliance analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

