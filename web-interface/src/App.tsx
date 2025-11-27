import { useState, useContext, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ParticleBackground from './components/ParticleBackground';
import Tour, { TourStep } from './components/Tour';
import { ThemeProvider } from './ThemeContext';
import { ChatProvider, ChatContext } from './ChatContext';

const TOUR_STORAGE_KEY = 'eyeq_tour_completed';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { conversations, currentConversationId } = useContext(ChatContext);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check if there are any messages in the current conversation
  const currentConversation = conversations.find(conv => conv.id === currentConversationId);
  const hasMessages = currentConversation ? currentConversation.messages.length > 0 : false;

  // Check if this is first visit
  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      // Show tour after a short delay to ensure page is loaded
      setTimeout(() => {
        setIsTourOpen(true);
      }, 500);
    }
  }, []);

  const handleStartTour = () => {
    // Reset tour to beginning when manually triggered
    setIsTourOpen(true);
  };

  const handleTourComplete = () => {
    setIsTourOpen(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  // Define tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      target: '[data-tour="eyeq-logo"]',
      title: 'Welcome to EyeQ! 👋',
      content: 'EyeQ is your AI-powered assistant for MLR compliance and regulatory analysis. Let\'s take a quick tour to get you started.',
      position: 'bottom',
    },
    {
      id: 'sidebar',
      target: '[data-tour="sidebar-chat-button"]',
      title: 'Sidebar Navigation',
      content: 'Use the sidebar to navigate between conversations, search your chat history, and start new conversations. Click "Chat" to begin a new conversation.',
      position: 'right',
      action: () => {
        // Ensure sidebar is open
        if (window.innerWidth > 1024 && sidebarCollapsed) {
          setSidebarCollapsed(false);
        }
        if (!sidebarOpen && window.innerWidth <= 1024) {
          setSidebarOpen(true);
        }
      },
    },
    {
      id: 'input',
      target: '[data-tour="input-area"]',
      title: 'Message Input',
      content: 'Type your questions or upload documents here. EyeQ can analyze promotional materials, check MLR compliance, and provide regulatory guidance. You can also ask follow-up questions to dive deeper into any topic.',
      position: 'top',
    },
    {
      id: 'prompts',
      target: '[data-tour="prompt-examples"]',
      title: 'Quick Actions',
      content: 'Use these quick action buttons for common tasks like checking MLR compliance, rewriting content, or detecting risks. You can also type custom requests.',
      position: 'top',
    },
    {
      id: 'settings',
      target: '[data-tour="settings-button"]',
      title: 'Settings',
      content: 'Click the settings gear icon to customize your experience, adjust preferences, and configure EyeQ to work best for you. You can also provide feedback or report issues through the Feedback section in Settings.',
      position: 'bottom',
    },
    {
      id: 'help',
      target: '[data-tour="help-button"]',
      title: 'Help & Support',
      content: 'Click the help icon anytime to restart this tour or get assistance. You\'re all set to start using EyeQ!',
      position: 'bottom',
    },
  ];

  return (
    <>
      {/* Main container - transparent to show background image */}
      <div className="flex h-screen bg-transparent">

        {/* Sidebar - will be static on desktop, fixed on mobile */}
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={closeSidebar}
          onToggleCollapse={toggleSidebarCollapse}
        />
        
        {/* Main content area - relative positioning, takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-chatgpt-bg dark:bg-chatgpt-dark-bg">
          {/* Particle background effect */}
          <ParticleBackground hideWhenChatting={hasMessages} />
            
            <Header onToggleSidebar={toggleSidebar} onStartTour={handleStartTour} />
            
            <div className="flex-1 overflow-hidden relative z-10">
                           <ChatInterface 
                onToggleSidebar={toggleSidebar} 
                sidebarCollapsed={sidebarCollapsed}
                sidebarOpen={sidebarOpen}
              />
            </div>
          </div>
          
          {/* Alcon Logo Watermark */}
          <img
            src="/assets/images/alcon-logo.png"
            alt="Alcon"
            className="fixed bottom-6 right-6 h-10 opacity-70 dark:opacity-60 pointer-events-none z-20 transition-all duration-300 hover:opacity-90 dark:hover:opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/images/alcon-logo.png";
              target.onerror = () => {
                target.src = "/assets/images/alcon-logo.svg";
                target.onerror = () => {
                  target.style.display = 'none';
                };
              };
            }}
          />
      </div>
      
      {/* Tour Component */}
      <Tour
        steps={tourSteps}
        isOpen={isTourOpen}
        onComplete={handleTourComplete}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;

