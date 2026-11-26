import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Sparkles, MessageSquare, Send, Mic, MicOff, X, ChevronDown,
  ChevronUp, Plus, Settings, HelpCircle, Copy, Check, AlertCircle,
  Image as ImageIcon, FileText, Zap, Layers, Globe, Smartphone,
  Trash2, Edit, Search, Filter, Clock, Calendar, Heart, Star,
  ArrowUpRight, Download, Share2, MoreHorizontal, RotateCcw,
  Sun, Moon, Sparkles as SparklesIcon, Camera, Layers as LayersIcon
} from 'lucide-react';
import { cn } from '@utils/cn';
import { MobileLayout } from '@shared/components/MobileLayout';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
  isStreaming?: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

interface MessageMetadata {
  tokens?: number;
  model?: string;
  toolsUsed?: string[];
  confidence?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  topic?: string;
}

const QUICK_ACTIONS = [
  { label: 'Process Image', labelAr: 'معالجة صورة', icon: ImageIcon, action: 'photo', description: 'Remove background, blur plate, enhance' },
  { label: 'Write Ad', labelAr: 'كتابة إعلان', icon: FileText, action: 'ad', description: 'Title, description, specs for car' },
  { label: 'Manage Inventory', labelAr: 'إدارة مخزون', icon: LayersIcon, action: 'inventory', description: 'Add, update, organize vehicles' },
  { label: 'Search Cars', labelAr: 'بحث سيارات', icon: Search, action: 'search', description: 'Compare, prices, specifications' },
  { label: 'Marketing Plan', labelAr: 'خطة تسويقية', icon: SparklesIcon, action: 'marketing', description: 'Posts, campaigns, scheduling' },
  { label: 'Tasks & Calendar', labelAr: 'مهام وتقويم', icon: Calendar, action: 'tasks', description: 'Reminders, appointments, follow-up' },
];

