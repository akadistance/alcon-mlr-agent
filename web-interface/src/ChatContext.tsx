import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Message, Conversation, UploadedFile } from './types';

interface SelectedTextContext {
  text: string;
  sourceMessageId: number | string;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => string | null;
  createConversationOnFirstMessage: () => string;
  getCurrentConversation: () => Conversation;
  updateCurrentMessages: (newMessages: Message[], targetConversationId?: string | null) => void;
  switchConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  uploadedFiles: UploadedFile[];
  addFile: (file: File) => Promise<UploadedFile>;
  deleteFile: (fileId: string) => Promise<void>;
  sortedConversations: Conversation[];
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => void;
  toggleConversationPin: (id: string) => void;
  clearAllConversations: () => void;
  exportConversation: (id: string) => void;
  selectedTextContext: SelectedTextContext | null;
  setSelectedTextContext: (context: SelectedTextContext | null) => void;
  clearSelectedTextContext: () => void;
}

export const ChatContext = createContext<ChatContextType>({
  conversations: [],
  currentConversationId: null,
  createNewConversation: () => null,
  createConversationOnFirstMessage: () => '',
  getCurrentConversation: () => ({ id: '', title: '', messages: [], pinned: false, createdAt: new Date(), updatedAt: new Date() }),
  updateCurrentMessages: () => {},
  switchConversation: () => {},
  updateConversationTitle: () => {},
  uploadedFiles: [],
  addFile: async () => ({ id: '', name: '', size: 0, type: '', uploaded_at: '', content: '', isLocal: true }),
  deleteFile: async () => {},
  sortedConversations: [],
  deleteConversation: async () => {},
  renameConversation: () => {},
  toggleConversationPin: () => {},
  clearAllConversations: () => {},
  exportConversation: () => {},
  selectedTextContext: null,
  setSelectedTextContext: () => {},
  clearSelectedTextContext: () => {},
});

// LocalStorage helper functions
const STORAGE_KEYS = {
  CONVERSATIONS: 'eyeq_conversations',
  CURRENT_CONVERSATION: 'eyeq_current_conversation'
};

