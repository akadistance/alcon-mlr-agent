import React, { useContext, useState, useEffect, KeyboardEvent } from 'react';
import { ChatContext } from '../ChatContext';
import { Plus, Search, MoreHorizontal, Share, Edit, Archive, Trash2, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

// Simplified: single Recent list instead of date-grouped sections

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { 
    sortedConversations, 
    currentConversationId, 
    createNewConversation, 
    switchConversation, 
    deleteConversation, 
    updateConversationTitle 
  } = useContext(ChatContext);
  
  // Debug logging
  console.log('📋 Sidebar conversations:', sortedConversations);
  console.log('🎯 Current conversation ID:', currentConversationId);
  
  // Removed group expand/collapse; using a single Recent section
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Build a single "Recent" list sorted by most recent updatedAt/createdAt/id
  const allRecentConversations = [...sortedConversations].sort((a, b) => {
    const getTime = (c: Conversation) => {
      const t: any = (c.updatedAt as any) || (c.createdAt as any) || c.id;
      const n = Number(t);
      if (!isNaN(n)) return n; // numeric timestamp-like id
      const d = new Date(t);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    return getTime(b) - getTime(a);
  });

  // Filter conversations based on search query
  const recentConversations = searchQuery.trim() 
    ? allRecentConversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allRecentConversations;

  const startEditing = (convId: string, currentTitle: string) => {
    setEditingId(convId);
    setEditTitle(currentTitle);
  };

  const saveEdit = () => {
    if (editTitle.trim() && editingId) {
      updateConversationTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

  const toggleMenu = (convId: string) => {
    setOpenMenuId(openMenuId === convId ? null : convId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  const handleShare = (convId: string) => {
    // TODO: Implement share functionality
    console.log('Share conversation:', convId);
    closeMenu();
  };

  const handleArchive = (convId: string) => {
    // TODO: Implement archive functionality
    console.log('Archive conversation:', convId);
    closeMenu();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.menu-container')) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  const renderConversationItem = (conv: Conversation) => (
          <div
            key={conv.id}
            className={`
              group relative px-3 py-2 mx-2 rounded-xl cursor-pointer transition-all duration-200
              ${conv.id === currentConversationId 
                ? 'bg-alcon-blue/10 dark:bg-alcon-blue/15 border-l-2 border-alcon-blue' 
                : 'hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary hover:scale-[1.02] hover:shadow-sm'}
            `}
          >
      <div
        className="flex items-center justify-between"
        onClick={() => {
          if (editingId !== conv.id) {
            switchConversation(conv.id);
            if (window.innerWidth <= 768 && onClose) onClose();
          }
        }}
      >
        {editingId === conv.id ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-chatgpt-bg dark:bg-chatgpt-dark-bg text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary px-3 py-2 rounded-xl border border-alcon-blue focus:outline-none text-sm shadow-chatgpt"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary truncate pr-2">
            {conv.title}
          </span>
        )}
        
        <div className="menu-container relative">
          <button
            className={`p-1.5 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-opacity ${
              openMenuId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu(conv.id);
            }}
            aria-label="More options"
          >
            <MoreHorizontal size={16} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
          </button>
          {openMenuId === conv.id && (
            <div className="absolute right-0 mt-2 w-48 bg-chatgpt-bg/95 dark:bg-chatgpt-dark-bg/95 backdrop-blur-md rounded-2xl shadow-chatgpt-lg border border-chatgpt-border/50 dark:border-chatgpt-dark-border/50 z-50 py-2 animate-slide-in">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors rounded-xl mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(conv.id);
                }}
              >
                <Share size={16} />
                <span>Share</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors rounded-xl mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(conv.id, conv.title);
                  closeMenu();
                }}
              >
                <Edit size={16} />
                <span>Rename</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors rounded-xl mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive(conv.id);
                }}
              >
                <Archive size={16} />
                <span>Archive</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-xl mx-1"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                  closeMenu();
                }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay - only visible on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Modern Sidebar */}
        <div className={`
          fixed top-0 left-0 h-screen
          transition-all duration-300 ease-in-out
          bg-sidebar-surface/95 dark:bg-sidebar-surface/95 backdrop-blur-md border-r border-sidebar-border/50 dark:border-sidebar-border/50
          z-50 shadow-chatgpt-lg
          
          /* Desktop behavior - always visible, position affects layout */
          lg:static lg:z-auto
          
          /* Width transitions */
          ${isCollapsed ? 'w-16' : 'w-64'}
          
          /* Mobile behavior - slides in from left */
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Toggle Button */}
          <div className="p-4 border-b border-chatgpt-border/50 dark:border-chatgpt-dark-border/50">
            {isCollapsed ? (
              <button 
                className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors"
                onClick={onToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={32} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-alcon-blue/10 dark:bg-alcon-blue/15 flex items-center justify-center">
                    <span className="text-sm font-semibold text-alcon-blue">E</span>
                  </div>
                  <span className="text-sm font-semibold text-chatgpt-text-primary dark:text-chatgpt-dark-text-primary">EyeQ</span>
                </div>
                <button 
                  className="p-2 rounded-lg hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors"
                  onClick={onToggleCollapse}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose size={18} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
                </button>
              </div>
            )}
          </div>

          {/* Modern Search Section */}
          <div className="p-4">
            {isCollapsed ? (
              // Collapsed: Just the search icon button
              <button 
                className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-colors"
                title="Search conversations"
                aria-label="Search conversations"
              >
                <Search size={32} className="text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary" />
              </button>
            ) : (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-chatgpt-text-tertiary dark:text-chatgpt-dark-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-sm bg-sidebar-surface-hover dark:bg-sidebar-surface-hover border border-sidebar-border dark:border-sidebar-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-alcon-blue/20 focus:border-alcon-blue text-sidebar-text-primary dark:text-sidebar-text-primary placeholder-sidebar-text-secondary dark:placeholder-sidebar-text-secondary shadow-chatgpt transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-chatgpt-text-tertiary dark:text-chatgpt-dark-text-tertiary hover:text-chatgpt-text-secondary dark:hover:text-chatgpt-dark-text-secondary transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Modern New Chat Section */}
          <div className="px-4 pb-4">
            {isCollapsed ? (
              // Collapsed: Just the plus icon
              <button 
                className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-chatgpt-bg-secondary dark:hover:bg-chatgpt-dark-bg-secondary transition-all text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary"
                onClick={() => {
                  createNewConversation();
                  if (window.innerWidth <= 768 && onClose) onClose();
                }}
                title="New Chat"
                aria-label="New Chat"
              >
                <Plus size={32} />
              </button>
            ) : (
              <button 
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-chatgpt-border dark:border-chatgpt-dark-border hover:border-alcon-blue dark:hover:border-alcon-blue hover:bg-alcon-blue/5 dark:hover:bg-alcon-blue/5 transition-all text-chatgpt-text-secondary dark:text-chatgpt-dark-text-secondary font-medium shadow-chatgpt hover:shadow-chatgpt-lg"
                onClick={() => {
                  createNewConversation();
                  if (window.innerWidth <= 768 && onClose) onClose();
                }}
              >
                <Plus size={20} />
                <span className="text-sm">New Chat</span>
              </button>
            )}
          </div>


          {/* Modern Recent Section - HIDDEN WHEN COLLAPSED */}
          {!isCollapsed && (
            <div className="flex-1 overflow-y-auto py-2">
              <div className="mb-2">
                <div className="w-full flex items-center gap-2 px-6 py-3 text-xs font-semibold text-chatgpt-text-tertiary dark:text-chatgpt-dark-text-tertiary uppercase tracking-wider">
                  <span>Recent</span>
                </div>
                <div className="space-y-1 px-2">
                  {recentConversations.length > 0 ? (
                    recentConversations.map(renderConversationItem)
                  ) : searchQuery.trim() ? (
                    <div className="px-4 py-6 text-center text-sm text-chatgpt-text-tertiary dark:text-chatgpt-dark-text-tertiary">
                      No conversations found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

