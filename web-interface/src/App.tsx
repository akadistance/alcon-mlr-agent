import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './ThemeContext';
import { ChatProvider } from './ChatContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ThemeProvider>
      <ChatProvider>
        {/* Main container - simple flex, no overflow hidden here */}
        <div className="flex h-screen bg-chatgpt-bg dark:bg-chatgpt-dark-bg">
          
          {/* Background decorations - BEHIND everything with pointer-events-none */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-chatgpt-bg-secondary via-chatgpt-bg to-chatgpt-bg-tertiary dark:from-chatgpt-dark-bg-secondary dark:via-chatgpt-dark-bg dark:to-chatgpt-dark-bg-tertiary opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,53,149,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,53,149,0.08),transparent_50%)]"></div>
            
            {/* Floating elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-alcon-blue/10 to-transparent rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-alcon-blue/10 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Sidebar - will be static on desktop, fixed on mobile */}
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={closeSidebar}
            onToggleCollapse={toggleSidebarCollapse}
          />
          
          {/* Main content area - relative positioning, takes remaining space */}
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            <Header onToggleSidebar={toggleSidebar} />
            
            <div className="flex-1 overflow-hidden">
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
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;