const saveToLocalStorage = (key: string, data: any) => {
  // Check if we're in a browser environment (not during build)
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T | null = null): T | null => {
  // Check if we're in a browser environment (not during build)
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Start with empty conversations - load from localStorage but don't auto-create
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const local = loadFromLocalStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    return (local && Array.isArray(local) && local.length > 0) ? local : [];
  });
  // Start with no current conversation (homepage state)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedTextContext, setSelectedTextContext] = useState<SelectedTextContext | null>(null);

  // Load data from localStorage on initialization - but DON'T restore current conversation
  useEffect(() => {
    console.log('🏁 ChatContext useEffect running - loading data from localStorage');
    const loadData = () => {
      try {
        // Load conversations from localStorage (files are not stored)
        const localConversations = loadFromLocalStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []) || [];
        
        console.log('Loaded conversations from localStorage:', localConversations.length);
        
        setConversations(localConversations);
        // Always start with empty files array - files are not persisted
        setUploadedFiles([]);
        
        // ALWAYS start with null (homepage) - don't restore previous conversation
        setCurrentConversationId(null);
        // Clear the saved current conversation
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
          // Clean up any old files from localStorage if they exist
          localStorage.removeItem('eyeq_files');
        }
        
        console.log('🏠 Starting on homepage (no current conversation)');
        
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        setConversations([]);
        setUploadedFiles([]);
        setCurrentConversationId(null);
      }
    };
    
    loadData();
  }, []);

  // Save conversations to localStorage
  const saveConversationsToLocal = (conversationsToSave: Conversation[]) => {
    console.log('Saving conversations to localStorage:', conversationsToSave.length);
    saveToLocalStorage(STORAGE_KEYS.CONVERSATIONS, conversationsToSave);
  };

  const createNewConversation = (): string | null => {
    // If we're already on homepage (no current conversation), don't create a new one
    if (!currentConversationId) {
      console.log('🏠 Already on homepage, no need to create new conversation');
      return null;
    }
    
    // Check if current conversation is empty - if so, just clear to homepage
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv && currentConv.messages.length === 0) {
      console.log('🏠 Current conversation is empty, returning to homepage');
      setCurrentConversationId(null);
      return null;
    }
    
    // If current conversation has messages, return to homepage (don't create new conversation yet)
    console.log('🏠 Returning to homepage');
    setCurrentConversationId(null);
    return null;
  };
  
  const createConversationOnFirstMessage = (): string => {
    // Create conversation only when user sends first message
    const newId = Date.now().toString();
    const nowDate = new Date();
    const newConversations: Conversation[] = [...conversations, { 
      id: newId, 
      title: 'New Chat', 
      messages: [], 
      pinned: false, 
      createdAt: nowDate, 
      updatedAt: nowDate
    }];
    setConversations(newConversations);
    setCurrentConversationId(newId);
    saveConversationsToLocal(newConversations);
    console.log('✨ Created new conversation on first message:', newId);
    return newId;
  };

  const getCurrentConversation = (): Conversation => {
    const found = conversations.find(conv => conv.id === currentConversationId);
    return found || { id: '', title: '', messages: [], pinned: false, createdAt: new Date(), updatedAt: new Date() };
  };

  const updateCurrentMessages = (newMessages: Message[], targetConversationId: string | null = null) => {
    // Use provided conversationId or fall back to currentConversationId
    const conversationIdToUpdate = targetConversationId || currentConversationId;
    
    console.log('updateCurrentMessages called with:', {
      currentConversationId,
      targetConversationId,
      conversationIdToUpdate,
      newMessagesLength: newMessages.length,
      newMessages: newMessages
    });
    
    if (!conversationIdToUpdate) {
      console.error('❌ No conversation ID to update messages for!');
      return;
    }
    
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => {
        if (conv.id === conversationIdToUpdate) {
          console.log('Found matching conversation, updating messages');
          return { ...conv, messages: [...newMessages], updatedAt: new Date() };
        }
        return conv;
      });
      
      console.log('Setting updated conversations:', updatedConversations);
      saveConversationsToLocal(updatedConversations);
      
      // Auto-rename conversation based on first user message
      const currentConv = updatedConversations.find(conv => conv.id === conversationIdToUpdate);
      if (currentConv && currentConv.title === 'New Chat' && newMessages.length > 0) {
        const firstUserMessage = newMessages.find(msg => msg.type === 'user');
        if (firstUserMessage) {
          const title = generateTitleFromMessage(firstUserMessage.content);
          // Use setTimeout to avoid calling updateConversationTitle during render
          setTimeout(() => updateConversationTitle(conversationIdToUpdate, title), 0);
        }
      }
      
      return updatedConversations;
    });
  };

  const generateTitleFromMessage = (message: string): string => {
    // Extract meaningful title from message (first 50 chars, clean up)
    let title = message.trim();
    
    // Remove common prefixes
    title = title.replace(/^(please|can you|could you|help me|i need|analyze|review|check)/i, '');
    title = title.trim();
    
    // Truncate and clean up
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    return title || 'New Chat';
  };

  const switchConversation = (id: string) => {
    setCurrentConversationId(id);
    // Only save to localStorage if in browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      saveToLocalStorage(STORAGE_KEYS.CURRENT_CONVERSATION, id);
    }
  };

  const updateConversationTitle = (id: string, title: string) => {
    console.log('updateConversationTitle called with:', { id, title, currentConversationId });
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => 
        conv.id === id ? { ...conv, title } : conv
      );
      console.log('Updated conversations after title change:', updatedConversations);
      saveConversationsToLocal(updatedConversations);
      return updatedConversations;
    });
  };

  const addFile = async (file: File): Promise<UploadedFile> => {
    try {
      // Create file object (NOT stored in localStorage - files are temporary)
      const fileData: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
        content: '', // Will be filled by backend processing
        isLocal: true
      };
      
      // Add to local state only (not persisted to localStorage)
      const updatedFiles = [...uploadedFiles, fileData];
      setUploadedFiles(updatedFiles);
      
      console.log('File added (temporary, not stored):', file.name);
      return fileData;
    } catch (error) {
      console.error('Failed to add file:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      // Remove from local state only (files are not persisted)
      const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
      setUploadedFiles(updatedFiles);
      
      console.log('File deleted (temporary):', fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  };

  const deleteConversation = async (id: string): Promise<void> => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.filter(conv => conv.id !== id);
      
      if (currentConversationId === id) {
        setCurrentConversationId(updatedConversations[0]?.id || null);
      }
      
      // Save to localStorage
      saveConversationsToLocal(updatedConversations);
      return updatedConversations;
    });
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      );
      saveConversationsToLocal(updatedConversations);
      return updatedConversations;
    });
  };

  const toggleConversationPin = (id: string) => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => 
        conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
      );
      saveConversationsToLocal(updatedConversations);
      return updatedConversations;
    });
  };

  const clearAllConversations = () => {
    setConversations([]);
    setCurrentConversationId(null);
  };

  const exportConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      const data = JSON.stringify(conv);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conv.title}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Sort conversations with pinned first
  const sortedConversations = [...conversations].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const clearSelectedTextContext = () => {
    setSelectedTextContext(null);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      createNewConversation,
      createConversationOnFirstMessage,
      getCurrentConversation,
      updateCurrentMessages,
      switchConversation,
      updateConversationTitle,
      uploadedFiles,
      addFile,
      deleteFile,
      sortedConversations,
      deleteConversation,
      renameConversation,
      toggleConversationPin,
      clearAllConversations,
      exportConversation,
      selectedTextContext,
      setSelectedTextContext,
      clearSelectedTextContext
    }}>
      {children}
    </ChatContext.Provider>
  );
};
