// Shared type definitions for the EyeQ application

export interface Message {
  id: number | string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    content?: string;
  };
  attachments?: Attachment[];
  analysis?: Analysis | null;
  isLoading?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
  timestamp: Date;
}

export interface Attachment {
  id: string;
  type: 'text' | 'file' | 'image';
  title: string;
  content?: string;
  sourceMessageId?: number | string;
}

export interface Analysis {
  summary?: string;
  approved_claims?: string[];
  issues?: Issue[];
  tools_used?: string[];
}

export interface Issue {
  issue?: string;
  description?: string;
  suggestion?: string;
  reference?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
}

export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  conversationId?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: string;
  content: string;
  isLocal: boolean;
}

export type Theme = 'light' | 'dark';

