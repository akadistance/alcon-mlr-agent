import { useState, useContext } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ParticleBackground from './components/ParticleBackground';
import { ThemeProvider } from './ThemeContext';
import { ChatProvider, ChatContext } from './ChatContext';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
            
            <Header onToggleSidebar={toggleSidebar} />
            
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
            className="fixed bottom-6 right-6 h-6 opacity-15 dark:opacity-8 pointer-events-none z-20 transition-all duration-300 hover:opacity-25 dark:hover:opacity-15"
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

