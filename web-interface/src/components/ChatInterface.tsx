import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { ArrowDown, FileText, Edit, AlertTriangle, Shield } from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';
import PromptSuggestions from './PromptSuggestions';
import { ChatContext } from '../ChatContext';
import { Message } from '../types';

import { Attachment } from '../types';

interface ChatInterfaceProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onToggleSidebar: _onToggleSidebar, sidebarCollapsed, sidebarOpen }) => {
  const {
    updateCurrentMessages,
    addFile,
    updateConversationTitle,
    conversations,
    currentConversationId,
    createConversationOnFirstMessage
  } = useContext(ChatContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isStreamingRef = useRef(false);
  const isInitialMount = useRef(true);
  const previousConversationId = useRef(currentConversationId);
  
  // Get current messages directly from conversations state for better reactivity
  const currentConversation = useMemo(() => {
    const found = conversations.find(conv => conv.id === currentConversationId);
    console.log('🔍 useMemo currentConversation:', { currentConversationId, found, conversations });
    return found;
  }, [conversations, currentConversationId]);
  
  const messages = useMemo(() => {
    const msgs = currentConversation?.messages || [];
    console.log('🔍 useMemo messages:', { currentConversation, messages: msgs, forceRender });
    return msgs;
  }, [currentConversation, forceRender]);

  // Smart scroll - SIMPLIFIED for smooth behavior
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth', force = false) => {
    // Skip if not at bottom and not forcing scroll
    if (!force && !isAutoScroll && behavior !== 'auto') return;
    
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: behavior
        });
      }
    });
  };

  // Improved scroll detection with debouncing
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // More lenient threshold - 150px from bottom
    const isNearBottom = distanceFromBottom < 150;
    
    setIsAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom && scrollHeight > clientHeight + 200);
  };

  const scrollToBottomManually = () => {
    // Force scroll to bottom regardless of isAutoScroll state
    scrollToBottom('smooth', true);
    setIsAutoScroll(true);
    setShowScrollButton(false);
  };

  // Single useEffect for ALL scrolling - triggers on any message change
  useEffect(() => {
    // Skip auto-scroll on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-scroll if we're in the same conversation
    if (previousConversationId.current === currentConversationId && messages.length > 0) {
      // During streaming, use instant scroll to avoid jank
      const behavior: ScrollBehavior = isStreamingRef.current ? 'auto' : 'smooth';
      scrollToBottom(behavior);
    }

    // Update previous conversation ID
    previousConversationId.current = currentConversationId;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Handle conversation switching
  useEffect(() => {
    // When conversation changes, reset auto-scroll state
    if (currentConversationId && currentConversationId !== previousConversationId.current) {
      setIsAutoScroll(true);
      // Scroll to bottom after a brief delay to let content render
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [currentConversationId]);

  // Debug: Track messages changes
  useEffect(() => {
    console.log('🔄 Messages changed:', messages.length, 'messages');
    console.log('🔄 Current conversation ID:', currentConversationId);
    console.log('🔄 Messages array:', messages);
    console.log('🔄 Current conversation object:', currentConversation);
  }, [messages, currentConversationId, currentConversation]);

  const handleSendMessage = async (message: string, file: File | null = null, attachments?: Attachment[]) => {
    console.log('🚀 handleSendMessage called with:', message, file);
    console.log('🔍 Current conversation ID:', currentConversationId);
    console.log('🔍 Current conversation:', currentConversation);
    console.log('🔍 Messages length:', messages.length);

    if (!message && !file) return;
    
    // If no current conversation (homepage), create one on first message
    let conversationId = currentConversationId;
    if (!conversationId) {
      console.log('🏠 On homepage, creating new conversation for first message');
      conversationId = createConversationOnFirstMessage();
      // Wait a tick for state to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    let fileContent = '';
    let effectiveMessage = message || 'Please analyze this uploaded file for compliance.';

    // Add user message first
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: effectiveMessage,
      file: file ? { name: file.name, content: fileContent } : undefined,
      attachments: attachments,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    console.log('📝 Adding user message:', userMessage);
    console.log('📋 Using conversationId:', conversationId);
    
    // Update messages immediately and optimistically
    updateCurrentMessages(newMessages, conversationId);
    setIsLoading(true);

    // Force re-render
    setForceRender(prev => prev + 1);
    console.log('🔄 Messages updated, forcing re-render');

    // Auto-name conversation if it's the first user message
    const convToUpdate = conversations.find(c => c.id === conversationId);
    if (messages.length === 0 && convToUpdate && convToUpdate.title === 'New Chat') {
      const title = generateTitleFromMessage(effectiveMessage);
      updateConversationTitle(conversationId, title);
    }

    console.log('🔥 About to process file. File exists:', !!file);
    
    // Process file if provided
    if (file) {
      try {
        console.log('Uploading file to database:', file.name);
        await addFile(file);
        console.log('File added to database successfully');
        
        console.log('Extracting content from file:', file.name);
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Content extraction failed: ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        fileContent = uploadData.content;
        console.log('Extracted content length:', fileContent.length);
        
        if (uploadData.is_image && uploadData.ocr_method) {
          console.log(`✅ Image processed with ${uploadData.ocr_method} OCR`);
        }
      } catch (error) {
        console.error('File processing error:', error);
        console.warn('Continuing with file upload despite error...');
        fileContent = `[File: ${file.name} - Content extraction failed]`;
      }
    }

    console.log('🔥 About to send API request');
    console.log('🔥 Conversation ID:', conversationId);

    try {
      const analyzeBody = fileContent ? 
        `${effectiveMessage}\n\n=== FILE CONTENT ===\n${fileContent}\n=== END FILE CONTENT ===` : 
        effectiveMessage;
      console.log('📤 Sending to analyze (STREAMING):', analyzeBody.substring(0, 100) + '...');

      // Enable streaming in the request
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: analyzeBody, 
          session_id: conversationId,
          streaming: true
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Analysis failed:', errorText);
        throw new Error(`Analysis failed: ${errorText}`);
      }

      // Create placeholder assistant message
      const assistantMessageId = Date.now() + 1;
      let streamingContent = '';
      
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        analysis: null,
        timestamp: new Date(),
        isStreaming: true
      };

      // Add assistant message immediately with empty content
      const messagesWithStreaming = [...newMessages, assistantMessage];
      updateCurrentMessages(messagesWithStreaming, conversationId);
      console.log('📝 Created streaming assistant message placeholder');
      
      // Mark as streaming
      isStreamingRef.current = true;

      // Read the stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream complete');
          isStreamingRef.current = false;
          setIsLoading(false);
          
          if (streamingContent && !messagesWithStreaming.find(m => m.id === assistantMessageId && !m.isStreaming)) {
            const finalMessages = [...newMessages, {
              id: assistantMessageId,
              type: 'assistant' as const,
              content: streamingContent,
              analysis: null,
              timestamp: new Date(),
              isStreaming: false
            }];
            updateCurrentMessages(finalMessages, conversationId);
          }
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        console.log('📦 Raw buffer:', buffer.substring(0, 100));
        
        // Parse SSE format (data: {json}\n\n)
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              console.log('🔍 Parsing:', jsonStr);
              const data = JSON.parse(jsonStr);
              
              if (data.chunk) {
                streamingContent += data.chunk;
                
                const updatedMessages = [...newMessages, {
                  id: assistantMessageId,
                  type: 'assistant' as const,
                  content: streamingContent,
                  analysis: null,
                  timestamp: new Date(),
                  isStreaming: true
                }];
                
                updateCurrentMessages(updatedMessages, conversationId);
                setForceRender(prev => prev + 1);
              }
              
              if (data.done) {
                console.log('✅ Streaming done signal received');
                isStreamingRef.current = false;
                setIsLoading(false);
                
                const finalMessages = [...newMessages, {
                  id: assistantMessageId,
                  type: 'assistant' as const,
                  content: data.full_response || streamingContent,
                  analysis: data.analysis || null,
                  timestamp: new Date(),
                  isStreaming: false
                }];
                
                updateCurrentMessages(finalMessages, conversationId);
                console.log('✅ Final content length:', (data.full_response || streamingContent).length);
              }
              
              if (data.error) {
                console.error('❌ Stream error:', data.error);
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Line:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('Analyze error:', error);
      isStreamingRef.current = false;
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        isError: true,
        timestamp: new Date()
      };

      updateCurrentMessages([...newMessages, errorMessage], conversationId);
    } finally {
      isStreamingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleShareConversation = async () => {
    try {
      if (!currentConversationId || !currentConversation) return;
      const body = {
        conversation_id: currentConversationId,
        messages: currentConversation.messages,
        analysis_summary: null
      };
      const resp = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      const shareUrl = data.shareable_url || `/shared/${data.share_id}`;
      alert(`Share link created: ${shareUrl}`);
    } catch (e) {
      console.error('Share failed:', e);
      alert('Failed to create share link.');
    }
  };

  const handleExportConversation = async (format = 'markdown') => {
    try {
      if (!currentConversationId || !currentConversation) return;
      const resp = await fetch(`/api/export/${currentConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentConversation.messages, format })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      const content = data.content || '';
      const filenameBase = (currentConversation.title || 'conversation').replace(/[^a-z0-9\-_]+/gi, '_');
      const filename = `${filenameBase}.${format === 'markdown' ? 'md' : 'json'}`;
      const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
      alert('Failed to export conversation.');
    }
  };

  const generateTitleFromMessage = (message: string): string => {
    let title = message.trim();
    title = title.replace(/^(please|can you|could you|help me|i need|analyze|review|check)/i, '');
    title = title.trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return title || 'New Chat';
  };

  const handleRegenerateResponse = async (assistantMessage: Message) => {
    console.log('🔄 Regenerating response for message:', assistantMessage.id);
    
    const messageIndex = messages.findIndex(msg => msg.id === assistantMessage.id);
    if (messageIndex <= 0) {
      console.error('❌ Invalid message index for regeneration');
      return;
    }
    
    const userMessage = messages[messageIndex - 1];
    if (userMessage.type !== 'user') {
      console.error('❌ Previous message is not a user message');
      return;
    }
    
    // Remove the assistant message and all messages after it
    const updatedMessages = messages.slice(0, messageIndex);
    updateCurrentMessages(updatedMessages, currentConversationId);
    setIsLoading(true);
    setForceRender(prev => prev + 1);
    
    try {
      const analyzeBody = userMessage.file ? 
        `${userMessage.content}\n\n=== FILE CONTENT ===\n${userMessage.file.content}\n=== END FILE CONTENT ===` : 
        userMessage.content;
      
      console.log('📤 Regenerating response (STREAMING):', analyzeBody.substring(0, 100) + '...');
      
      // Use streaming API like handleSendMessage
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: analyzeBody, 
          session_id: currentConversationId,
          streaming: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Analysis failed:', errorText);
        throw new Error(`Analysis failed: ${errorText}`);
      }

      // Create placeholder assistant message
      const assistantMessageId = Date.now() + 1;
      let streamingContent = '';
      
      const newAssistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        analysis: null,
        timestamp: new Date(),
        isStreaming: true
      };

      // Add assistant message immediately with empty content
      const messagesWithStreaming = [...updatedMessages, newAssistantMessage];
      updateCurrentMessages(messagesWithStreaming, currentConversationId);
      console.log('📝 Created streaming assistant message placeholder for regeneration');
      
      // Mark as streaming
      isStreamingRef.current = true;

      // Read the stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream complete');
          isStreamingRef.current = false;
          setIsLoading(false);
          
          if (streamingContent && !messagesWithStreaming.find(m => m.id === assistantMessageId && !m.isStreaming)) {
            const finalMessages = [...updatedMessages, {
              id: assistantMessageId,
              type: 'assistant' as const,
              content: streamingContent,
              analysis: null,
              timestamp: new Date(),
              isStreaming: false
            }];
            updateCurrentMessages(finalMessages, currentConversationId);
          }
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE format (data: {json}\n\n)
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              const data = JSON.parse(jsonStr);
              
              if (data.chunk) {
                streamingContent += data.chunk;
                
                const messagesWithUpdatedContent = [...updatedMessages, {
                  id: assistantMessageId,
                  type: 'assistant' as const,
                  content: streamingContent,
                  analysis: null,
                  timestamp: new Date(),
                  isStreaming: true
                }];
                
                updateCurrentMessages(messagesWithUpdatedContent, currentConversationId);
                setForceRender(prev => prev + 1);
              }
              
              if (data.done) {
                console.log('✅ Streaming done signal received');
                isStreamingRef.current = false;
                setIsLoading(false);
                
                const finalMessages = [...updatedMessages, {
                  id: assistantMessageId,
                  type: 'assistant' as const,
                  content: data.full_response || streamingContent,
                  analysis: data.analysis || null,
                  timestamp: new Date(),
                  isStreaming: false
                }];
                
                updateCurrentMessages(finalMessages, currentConversationId);
                console.log('✅ Final content length:', (data.full_response || streamingContent).length);
              }
              
              if (data.error) {
                console.error('❌ Stream error:', data.error);
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Line:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Regenerate error:', error);
      isStreamingRef.current = false;
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I apologize, but I encountered an error regenerating the response. Please try again.',
        isError: true,
        timestamp: new Date()
      };

      updateCurrentMessages([...updatedMessages, errorMessage], currentConversationId);
    } finally {
      isStreamingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleEditLastUserMessage = async (newText: string) => {
    console.log('✏️ Editing last user message:', newText);
    
    try {
      // Find the last user message index
      let lastUserIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].type === 'user') { 
          lastUserIdx = i; 
          break; 
        }
      }
      if (lastUserIdx === -1) {
        console.error('❌ No user message found to edit');
        return;
      }

      // Update the user message with new text
      const editedUser = { ...messages[lastUserIdx], content: newText };
      
      // Remove all messages after the edited user message (including old assistant response)
      const updatedMessages = messages.slice(0, lastUserIdx);
      updatedMessages.push(editedUser);

      console.log('📝 Updated messages (removed old assistant response):', updatedMessages.length);
      updateCurrentMessages(updatedMessages, currentConversationId);
      setIsLoading(true);
      setForceRender(prev => prev + 1);

      // Prepare the message body
      const analyzeBody = editedUser.file ? 
        `${editedUser.content}\n\n=== FILE CONTENT ===\n${editedUser.file.content || ''}\n=== END FILE CONTENT ===` : 
        editedUser.content;

      console.log('📤 Sending edited message to analyze (STREAMING):', analyzeBody.substring(0, 100) + '...');

      // Use streaming API like handleSendMessage
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: analyzeBody, 
          session_id: currentConversationId,
          streaming: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Analysis failed:', errorText);
        throw new Error(`Analysis failed: ${errorText}`);
      }

      // Create placeholder assistant message
      const assistantMessageId = Date.now() + 1;
      let streamingContent = '';
      
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        analysis: null,
        timestamp: new Date(),
        isStreaming: true
      };

      // Add assistant message immediately with empty content
      const messagesWithStreaming = [...updatedMessages, assistantMessage];
      updateCurrentMessages(messagesWithStreaming, currentConversationId);
      console.log('📝 Created streaming assistant message placeholder');
      
      // Mark as streaming
      isStreamingRef.current = true;

      // Read the stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream complete');
          isStreamingRef.current = false;
          setIsLoading(false);
          
          if (streamingContent && !messagesWithStreaming.find(m => m.id === assistantMessageId && !m.isStreaming)) {
            const finalMessages = [...updatedMessages, {
              id: assistantMessageId,
              type: 'assistant' as const,
              content: streamingContent,
              analysis: null,
              timestamp: new Date(),
              isStreaming: false
            }];
            updateCurrentMessages(finalMessages, currentConversationId);
          }
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE format (data: {json}\n\n)
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              const data = JSON.parse(jsonStr);
              
              if (data.chunk) {
                streamingContent += data.chunk;
                
                const messagesWithUpdatedContent = [...updatedMessages, {
                  id: assistantMessageId,
                  type: 'assistant' as const,
                  content: streamingContent,
                  analysis: null,
                  timestamp: new Date(),
                  isStreaming: true
                }];
                
                updateCurrentMessages(messagesWithUpdatedContent, currentConversationId);
                setForceRender(prev => prev + 1);
              }
              
              if (data.done) {
                console.log('✅ Streaming done signal received');
                isStreamingRef.current = false;
                setIsLoading(false);
                
                const finalMessages = [...updatedMessages, {
                  id: assistantMessageId,
                  type: 'assistant' as const,
                  content: data.full_response || streamingContent,
                  analysis: data.analysis || null,
                  timestamp: new Date(),
                  isStreaming: false
                }];
                
                updateCurrentMessages(finalMessages, currentConversationId);
                console.log('✅ Final content length:', (data.full_response || streamingContent).length);
              }
              
              if (data.error) {
                console.error('❌ Stream error:', data.error);
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Line:', line);
            }
          }
        }
      }

    } catch (e) {
      console.error('❌ Edit-resend failed:', e);
      isStreamingRef.current = false;
      setIsLoading(false);
      
      // Find the last user message index again for error handling
      let lastUserIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].type === 'user') { 
          lastUserIdx = i; 
          break; 
        }
      }
      
      if (lastUserIdx !== -1) {
        const editedUser = { ...messages[lastUserIdx], content: newText };
        const updatedMessages = messages.slice(0, lastUserIdx);
        updatedMessages.push(editedUser);
        
        const errorMessage: Message = {
          id: Date.now() + 1,
          type: 'assistant',
          content: 'I apologize, but I encountered an error processing your edited message. Please try again.',
          isError: true,
          timestamp: new Date()
        };

        updateCurrentMessages([...updatedMessages, errorMessage], currentConversationId);
      } else {
        alert('Failed to resend edited message: ' + (e as Error).message);
      }
    } finally {
      isStreamingRef.current = false;
      setIsLoading(false);
    }
  };

  // If no current conversation, show homepage with centered input - Grok style
  if (!currentConversationId) {
    return (
      <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="w-full max-w-4xl px-6 flex flex-col items-center">
            {/* Modern EyeQ Logo - Vision-Inspired Design */}
            <div className="mb-10 flex flex-col items-center" data-tour="eyeq-logo">
              <div className="flex flex-col items-center gap-4 group">
                {/* Eye-Inspired Icon */}
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-[#003595] opacity-20 blur-2xl animate-pulse"></div>
                  
                  {/* Main icon container */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Eye shape - outer ellipse */}
                    <svg 
                      width="80" 
                      height="80" 
                      viewBox="0 0 80 80" 
                      className="absolute inset-0"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Eye outline */}
                      <ellipse 
                        cx="40" 
                        cy="40" 
                        rx="32" 
                        ry="20" 
                        fill="none" 
                        stroke="url(#eyeGradient)" 
                        strokeWidth="2.5"
                        className="transition-all duration-500 group-hover:stroke-[3]"
                      />
                      {/* Iris/Pupil */}
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="12" 
                        fill="url(#irisGradient)"
                        className="transition-all duration-500 group-hover:r-[14]"
                      />
                      {/* Highlight */}
                      <circle 
                        cx="45" 
                        cy="35" 
                        r="4" 
                        fill="rgba(255,255,255,0.6)"
                        className="transition-opacity duration-300 group-hover:opacity-80"
                      />
                      {/* Gradient definitions */}
                      <defs>
                        <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#003595" />
                          <stop offset="50%" stopColor="#1a4ba3" />
                          <stop offset="100%" stopColor="#003595" />
                        </linearGradient>
                        <radialGradient id="irisGradient" cx="50%" cy="50%">
                          <stop offset="0%" stopColor="#003595" />
                          <stop offset="70%" stopColor="#1a4ba3" />
                          <stop offset="100%" stopColor="#002a7a" />
                        </radialGradient>
                      </defs>
                    </svg>
                    
                    {/* Animated scan line effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent eye-scan-animation"></div>
                    </div>
                  </div>
                  
                  {/* Subtle shadow */}
                  <div className="absolute -inset-2 rounded-full bg-[#003595] opacity-10 blur-md -z-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                
                {/* Typography */}
                <div className="flex flex-col items-center">
                  <h1 className="text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-[#003595] via-[#1a4ba3] to-[#003595] bg-clip-text text-transparent bg-[length:200%_100%] text-shimmer-animation">
                      EyeQ
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Input Area - Compact */}
            <div className="w-full mb-4 flex justify-center">
              <div className="w-full max-w-2xl" data-tour="input-area">
                <InputArea
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  hasMessages={false}
                  sidebarCollapsed={sidebarCollapsed}
                  sidebarOpen={sidebarOpen}
                  isHomepage={true}
                />
              </div>
            </div>

            {/* Ready-made Prompt Examples */}
            <div className="flex flex-wrap gap-2.5 justify-center items-center w-full max-w-2xl" data-tour="prompt-examples">
              <button
                onClick={() => handleSendMessage('Review this promotional claim and tell me if it meets Medical, Legal, and Regulatory standards. Flag what needs revision and propose compliant alternatives.')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#003595] dark:bg-[#212121] hover:bg-[#002a7a] dark:hover:bg-[#1a1a1a] border border-[#003595] dark:border-[#1a1a1a] text-white dark:text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} className="text-white dark:text-white flex-shrink-0" />
                <span className="text-xs font-medium text-white dark:text-white text-center">Check MLR Compliance</span>
              </button>
              <button
                onClick={() => handleSendMessage('Take this draft and rewrite it into a version that would pass a standard MLR review without losing the main message.')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#003595] dark:bg-[#212121] hover:bg-[#002a7a] dark:hover:bg-[#1a1a1a] border border-[#003595] dark:border-[#1a1a1a] text-white dark:text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit size={16} className="text-white dark:text-white flex-shrink-0" />
                <span className="text-xs font-medium text-white dark:text-white text-center">Rewrite for MLR</span>
              </button>
              <button
                onClick={() => handleSendMessage('Scan this draft and highlight any phrases or sections that pose MLR or promotional risk. Suggest safer wording.')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#003595] dark:bg-[#212121] hover:bg-[#002a7a] dark:hover:bg-[#1a1a1a] border border-[#003595] dark:border-[#1a1a1a] text-white dark:text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle size={16} className="text-white dark:text-white flex-shrink-0" />
                <span className="text-xs font-medium text-white dark:text-white text-center">Detect Risk</span>
              </button>
              <button
                onClick={() => handleSendMessage('Review the safety information I included and tell me what\'s missing based on typical regulatory expectations.')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#003595] dark:bg-[#212121] hover:bg-[#002a7a] dark:hover:bg-[#1a1a1a] border border-[#003595] dark:border-[#1a1a1a] text-white dark:text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield size={16} className="text-white dark:text-white flex-shrink-0" />
                <span className="text-xs font-medium text-white dark:text-white text-center">Check Safety Statements</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering ChatInterface with:', {
    currentConversationId,
    messagesLength: messages.length,
    messages: messages,
    currentConversation
  });

  return (
    <div 
      className="flex flex-col h-full bg-transparent transition-all duration-300 relative overflow-hidden" 
      key={`chat-${currentConversationId}-${messages.length}-${forceRender}`}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Clean background - no gradients */}
          
          {/* Clean background - no floating gradients */}
          
            <div className="w-full max-w-4xl px-6 relative z-10 flex flex-col items-center">
            <InputArea
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              hasMessages={false}
              sidebarCollapsed={sidebarCollapsed}
              sidebarOpen={sidebarOpen}
            />
            <PromptSuggestions
              onSelectPrompt={(prompt) => handleSendMessage(prompt, null)}
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : (
        <>
          <div 
            className="flex-1 overflow-y-auto pb-32 relative"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 py-6">
              {messages.map((message, index) => {
                // Find the last user message index
                let lastUserMessageIndex = -1;
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].type === 'user') {
                    lastUserMessageIndex = i;
                    break;
                  }
                }
                
                return (
                  <div key={message.id} className="animate-message-in">
                    <MessageBubble
                      message={message}
                      isLast={index === messages.length - 1}
                      onRegenerate={() => handleRegenerateResponse(message)}
                      onShare={handleShareConversation}
                      onExport={handleExportConversation}
                      onEdit={handleEditLastUserMessage}
                      isLastUserMessage={message.type === 'user' && index === lastUserMessageIndex}
                      conversationId={currentConversationId}
                    />
                  </div>
                );
              })}
              {isLoading && (
                <div className="animate-message-in">
                  <MessageBubble
                    message={{
                      id: 'loading',
                      type: 'assistant',
                      content: '',
                      isLoading: true,
                      timestamp: new Date()
                    }}
                    isLast={false}
                  />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Modern scroll to bottom button - centered and aligned with input area */}
          {showScrollButton && (
            <div 
              className={`fixed bottom-28 right-0 flex justify-center z-10 pointer-events-none transition-all duration-300 max-lg:left-0 ${
                sidebarCollapsed 
                  ? 'lg:left-[64px]' 
                  : 'lg:left-[256px]'
              }`}
            >
              <div className="max-w-[768px] w-full px-6 flex justify-center pointer-events-none">
                <button 
                  className="w-12 h-12 rounded-full bg-[#003595] hover:bg-[#002a7a] dark:bg-[#003595] dark:hover:bg-[#002a7a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group pointer-events-auto flex items-center justify-center"
                  onClick={scrollToBottomManually}
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown size={18} className="text-white transition-colors duration-200" />
                </button>
              </div>
            </div>
          )}
          
          <InputArea
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            hasMessages={messages.length > 0}
            sidebarCollapsed={sidebarCollapsed}
            sidebarOpen={sidebarOpen}
          />
        </>
      )}
    </div>
  );
};

export default ChatInterface;