export const MobileAIAssistant = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('mshkur-ai-sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mshkur-ai-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessionId, sessions]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Welcome! I\'m your MSHKUR AI Assistant. How can I help you today?',
          timestamp: Date.now(),
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowQuickActions(true);
    setShowSidebar(false);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (!activeSessionId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, userMessage], updatedAt: Date.now(), title: s.messages.length === 1 ? input.slice(0, 30) : s.title }
        : s
    ));

    setInput('');
    setAttachments([]);
    setShowQuickActions(false);
    setIsStreaming(true);

    await simulateAIResponse(activeSessionId, userMessage.content);
  }, [input, attachments, activeSessionId]);

  const simulateAIResponse = async (sessionId: string, userContent: string) => {
    const responses = [
      'I understand your request. Let me help you with that.',
      'Sure, I can assist with this task. Let me start...',
      'I\'ll work on this for you now. One moment...',
      'Great, I have the solution for you.',
    ];

    const assistantMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, messages: [...s.messages, assistantMessage] } : s
    ));

    const response = responses[Math.floor(Math.random() * responses.length)];
    for (let i = 0; i <= response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, messages: s.messages.map(m => m.id === assistantMessage.id ? { ...m, content: response.slice(0, i) } : m) }
          : s
      ));
    }

    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, messages: s.messages.map(m => m.id === assistantMessage.id ? { ...m, isStreaming: false } : m) }
        : s
    ));

    setIsStreaming(false);
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    const prompts: Record<string, string> = {
      photo: 'I want to process a car image: remove background, blur license plate, enhance lighting',
      ad: 'Write a professional ad for Toyota Camry 2023, 30k km, 120k SAR',
      inventory: 'Add new car to inventory: Honda Accord 2024, Blue, Automatic, 150k SAR',
      search: 'Search for sedan cars under 100k SAR, 2022 or newer',
      marketing: 'Create weekly marketing plan for 20 car inventory',
      tasks: 'Remind me to follow up with client Ahmed tomorrow at 10 AM',
    };
    setInput(prompts[action.action] || '');
    handleSendMessage();
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      setActiveSessionId(remaining[0]?.id || null);
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map(file => ({
      id: `att-${Date.now()}-${Math.random()}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MobileLayout showBottomNav={false} currentTab="ai" onTabChange={() => {}}>
      {/* Header */}
      <header className="sticky top-16 z-30 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="container-mshkur">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-16 sm:h-14">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-heading-lg font-bold text-surface-900 dark:text-white">AI Assistant</h1>
                <p className="text-body-sm text-surface-500">Your Copy. Your Secretary. Your Friend.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={createNewSession}
                className="btn btn-primary gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="btn-icon p-2"
                aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col overflow-hidden md:relative md:z-auto md:w-72 md:lg:w-80"
            >
              {/* Quick Actions */}
              {showQuickActions && (
                <div className="p-4 border-b border-surface-200 dark:border-surface-800">
                  <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    Quick Actions
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {QUICK_ACTIONS.map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.action}
                          onClick={() => handleQuickAction(action)}
                          className="btn btn-secondary p-3 h-auto justify-start gap-3 text-start hover:border-brand-300 dark:hover:border-brand-900/50"
                        >
                          <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 text-start">
                            <p className="font-medium text-body-sm">{action.labelAr || action.label}</p>
                            <p className="text-body-xs text-surface-500">{action.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
                  <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">Conversations</h3>
                  <span className="badge badge-neutral">{sessions.length}</span>
                </div>
                <div className="p-2 space-y-1">
                  {sessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => { setActiveSessionId(session.id); setShowSidebar(false); }}
                      className={cn(
                        'w-full p-3 rounded-xl text-start transition-all',
                        activeSessionId === session.id
                          ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium text-body-sm truncate',
                            activeSessionId === session.id ? 'text-brand-700 dark:text-brand-300' : 'text-surface-900 dark:text-white'
                          )}>
                            {session.title}
                          </p>
                          <p className="text-body-xs text-surface-500 mt-0.5">
                            {new Date(session.updatedAt).toLocaleDateString()} • {session.messages.length} messages
                          </p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteSession(session.id); }}
                          className="btn-icon p-1 text-surface-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-surface-200 dark:border-surface-800">
                <div className="flex items-center gap-2 text-body-xs text-surface-500">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  <span>MSHKUR AI • Powered by Advanced Models</span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">
                  {activeSession?.title || 'Select a chat or start new'}
                </h2>
                <p className="text-body-xs text-surface-500">
                  {activeSession ? `${activeSession.messages.length} messages • ${new Date(activeSession.updatedAt).toLocaleDateString()}` : 'No active conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn-icon p-2" aria-label="Search in chat"><Search className="h-4 w-4" /></button>
              <button className="btn-icon p-2" aria-label="Export chat"><Download className="h-4 w-4" /></button>
              <button className="btn-icon p-2" aria-label="More"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6" role="log" aria-live="polite">
            {activeMessages.length === 0 && !activeSessionId && (
              <EmptyState onNewChat={createNewChat} />
            )}

            {activeMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === activeMessages.length - 1}
                onCopy={() => navigator.clipboard.writeText(message.content)}
                onRetry={() => message.role === 'assistant' && regenerateResponse(message.id)}
              />
            ))}

            {isStreaming && (
              <TypingIndicator />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 backdrop-blur">
            {attachments.length > 0 && (
              <div className="p-2 px-4 border-b border-surface-200 dark:border-surface-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-body-xs text-surface-500">Attachments:</span>
                {attachments.map(att => (
                  <span key={att.id} className="badge badge-primary flex items-center gap-1">
                    {att.type === 'image' ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {att.name}
                    <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="p-4">
              <div className="flex items-end gap-3">
                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="btn-icon p-2 text-surface-400 hover:text-brand-600 flex-shrink-0"
                  aria-label="Attach file"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={activeSessionId ? 'Type your message... (Enter to send, Shift+Enter for new line)' : 'Start a new conversation first'}
                  disabled={!activeSessionId || isStreaming}
                  rows={1}
                  className="flex-1 input resize-none min-h-[44px] max-h-32"
                  aria-label="Your message"
                />

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={handleVoiceToggle}
                    className={cn(
                      'btn-icon p-2',
                      isVoiceMode ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-surface-400 hover:text-brand-600'
                    )}
                    aria-label={isVoiceMode ? 'Stop voice input' : 'Start voice input'}
                    aria-pressed={isVoiceMode}
                  >
                    {isVoiceMode ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() && attachments.length === 0 || isStreaming || !activeSessionId}
                    className={cn(
                      'btn-icon p-2 rounded-xl transition-all',
                      input.trim() || attachments.length > 0
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'bg-surface-100 text-surface-400 dark:bg-surface-800'
                    )}
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-body-xs text-surface-500 text-center mt-2">
                Assistant understands MSHKUR context: photos, ads, dealerships. Press Enter to send.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

const EmptyState = ({ onNewChat }: { onNewChat: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full text-center px-6"
  >
    <div className="mb-6">
      <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
        <Bot className="h-10 w-10 text-white" />
      </div>
    </div>
    <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white mb-2">Welcome to MSHKUR Assistant</h2>
    <p className="text-body-md text-surface-500 mb-8 max-w-md">
      I\'m your smart assistant integrated with all MSHKUR apps. I can help with image processing, writing ads, managing dealerships, and more.
    </p>
    <button onClick={onNewChat} className="btn btn-primary gap-2 px-8">
      <Sparkles className="h-5 w-5" />
      Start New Chat
    </button>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-body-sm text-surface-500">
      <span className="flex items-center gap-1.5"><ImageIcon className="h-4 w-4" />Images</span>
      <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" />Ads</span>
      <span className="flex items-center gap-1.5"><LayersIcon className="h-4 w-4" />Dealerships</span>
      <span className="flex items-center gap-1.5"><Search className="h-4 w-4" />Search</span>
    </div>
  </motion.div>
);

const MessageBubble = ({
  message,
  isLast,
  onCopy,
  onRetry,
}: {
  message: Message;
  isLast: boolean;
  onCopy: () => void;
  onRetry: () => void;
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : '')}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn(
        'flex-1 max-w-[85%]',
        isUser ? 'text-end' : ''
      )}>
        <div className={cn(
          'relative rounded-2xl p-4',
          isUser
            ? 'bg-brand-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white border border-surface-200 dark:border-surface-800 rounded-bl-sm shadow-sm'
        )}>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {message.attachments.map(att => (
                <span key={att.id} className="badge badge-secondary">
                  {att.type === 'image' ? '🖼️' : '📎'} {att.name}
                </span>
              ))}
            </div>
          )}

          <div className={cn(
            'whitespace-pre-wrap break-words',
            message.isStreaming && 'pr-8'
          )}>
            {message.content || (message.isStreaming && <span className="opacity-50">...</span>)}
          </div>

          {message.isStreaming && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ ...(!isUser ? {} : { marginLeft: 'auto' }) }}>
          <span className="text-body-xs text-surface-400">{new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          {isAssistant && (
            <>
              <button onClick={onCopy} className="btn-icon p-1 text-surface-400 hover:text-brand-600" aria-label="Copy"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={onRetry} className="btn-icon p-1 text-surface-400 hover:text-brand-600" aria-label="Regenerate"><RotateCcw className="h-3.5 w-3.5" /></button>
            </>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
          <span className="text-body-sm font-medium text-surface-600 dark:text-surface-400">You</span>
        </div>
      )}
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3"
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
      <Bot className="h-4 w-4 text-white" />
    </div>
    <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-800 rounded-bl-sm shadow-sm">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </motion.div>
);

const regenerateResponse = (messageId: string) => {
  console.log('Regenerate response for:', messageId);
};

const createNewChat = () => {
  // This will be handled by the parent component
};

import { useState } from 'react';
import { LayersIcon, Camera, FileText, Search, Sparkles, Calendar, Sparkles as SparklesIcon, Copy, RotateCcw, Send, Mic, MicOff, X, ChevronDown, ChevronUp, Plus, Settings, HelpCircle, Image as ImageIcon, FileText, Zap, Layers, Globe, Smartphone, Trash2, Edit, Search as SearchIcon, Filter, Clock, Calendar, Heart, Star, ArrowUpRight, Download, Share2, MoreHorizontal, RotateCcw, Sun, Moon, Sparkles as SparklesIcon2, Bot, Camera as CameraIcon, Store, Sparkles as SparklesIcon3, MessageSquare, Zap, Settings as SettingsIcon } from 'lucide-react';