import React, { useContext, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { ChatContext } from '../ChatContext';
import { Search, MoreHorizontal, Share, Edit, Archive, Trash2, PanelLeftClose, MessageSquare, User } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { 
    sortedConversations, 
    currentConversationId, 
    createNewConversation, 
    switchConversation, 
    deleteConversation, 
    updateConversationTitle
  } = useContext(ChatContext);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<'search' | 'chat'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build a single list sorted by most recent updatedAt/createdAt/id
  const allConversations = [...sortedConversations].sort((a, b) => {
    const getTime = (c: Conversation) => {
      const t: any = (c.updatedAt as any) || (c.createdAt as any) || c.id;
      const n = Number(t);
      if (!isNaN(n)) return n;
      const d = new Date(t);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    return getTime(b) - getTime(a);
  });

  // Search through conversations (titles and messages)
  const filteredConversations = searchQuery.trim() 
    ? allConversations.filter(conv => {
        // Search in title
        if (conv.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        // Search in messages
        return conv.messages.some(msg => 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : allConversations;

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
    console.log('Share conversation:', convId);
    closeMenu();
  };

  const handleArchive = (convId: string) => {
    console.log('Archive conversation:', convId);
    closeMenu();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveNav('search');
        setIsSearchActive(true);
        // Focus search input after a brief delay to ensure it's rendered
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setActiveNav('chat');
        createNewConversation();
        if (window.innerWidth <= 768 && onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewConversation, onClose]);

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
        group relative px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200
        ${conv.id === currentConversationId 
          ? 'bg-gradient-to-r from-[#003595]/10 to-transparent border-l-2 border-[#003595]' 
          : 'hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover'}
      `}
    >
      <div
        className="flex items-center justify-between"
        onClick={() => {
          if (editingId !== conv.id) {
            switchConversation(conv.id);
            setActiveNav('chat');
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
          <span className="flex-1 text-sm text-sidebar-text-primary dark:text-sidebar-text-primary truncate pr-2">
            {conv.title}
          </span>
        )}
        
        <div className="menu-container relative">
          <button
            className={`p-2 rounded-lg hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              openMenuId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu(conv.id);
            }}
            aria-label="More options"
          >
            <MoreHorizontal size={18} className="text-sidebar-text-secondary dark:text-sidebar-text-secondary" />
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
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Grok-style Sidebar */}
      <div className={`
        sidebar-container
        fixed top-0 left-0 h-screen
        transition-all duration-300 ease-in-out
        bg-sidebar-surface dark:bg-sidebar-surface border-r border-sidebar-border dark:border-sidebar-border
        z-50
        
        lg:static lg:z-auto
        
        ${isCollapsed ? 'w-16' : 'w-64'}
        
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Collapse button at top */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border dark:border-sidebar-border">
            {isCollapsed ? (
              <button 
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover transition-all duration-200 min-w-[44px] min-h-[44px]"
                onClick={onToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftClose size={18} className="text-sidebar-text-secondary dark:text-sidebar-text-secondary rotate-180" />
              </button>
            ) : (
              <div className="w-full flex items-center justify-end">
                <button 
                  className="p-2 rounded-lg hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={onToggleCollapse}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose size={18} className="text-sidebar-text-secondary dark:text-sidebar-text-secondary" />
                </button>
              </div>
            )}
          </div>

          {/* Unified Navigation Section */}
          {!isCollapsed && (
            <div className="flex-1 overflow-y-auto py-4 px-2">
              {/* Search Input - shown when Search is active or when typing */}
              {(isSearchActive || activeNav === 'search' || searchQuery.trim()) && (
                <div className="mb-4 px-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-text-secondary dark:text-sidebar-text-secondary" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchActive(true);
                        setActiveNav('search');
                      }}
                      onFocus={() => {
                        setIsSearchActive(true);
                        setActiveNav('search');
                      }}
                      onBlur={(e) => {
                        // Only hide if search query is empty and we're not clicking on the Search button
                        if (!searchQuery.trim() && !e.relatedTarget?.closest('button')) {
                          setIsSearchActive(false);
                          if (activeNav === 'search') {
                            setActiveNav('chat');
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Escape key closes search
                        if (e.key === 'Escape') {
                          setSearchQuery('');
                          setIsSearchActive(false);
                          setActiveNav('chat');
                          searchInputRef.current?.blur();
                        }
                      }}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-sidebar-surface-hover dark:bg-sidebar-surface-hover border border-sidebar-border dark:border-sidebar-border rounded-xl focus:outline-none focus:ring-2 focus:ring-alcon-blue/20 focus:border-alcon-blue text-sidebar-text-primary dark:text-sidebar-text-primary placeholder-sidebar-text-secondary dark:placeholder-sidebar-text-secondary transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="space-y-1 mb-4">
                {/* Search Button - hidden when search input is active */}
                {!(isSearchActive || activeNav === 'search' || searchQuery.trim()) && (
                  <button
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      text-sidebar-text-secondary dark:text-sidebar-text-secondary hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover
                    `}
                    onClick={() => {
                      setActiveNav('search');
                      setIsSearchActive(true);
                      setTimeout(() => {
                        searchInputRef.current?.focus();
                      }, 100);
                    }}
                  >
                    <Search size={20} />
                    <span className="text-sm font-medium">Search</span>
                    <span className="ml-auto text-xs text-sidebar-text-secondary dark:text-sidebar-text-secondary">
                      Ctrl+K
                    </span>
                  </button>
                )}

                {/* Chat Button */}
                <button
                  data-tour="sidebar-chat-button"
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${activeNav === 'chat' 
                      ? 'bg-sidebar-surface-hover dark:bg-sidebar-surface-hover text-sidebar-text-primary dark:text-sidebar-text-primary' 
                      : 'text-sidebar-text-secondary dark:text-sidebar-text-secondary hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover'}
                  `}
                  onClick={() => {
                    setActiveNav('chat');
                    createNewConversation();
                    if (window.innerWidth <= 768 && onClose) onClose();
                  }}
                >
                  <MessageSquare size={20} />
                  <span className="text-sm font-medium">Chat</span>
                  <span className="ml-auto text-xs text-sidebar-text-secondary dark:text-sidebar-text-secondary">
                    Ctrl+J
                  </span>
                </button>
              </div>

              {/* Conversations List */}
              <div className="mt-4">
                {searchQuery.trim() ? (
                  <>
                    <div className="text-xs font-semibold text-sidebar-text-secondary dark:text-sidebar-text-secondary uppercase tracking-wider mb-2 px-4">
                      Search Results
                    </div>
                    {filteredConversations.length > 0 ? (
                      <div className="space-y-0.5">
                        {filteredConversations.map(renderConversationItem)}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-sidebar-text-secondary dark:text-sidebar-text-secondary">
                        No conversations found for "{searchQuery}"
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-sidebar-text-secondary dark:text-sidebar-text-secondary uppercase tracking-wider mb-2 px-4">
                      Recent
                    </div>
                    {filteredConversations.length > 0 ? (
                      <div className="space-y-0.5">
                        {filteredConversations.map(renderConversationItem)}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-sidebar-text-secondary dark:text-sidebar-text-secondary">
                        No conversations yet
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Collapsed navigation icons */}
          {isCollapsed && (
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
              <button
                className={`
                  w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200
                  ${activeNav === 'search' 
                    ? 'bg-sidebar-surface-hover dark:bg-sidebar-surface-hover' 
                    : 'hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover'}
                  min-w-[44px] min-h-[44px]
                `}
                onClick={() => {
                  setActiveNav('search');
                  setIsSearchActive(true);
                }}
                title="Search (Ctrl+K)"
              >
                <Search size={20} className={activeNav === 'search' ? 'text-sidebar-text-primary dark:text-sidebar-text-primary' : 'text-sidebar-text-secondary dark:text-sidebar-text-secondary'} />
              </button>
              <button
                className={`
                  w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200
                  ${activeNav === 'chat' 
                    ? 'bg-sidebar-surface-hover dark:bg-sidebar-surface-hover' 
                    : 'hover:bg-sidebar-surface-hover dark:hover:bg-sidebar-surface-hover'}
                  min-w-[44px] min-h-[44px]
                `}
                onClick={() => {
                  setActiveNav('chat');
                  createNewConversation();
                  if (window.innerWidth <= 768 && onClose) onClose();
                }}
                title="Chat (Ctrl+J)"
              >
                <MessageSquare size={20} className={activeNav === 'chat' ? 'text-sidebar-text-primary dark:text-sidebar-text-primary' : 'text-sidebar-text-secondary dark:text-sidebar-text-secondary'} />
              </button>
            </div>
          )}

          {/* User profile at bottom - Grok style */}
          <div className="p-4 border-t border-sidebar-border dark:border-sidebar-border">
            {isCollapsed ? (
              <button className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#003595]/10 dark:hover:bg-[#003595]/20 transition-all duration-200 min-w-[44px] min-h-[44px]">
                <div className="w-8 h-8 rounded-full bg-[#003595] flex items-center justify-center">
                  <User size={18} className="text-white" strokeWidth={2} />
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#003595] flex items-center justify-center">
                  <User size={18} className="text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-sidebar-text-primary dark:text-sidebar-text-primary">Jason Jiwan</div>
                  <div className="text-xs text-sidebar-text-secondary dark:text-sidebar-text-secondary">JIWANJA1@alcon.net</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
