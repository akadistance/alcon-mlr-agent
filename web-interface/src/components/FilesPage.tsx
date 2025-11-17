import React, { useState, useContext, useCallback } from 'react';
import { ChatContext } from '../ChatContext';
import { 
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Image as ImageIcon,
  Upload,
  Download,
  Trash2
} from 'lucide-react';
import { UploadedFile } from '../types';

const FilesPage: React.FC = () => {
  const { uploadedFiles, addFile, deleteFile } = useContext(ChatContext);
  const [dragActive, setDragActive] = useState(false);
  const [filter] = useState('all');
  const [sortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => addFile(file));
    }
  }, [addFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      files.forEach(file => addFile(file));
    }
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.type?.startsWith('image/')) {
      return <ImageIcon size={20} className="text-blue-500" />;
    }
    return <FileText size={20} className="text-gray-600 dark:text-gray-400" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const response = await fetch(`/api/files/${file.id}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await deleteFile(file.id);
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete file');
      }
    }
  };

  const filteredFiles = uploadedFiles.filter(file => {
    // Filter by type
    let typeMatch = true;
    if (filter === 'images') typeMatch = file.type?.startsWith('image/');
    if (filter === 'documents') typeMatch = !file.type?.startsWith('image/');
    
    // Filter by search term
    const searchMatch = searchTerm === '' || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return b.size - a.size;
    return 0;
  });

  return (
    <div className="h-full bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Files</h1>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-sm transition-colors">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-sm transition-colors">
                <ArrowUpDown size={16} />
                <span>Sort</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-73px)] overflow-y-auto">
        {uploadedFiles.length === 0 ? (
          /* Empty State */
          <div 
            className={`flex flex-col items-center justify-center h-full transition-all ${
              dragActive ? 'bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-500' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="p-8 rounded-full bg-gray-100 dark:bg-zinc-800 mb-4">
              <Upload size={48} className="text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload your files</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
              Drag and drop files here or use the upload option below to get started
            </p>
            
            <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors shadow-md hover:shadow-lg">
              <Upload size={20} />
              <span className="font-medium">Upload Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.pptx"
              />
            </label>
          </div>
        ) : (
          /* Files Layout */
          <div className="flex gap-6 p-6 h-full">
            {/* Left Panel - File List */}
            <div className="flex-1 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {sortedFiles.length} file{sortedFiles.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-y-auto max-h-[calc(100%-53px)]">
                {sortedFiles.map((file, index) => (
                  <div 
                    key={file.id || index} 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700/50 border-b border-gray-100 dark:border-zinc-700/50 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name || 'Unknown File'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {file.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        title="Download"
                      >
                        <Download size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - File Operations */}
            <div className="w-80 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create something new
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-all group">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Upload size={24} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Files</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.pptx"
                  />
                </label>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-all group">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                    <FileText size={24} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-all group">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                    <ImageIcon size={24} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;

