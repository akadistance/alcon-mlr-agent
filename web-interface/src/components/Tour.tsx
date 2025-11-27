import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TourStep {
  id: string;
  target: string; // CSS selector or data-tour attribute
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before showing step
}

interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
}

const Tour: React.FC<TourProps> = ({ steps, isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, arrow: 'bottom' as 'top' | 'bottom' | 'left' | 'right' });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Reset to first step when tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    // Remove previous highlights
    const previousHighlights = document.querySelectorAll('[data-tour-highlight]');
    previousHighlights.forEach(el => {
      const element = el as HTMLElement;
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.removeAttribute('data-tour-highlight');
    });

    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;

      const targetElement = document.querySelector(step.target) as HTMLElement;
      if (!targetElement) {
        // If element not found, center the tooltip
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          arrow: 'bottom'
        });
        return;
      }

      // Highlight target element (skip for welcome step)
      if (step.id !== 'welcome') {
        targetElement.setAttribute('data-tour-highlight', 'true');
        targetElement.style.outline = '3px solid #003595';
        targetElement.style.outlineOffset = '4px';
        targetElement.style.zIndex = '9998';
        targetElement.style.position = 'relative';
      }
      
      // Scroll into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current?.offsetWidth || 320;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
      const spacing = 20;
      const arrowSize = 10;

      let top = 0;
      let left = 0;
      let arrow: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

      // Determine position based on step preference or auto-calculate
      const preferredPosition = step.position || 'bottom';

      switch (preferredPosition) {
        case 'top':
          top = rect.top - tooltipHeight - spacing - arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = 'bottom';
          break;
        case 'bottom':
          top = rect.bottom + spacing + arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = 'top';
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - spacing - arrowSize;
          arrow = 'right';
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + spacing + arrowSize;
          arrow = 'left';
          break;
        case 'center':
          top = window.innerHeight / 2 - tooltipHeight / 2;
          left = window.innerWidth / 2 - tooltipWidth / 2;
          arrow = 'bottom';
          break;
      }

      // Keep tooltip within viewport
      const padding = 20;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

      setPosition({ top, left, arrow });
    };

    // Execute action if provided
    if (steps[currentStep]?.action) {
      steps[currentStep].action?.();
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePosition, 200);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      
      // Clean up highlights
      const highlights = document.querySelectorAll('[data-tour-highlight]');
      highlights.forEach(el => {
        const element = el as HTMLElement;
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.removeAttribute('data-tour-highlight');
      });
    };
  }, [isOpen, currentStep, steps]);

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Arrow positioning styles
  const getArrowStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (position.arrow) {
      case 'top':
        return {
          ...baseStyle,
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 10px 10px 10px',
          borderColor: 'transparent transparent #003595 transparent',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '10px 10px 0 10px',
          borderColor: '#003595 transparent transparent transparent',
        };
      case 'left':
        return {
          ...baseStyle,
          left: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '10px 10px 10px 0',
          borderColor: 'transparent #003595 transparent transparent',
        };
      case 'right':
        return {
          ...baseStyle,
          right: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '10px 0 10px 10px',
          borderColor: 'transparent transparent transparent #003595',
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 z-[9997] transition-opacity duration-300"
        style={{ pointerEvents: 'none' }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-[#003595] p-4 max-w-xs transition-all duration-300"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        <div style={getArrowStyle()} />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close tour"
        >
          <X size={16} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Content */}
        <div className="pr-5">
          <h3 className="text-base font-semibold text-[#003595] dark:text-white mb-1.5">
            {step.title}
          </h3>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            {step.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSkip}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#003595] dark:hover:text-white transition-colors font-medium"
          >
            Skip Tour
          </button>
          <div className="flex items-center gap-1.5">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft size={16} className="text-[#003595] dark:text-white" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 bg-[#003595] hover:bg-[#002a7a] text-white rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-[#003595] w-5'
                  : 'bg-gray-300 dark:bg-gray-600 w-1'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Tour;

