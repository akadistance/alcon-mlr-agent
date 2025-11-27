import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartTour: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onRestartTour }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      question: 'What is EyeQ?',
      answer: 'EyeQ is an AI-powered assistant designed to help with MLR (Medical, Legal, and Regulatory) compliance and regulatory analysis. It can review promotional materials, check compliance, and provide regulatory guidance.'
    },
    {
      question: 'How do I upload documents?',
      answer: 'Click the paperclip icon in the input area to attach files. EyeQ supports text files, Word documents, PDFs, PowerPoint presentations, and images. Maximum file size is 10MB.'
    },
    {
      question: 'What types of analysis can EyeQ perform?',
      answer: 'EyeQ can check MLR compliance, rewrite content for regulatory approval, detect promotional risks, verify safety statements, and answer follow-up questions about your materials.'
    },
    {
      question: 'How do I start a new conversation?',
      answer: 'Click the "Chat" button in the sidebar or use the keyboard shortcut Ctrl+J (Cmd+J on Mac). You can also click the "+" icon in the sidebar to create a new conversation.'
    },
    {
      question: 'Can I search my previous conversations?',
      answer: 'Yes! Use the search bar in the sidebar (Ctrl+K or Cmd+K) to search through your conversation history by title or content.'
    },
    {
      question: 'How accurate is EyeQ\'s analysis?',
      answer: 'EyeQ uses advanced AI to provide compliance guidance, but it\'s important to review all suggestions with your MLR team. EyeQ can make mistakes, so always verify important information.'
    },
    {
      question: 'What should I do if something isn\'t working?',
      answer: 'If you encounter any issues or bugs, please use the Feedback option in Settings to report the problem. Your feedback helps us improve EyeQ.'
    },
    {
      question: 'Can I export my conversations?',
      answer: 'Yes, you can export conversations for your records. Look for the export option in the conversation menu (three dots) next to each conversation in the sidebar.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-[#003595] max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-[#003595] dark:text-white">
            Help & FAQ
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close help"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Restart Tour Section */}
          <div className="mb-6 p-4 bg-[#003595]/10 dark:bg-[#003595]/20 rounded-lg border border-[#003595]/30">
            <div className="flex items-start gap-3">
              <RotateCcw size={20} className="text-[#003595] dark:text-white mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#003595] dark:text-white mb-1">
                  New to EyeQ?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Take a guided tour to learn about all the features and how to use EyeQ effectively.
                </p>
                <button
                  onClick={() => {
                    onRestartTour();
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#003595] hover:bg-[#002a7a] text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Restart Tour
                </button>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#003595] dark:text-white mb-4">
              Frequently Asked Questions
            </h3>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#003595]/50 transition-colors"
              >
                <h4 className="text-base font-semibold text-[#003595] dark:text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Need more help? Use the Feedback option in Settings to contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

