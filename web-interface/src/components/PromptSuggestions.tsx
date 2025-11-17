import React from 'react';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
}

const PROMPTS = [
  "Analyze this promotional text for FDA/FTC compliance",
  "Check if these claims are approved for Clareon PanOptix IOL",
  "Review this marketing material for regulatory issues"
];

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt, isLoading }) => {
  const handleClick = (prompt: string) => {
    if (!isLoading) {
      onSelectPrompt(prompt);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 mt-4 mb-4">
      <div className="flex gap-2 justify-center items-center">
        {PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleClick(prompt)}
            disabled={isLoading}
            className={`
              relative px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 ease-in-out
              border-2 border-chatgpt-border dark:border-chatgpt-dark-border
              bg-chatgpt-bg-secondary dark:bg-chatgpt-dark-bg-secondary
              text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary
              hover:bg-chatgpt-bg-tertiary dark:hover:bg-chatgpt-dark-bg-tertiary
              hover:border-alcon-blue dark:hover:border-alcon-blue
              hover:shadow-chatgpt
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              animate-slide-up animate-prompt-glow
            `}
            style={{ 
              animationDelay: `${index * 50}ms, ${index * 0.5}s`
            }}
            aria-label={`Use prompt: ${prompt}`}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;

