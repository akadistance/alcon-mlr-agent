import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { ChatContext } from '../ChatContext';
import { X, Moon, Sun, Download, Trash2 } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { conversations, clearAllConversations } = useContext(ChatContext);

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

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <div className="setting-label">
                <span className="setting-icon">
                  {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </span>
                <span>Theme</span>
              </div>
              <div className="theme-toggle">
                <button 
                  className={`theme-option ${!isDarkMode ? 'active' : ''}`}
                  onClick={() => isDarkMode && toggleDarkMode()}
                >
                  <Sun size={16} />
                  Light
                </button>
                <button 
                  className={`theme-option ${isDarkMode ? 'active' : ''}`}
                  onClick={() => !isDarkMode && toggleDarkMode()}
                >
                  <Moon size={16} />
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div className="setting-section">
            <h3>Data Management</h3>
            <div className="setting-item">
              <button className="action-btn export-btn" onClick={handleExportChats}>
                <Download size={18} />
                Export Chat History
              </button>
            </div>
            <div className="setting-item">
              <button className="action-btn danger-btn" onClick={handleClearAllChats}>
                <Trash2 size={18} />
                Clear All Chats
              </button>
            </div>
          </div>

          <div className="setting-section">
            <h3>About EyeQ</h3>
            <div className="about-info">
              <p><strong>Version:</strong> 2.0.0</p>
              <p><strong>Developer:</strong> Jason Jiwan</p>
              <p><strong>Purpose:</strong> AI-powered ophthalmic compliance analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;