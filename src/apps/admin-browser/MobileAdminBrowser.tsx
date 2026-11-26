import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Search, Globe, Terminal, Database, GitBranch, BookOpen,
  Settings, Shield, Zap, Sparkles, ArrowRight, ArrowLeft, RefreshCw,
  Maximize, Minimize, X, Plus, FolderOpen, FileCode, FileText,
  Image as ImageIcon, Video, Monitor, Smartphone, Tablet, Layers,
  Bug, CheckCircle, AlertCircle, Clock, Trash2, Edit, Eye, Download,
  Upload, Link, ExternalLink, ChevronDown, ChevronRight, MoreHorizontal,
  Filter, SortAsc, Copy, Code, Server, Cpu, MemoryStick, HardDrive,
  Network, Wifi, Bluetooth, Usb, MonitorCheck, Activity, PieChart,
  BarChart3, TrendingUp, Users, Bell, Mail, MessageSquare, Phone,
  MapPin, Calendar, Clock as ClockIcon, DollarSign, CreditCard,
  Shield as ShieldIcon, Key, Lock, Unlock, User, Users, Crown,
  Award, Star, Heart, ThumbsUp, Flag, Bookmark, Share2, Print,
  Redo, Undo, ZoomIn, ZoomOut, RotateCcw, RotateCw, Crop,
  Scissors, PenTool, Type, Palette, Brush, Eraser, Eyedropper,
  Move, Hand, Zoom, Minimize2, Maximize2, Fullscreen, Grid,
  List, Columns, Rows, Split, Merge, AlignLeft, AlignCenter,
  AlignRight, Justify, Indent, Outdent, Bold, Italic, Underline,
  Strikethrough, Code as CodeIcon, Quote, Heading1, Heading2,
  Heading3, List as ListIcon, CheckSquare, XSquare, Radio,
  Circle, Square, Triangle, Hexagon, Octagon, Pentagon,
  Diamond, Gem, Sparkle, Zap as ZapIcon, Cloud, CloudRain,
  CloudSnow, CloudSun, CloudLightning, CloudFog, Wind, Droplets,
  Flame, Snowflake, Sun, Moon, Star as StarIcon, Planet,
  Rocket, Satellite, Telescope, Microscope, Flask, TestTube,
  Beaker, Pill, Capsule, Bandage, Stethoscope, HeartPulse,
  Brain, Bone, Dna, Virus, Bacteria, Syringe, Thermometer,
  Weight, Ruler, Compass, Map, Navigation, Anchor, Ship,
  Plane, Car, Truck, Bus, Bike, Motorcycle, Train, Tram,
  Subway, Ferry, CableCar, Gondola, Chair, Sofa, Bed,
  Lamp, Lightbulb, Fan, Heater, AirConditioner, Humidifier,
  Purifier, Vacuum, Washer, Dryer, Fridge, Freezer, Oven,
  Microwave, Dishwasher, Blender, Toaster, Coffee, Kettle,
} from 'lucide-react';
import { cn } from '@utils/cn';
import { MobileLayout } from '@shared/components/MobileLayout';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  type: 'browser' | 'terminal' | 'editor' | 'github' | 'docs' | 'analytics' | 'settings';
}

interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: number;
  source?: string;
}

interface GitHubRepo {
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  url: string;
  isPrivate: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export const MobileAdminBrowser = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'home', title: 'Dashboard', url: 'admin:home', isActive: true, isLoading: false, canGoBack: false, canGoForward: false, type: 'browser' },
  ]);
  const [activeTabId, setActiveTabId] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<'tabs' | 'github' | 'tasks' | 'console' | 'analytics'>('tabs');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [showDevTools, setShowDevTools] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const addTab = useCallback((tab: Omit<Tab, 'id' | 'isActive'>) => {
    const newTab: Tab = {
      ...tab,
      id: `tab-${Date.now()}`,
      isActive: true,
    };
    setTabs(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTab));
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const index = prev.findIndex(t => t.id === id);
      const newTabs = prev.filter(t => t.id !== id);
      if (prev[index]?.isActive && newTabs.length > 0) {
        const newActiveIndex = Math.min(index, newTabs.length - 1);
        newTabs[newActiveIndex].isActive = true;
        setActiveTabId(newTabs[newActiveIndex].id);
      }
      return newTabs;
    });
  }, []);

  const navigate = useCallback((url: string) => {
    if (!activeTabId) return;
    setTabs(prev => prev.map(t =>
      t.id === activeTabId ? { ...t, url, title: new URL(url).hostname, isLoading: true } : t
    ));
    setIsLoading(true);
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false, canGoBack: true } : t));
      setIsLoading(false);
    }, 1000);
  }, [activeTabId]);

  const goBack = useCallback(() => {
    if (activeTab?.canGoBack) {
      // Navigate back
    }
  }, [activeTab]);

  const goForward = useCallback(() => {
    if (activeTab?.canGoForward) {
      // Navigate forward
    }
  }, [activeTab]);

  const refresh = useCallback(() => {
    if (activeTabId) {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: true } : t));
      setIsLoading(true);
      setTimeout(() => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
        setIsLoading(false);
      }, 1000);
    }
  }, [activeTabId]);

  const addConsoleMessage = useCallback((type: ConsoleMessage['type'], message: string, source?: string) => {
    const newMessage: ConsoleMessage = {
      id: `console-${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
      source,
    };
    setConsoleMessages(prev => [...prev.slice(-999), newMessage]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addConsoleMessage('info', 'Admin Browser ready', 'system');
    addConsoleMessage('log', 'Loading project configuration...', 'config');
    addConsoleMessage('log', 'Connecting to GitHub...', 'github');
    addConsoleMessage('success', 'Loaded 3 repositories', 'github');
    addConsoleMessage('warn', 'Warning: research/rebuild-blueprint-2026-11-23 branch not updated in 3 days', 'git');

    setGithubRepos([
      { name: 'MSHKUR', owner: 'alwaleedm369-hash', description: 'Main MSHKUR platform', stars: 42, forks: 8, language: 'TypeScript', updatedAt: '2026-11-20', url: 'https://github.com/alwaleedm369-hash/MSHKUR', isPrivate: true },
      { name: 'MSHKURCAR', owner: 'aimshkur', description: 'Car AI - Photo Studio & Ads', stars: 15, forks: 3, language: 'TypeScript', updatedAt: '2026-11-22', url: 'https://github.com/aimshkur/MSHKURCAR', isPrivate: true },
      { name: 'mshkur-skills', owner: 'aimshkur', description: 'MSHKUR Skills & Assistants', stars: 8, forks: 2, language: 'Python', updatedAt: '2026-11-18', url: 'https://github.com/aimshkur/mshkur-skills', isPrivate: true },
    ]);

    setTasks([
      { id: 'task-1', title: 'Build Photo Studio', description: 'Background removal, plate blur, glass tint', status: 'in-progress', priority: 'critical', assignee: 'Dev Team', tags: ['photo-studio', 'backend', 'ai'], createdAt: Date.now() - 86400000, updatedAt: Date.now() },
      { id: 'task-2', title: 'Build Ad Studio', description: 'Vehicle data, templates, export', status: 'todo', priority: 'high', assignee: 'Dev Team', tags: ['ad-studio', 'frontend'], createdAt: Date.now() - 172800000, updatedAt: Date.now() - 172800000 },
      { id: 'task-3', title: 'Build Dealer Portal', description: 'Inventory, customers, marketing', status: 'todo', priority: 'high', assignee: 'Dev Team', tags: ['dealer-portal', 'fullstack'], createdAt: Date.now() - 259200000, updatedAt: Date.now() - 259200000 },
      { id: 'task-4', title: 'Integrate AI Assistant', description: 'Context, skills, execution', status: 'review', priority: 'critical', assignee: 'AI Team', tags: ['ai-assistant', 'integration'], createdAt: Date.now() - 345600000, updatedAt: Date.now() - 86400000 },
      { id: 'task-5', title: 'Comprehensive Testing', description: 'Unit, Integration, E2E, Performance', status: 'todo', priority: 'medium', assignee: 'QA Team', tags: ['testing', 'qa'], createdAt: Date.now() - 432000000, updatedAt: Date.now() - 432000000 },
    ]);
  }, []);

  return (
    <MobileLayout
      showBottomNav={false}
      currentTab="admin"
      onTabChange={() => {}}
    >
      {/* Top Bar */}
      <header className="h-12 bg-surface-950/80 backdrop-blur-sm border-b border-surface-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-icon p-2 text-surface-400 hover:text-white hover:bg-surface-800"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <Layout className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1" role="tablist">
            {['browser', 'terminal', 'editor', 'github', 'docs', 'analytics', 'settings'].map((view, i) => {
              const icons = { browser: Globe, terminal: Terminal, editor: FileCode, github: GitBranch, docs: BookOpen, analytics: BarChart3, settings: Settings };
              const labels = { browser: 'Browser', terminal: 'Terminal', editor: 'Editor', github: 'GitHub', docs: 'Docs', analytics: 'Analytics', settings: 'Settings' };
              const Icon = icons[view as keyof typeof icons];
              return (
                <button
                  key={view}
                  onClick={() => setSidebarView(view as any)}
                  className={cn(
                    'btn-icon p-2 rounded transition-all',
                    sidebarView === view ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-white hover:bg-surface-700'
                  )}
                  role="tab"
                  aria-selected={sidebarView === view}
                  aria-label={labels[view as keyof typeof labels]}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-3xl mx-4 relative">
          <input
            type="text"
            value={urlInput || activeTab?.url || ''}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(e.target.value)}
            placeholder="Enter URL or command..."
            className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-body-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goBack} disabled={!activeTab?.canGoBack} className="btn-icon p-2" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <button onClick={goForward} disabled={!activeTab?.canGoForward} className="btn-icon p-2" aria-label="Forward"><ArrowRight className="h-5 w-5" /></button>
          <button onClick={refresh} className={cn('btn-icon p-2', isLoading && 'animate-spin')} aria-label="Refresh"><RefreshCw className="h-5 w-5" /></button>
          <button onClick={() => addTab({ title: 'New Tab', url: 'admin:home', isLoading: false, canGoBack: false, canGoForward: false, type: 'browser' })} className="btn-icon p-2" aria-label="New Tab"><Plus className="h-5 w-5" /></button>
          <button onClick={() => setShowDevTools(!showDevTools)} className={cn('btn-icon p-2', showDevTools && 'bg-brand-600')} aria-label="DevTools"><Terminal className="h-5 w-5" /></button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="fixed inset-y-0 left-0 z-50 bg-surface-950 border-r border-surface-800 flex flex-col overflow-hidden md:relative md:z-auto md:w-80"
            >
              <SidebarView
                view={sidebarView}
                tabs={tabs}
                activeTabId={activeTabId}
                githubRepos={githubRepos}
                tasks={tasks}
                consoleMessages={consoleMessages}
                onTabClick={setActiveTabId}
                onTabClose={closeTab}
                onAddTab={addTab}
                onTaskUpdate={updateTask}
                onTaskDelete={deleteTask}
                onClearConsole={clearConsole}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
          {/* Tab Bar */}
          <div className="h-10 bg-surface-950 border-b border-surface-800 flex items-center overflow-x-auto px-2" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-body-sm font-medium transition-all whitespace-nowrap relative',
                  tab.isActive
                    ? 'bg-surface-900 text-white border-b-2 border-brand-500'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                )}
                role="tab"
                aria-selected={tab.isActive}
              >
                {tab.isLoading && <div className="h-3 w-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
                <span className="truncate max-w-[150px]">{tab.title}</span>
                <button
                  onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                  className="btn-icon p-1 ml-1 opacity-0 hover:opacity-100 text-surface-500 hover:text-red-500"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>

          {/* Viewport */}
          <div className="flex-1 relative overflow-hidden" style={{ width: deviceMode === 'mobile' ? '375px' : deviceMode === 'tablet' ? '768px' : '100%' }}>
            {activeTab && (
              <TabContent
                tab={activeTab}
                deviceMode={deviceMode}
                showDevTools={showDevTools}
                onConsoleMessage={addConsoleMessage}
              />
            )}
          </div>

          {/* DevTools */}
          {showDevTools && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 300, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-surface-950 border-t border-surface-800 overflow-hidden"
            >
              <DevTools consoleMessages={consoleMessages} onClear={clearConsole} />
            </motion.div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

const SidebarView = ({
  view,
  tabs,
  activeTabId,
  githubRepos,
  tasks,
  consoleMessages,
  onTabClick,
  onTabClose,
  onAddTab,
  onTaskUpdate,
  onTaskDelete,
  onClearConsole,
}: any) => {
  const [filter, setFilter] = useState('all');

  switch (view) {
    case 'tabs':
      return (
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <h3 className="text-heading-sm font-semibold">Tabs ({tabs.length})</h3>
            <button onClick={onAddTab} className="btn-icon p-1 text-surface-400 hover:text-white"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="p-2 space-y-1 flex-1 overflow-y-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={cn(
                  'w-full p-3 rounded-lg text-start transition-all',
                  activeTabId === tab.id ? 'bg-brand-600/20 border border-brand-500/30' : 'hover:bg-surface-800'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium">{tab.title}</span>
                  <button onClick={e => { e.stopPropagation(); onTabClose(tab.id); }} className="text-surface-500 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                </div>
                <span className="text-body-xs text-surface-500 mt-1 block truncate">{tab.url}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'github':
      return (
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <h3 className="text-heading-sm font-semibold">GitHub Repos ({githubRepos.length})</h3>
            <button className="btn-icon p-1"><RefreshCw className="h-4 w-4" /></button>
          </div>
          <div className="p-2 space-y-2 flex-1 overflow-y-auto">
            {githubRepos.map(repo => (
              <div key={repo.name} className="p-3 rounded-lg bg-surface-800/50 border border-surface-700 hover:border-brand-500/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{repo.owner}/{repo.name}</span>
                      {repo.isPrivate && <Lock className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <p className="text-body-sm text-surface-400 mt-1 line-clamp-2">{repo.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-body-xs text-surface-500">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                      <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{repo.forks}</span>
                      <span className="badge badge-neutral">{repo.language}</span>
                      <span>Updated: {repo.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'tasks':
      return (
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-surface-800">
            <h3 className="text-heading-sm font-semibold mb-2">Tasks ({tasks.length})</h3>
            <div className="flex gap-1 overflow-x-auto">
              {['all', 'todo', 'in-progress', 'review', 'done'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1 rounded-full text-body-xs font-medium whitespace-nowrap',
                    filter === f ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
                  )}
                >
                  {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f === 'review' ? 'Review' : f === 'done' ? 'Done' : 'To Do'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 space-y-2 flex-1 overflow-y-auto">
            {tasks.filter(t => filter === 'all' || t.status === filter).map(task => (
              <div key={task.id} className="p-3 rounded-lg bg-surface-800/50 border border-surface-700 hover:border-brand-500/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <span className={cn('badge text-body-xs', task.priority === 'critical' ? 'bg-red-500/20 text-red-400' : task.priority === 'high' ? 'bg-amber-500/20 text-amber-400' : task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400')}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-body-sm text-surface-400 mt-1 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.tags.map(tag => <span key={tag} className="badge badge-neutral text-body-xs">{tag}</span>)}
                      {task.assignee && <span className="text-body-xs text-surface-500 flex items-center gap-1"><User className="h-3 w-3" />{task.assignee}</span>}
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={e => onTaskUpdate(task.id, { status: e.target.value as any })}
                    className="bg-surface-700 border border-surface-600 rounded px-2 py-1 text-body-xs text-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'console':
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <h3 className="text-heading-sm font-semibold">Console ({consoleMessages.length})</h3>
            <button onClick={onClearConsole} className="btn-icon p-1 text-surface-400 hover:text-white"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-body-xs">
            {consoleMessages.map(msg => (
              <div key={msg.id} className={cn('flex gap-2 p-1 rounded', msg.type === 'error' && 'bg-red-500/10', msg.type === 'warn' && 'bg-amber-500/10', msg.type === 'success' && 'bg-emerald-500/10')}>
                <span className="text-surface-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <span className={cn('font-medium', msg.type === 'error' && 'text-red-400', msg.type === 'warn' && 'text-amber-400', msg.type === 'success' && 'text-emerald-400', msg.type === 'info' && 'text-blue-400', msg.type === 'debug' && 'text-surface-500')}>
                  [{msg.type.toUpperCase()}]
                </span>
                <span className="flex-1">{msg.message}</span>
                {msg.source && <span className="text-surface-500">({msg.source})</span>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'analytics':
      return (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          <h3 className="text-heading-sm font-semibold">Performance Analytics</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Response Time', value: '142ms', trend: 'down', icon: Activity, color: 'emerald' },
              { label: 'Error Rate', value: '0.12%', trend: 'down', icon: AlertCircle, color: 'emerald' },
              { label: 'Req/Min', value: '1,247', trend: 'up', icon: TrendingUp, color: 'blue' },
              { label: 'Active Users', value: '342', trend: 'up', icon: Users, color: 'purple' },
              { label: 'Memory Usage', value: '67%', trend: 'up', icon: MemoryStick, color: 'amber' },
              { label: 'CPU Usage', value: '23%', trend: 'down', icon: Cpu, color: 'emerald' },
            ].map(metric => (
              <div key={metric.label} className="p-4 rounded-lg bg-surface-800/50 border border-surface-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', `bg-${metric.color}-100 text-${metric.color}-600 dark:bg-${metric.color}-900/30 dark:text-${metric.color}-400`)}>
                      <metric.icon className="h-4 w-4" />
                    </div>
                    <span className="text-body-sm text-surface-400">{metric.label}</span>
                  </div>
                  <span className={cn('font-mono text-heading-sm', metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
                    {metric.value} {metric.trend === 'up' ? '↑' : '↓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="flex-1 flex items-center justify-center text-surface-500">Coming soon...</div>;
  }
};

const TabContent = ({ tab, deviceMode, showDevTools, onConsoleMessage }: any) => {
  switch (tab.type) {
    case 'browser':
      return (
        <iframe
          src={tab.url.startsWith('admin:') ? 'about:blank' : tab.url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={tab.title}
        />
      );
    case 'terminal':
      return <TerminalView onConsoleMessage={onConsoleMessage} />;
    case 'editor':
      return <EditorView />;
    case 'github':
      return <GitHubView />;
    case 'docs':
      return <DocsView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <div className="flex items-center justify-center h-full text-surface-500">Unknown tab type</div>;
  }
};

const TerminalView = ({ onConsoleMessage }: any) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'mshkur-admin@server:~$ Welcome to MSHKUR Admin Terminal',
    'mshkur-admin@server:~$ Type "help" for available commands',
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const command = input.trim();
    setHistory(prev => [...prev, `mshkur-admin@server:~$ ${command}`]);
    setTimeout(() => {
      let output = '';
      switch (command.split(' ')[0]) {
        case 'help':
          output = 'Available: help, status, logs, deploy, test, build, git, docker, k8s, monitor, backup';
          break;
        case 'status':
          output = 'System: Running normally\nServices: 12/12 active\nDatabase: Connected\nMemory: 67%\nCPU: 23%';
          break;
        case 'logs':
          output = 'Fetching logs...\n[INFO] 2026-11-24 10:30:15 Request processed\n[WARN] 2026-11-24 10:29:45 High memory usage\n[ERROR] 2026-11-24 10:28:12 Connection timeout';
          break;
        case 'deploy':
          output = 'Deploying...\n✓ Build frontend\n✓ Build backend\n✓ Run tests\n✓ Deploy to production\nDeployment successful!';
          break;
        case 'test':
          output = 'Running tests...\n✓ Unit tests: 245/245 passed\n✓ Integration: 87/87 passed\n✓ E2E: 23/23 passed\nAll passed!';
          break;
        default:
          output = `Unknown command: ${command}. Type "help" for help.`;
      }
      setHistory(prev => [...prev, output, '']);
      onConsoleMessage('log', `Command: ${command}`, 'terminal');
    }, 500);
    setInput('');
  };

  useEffect(() => {
    terminalRef.current?.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  return (
    <div className="h-full flex flex-col bg-surface-950">
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-body-xs text-green-300 space-y-1">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-surface-800 flex items-center gap-2">
        <span className="text-green-400">mshkur-admin@server:~$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent border-0 outline-none text-white font-mono text-body-xs"
          autoFocus
        />
      </form>
    </div>
  );
};

const EditorView = () => (
  <div className="h-full flex flex-col bg-surface-950">
    <div className="p-3 border-b border-surface-800 flex items-center gap-2">
      <span className="text-body-sm text-surface-400">main.tsx</span>
      <div className="flex-1" />
      <select className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-body-xs text-white">
        <option>TypeScript</option>
        <option>JavaScript</option>
        <option>TSX</option>
        <option>CSS</option>
        <option>JSON</option>
      </select>
    </div>
    <div className="flex-1 overflow-auto p-4 font-mono text-body-xs text-green-300">
      <pre>{`// MSHKUR Main Entry Point
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import '@shared/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)`}</pre>
    </div>
  </div>
);

const GitHubView = () => (
  <div className="h-full flex flex-col bg-surface-950">
    <div className="p-4 border-b border-surface-800">
      <h3 className="text-heading-md font-semibold mb-2">GitHub Integration</h3>
      <p className="text-body-sm text-surface-400">Manage repos, branches, and PRs</p>
    </div>
    <div className="flex-1 overflow-auto p-4 space-y-4">
      <div className="card p-4">
        <h4 className="font-semibold mb-3">Current Branch: research/rebuild-blueprint-2026-11-23</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <button className="btn btn-primary"><GitBranch className="h-4 w-4" />Create Branch</button>
          <button className="btn btn-secondary"><ArrowRight className="h-4 w-4" />Merge to main</button>
          <button className="btn btn-ghost text-red-400"><AlertCircle className="h-4 w-4" />Review Changes</button>
        </div>
      </div>
    </div>
  </div>
);

const DocsView = () => (
  <div className="h-full flex flex-col bg-surface-950">
    <div className="p-4 border-b border-surface-800">
      <h3 className="text-heading-md font-semibold mb-2">Technical Documentation</h3>
      <p className="text-body-sm text-surface-400">API reference, dev guides, architecture</p>
    </div>
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {[
        { title: 'MSHKUR Architecture', desc: 'Core engine, apps, assistants overview' },
        { title: 'Image Processing Engine', desc: 'Background removal, models, WebGPU/WASM' },
        { title: 'Skills System', desc: 'Registration, execution, orchestration' },
        { title: 'AI Assistant', desc: 'Context, tools, workflows' },
        { title: 'API Reference', desc: 'REST endpoints, WebSocket, auth' },
        { title: 'Deployment Guide', desc: 'Docker, Kubernetes, CI/CD' },
      ].map(doc => (
        <div key={doc.title} className="card p-4 hover:border-brand-500/50 transition-colors cursor-pointer">
          <h4 className="font-semibold">{doc.title}</h4>
          <p className="text-body-sm text-surface-400 mt-1">{doc.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsView = () => (
  <div className="h-full flex flex-col bg-surface-950">
    <div className="p-4 border-b border-surface-800">
      <h3 className="text-heading-md font-semibold mb-2">System Analytics</h3>
      <p className="text-body-sm text-surface-400">Monitor performance, errors, usage</p>
    </div>
    <div className="flex-1 overflow-auto p-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Requests', value: '2.4M', change: '+12%', trend: 'up', icon: Activity, color: 'blue' },
          { label: 'Avg Response', value: '142ms', change: '-8%', trend: 'down', icon: Clock, color: 'emerald' },
          { label: 'Error Rate', value: '0.12%', change: '-0.03%', trend: 'down', icon: AlertCircle, color: 'emerald' },
          { label: 'Daily Active', value: '3,421', change: '+23%', trend: 'up', icon: Users, color: 'purple' },
        ].map(metric => (
          <div key={metric.label} className="card p-6">
            <div className="flex items-center justify-between">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', `bg-${metric.color}-100 text-${metric.color}-600 dark:bg-${metric.color}-900/30 dark:text-${metric.color}-400`)}>
                <metric.icon className="h-5 w-5" />
              </div>
              <span className={cn('text-body-xs font-medium', metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
                {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-heading-lg font-bold">{metric.value}</p>
              <p className="text-body-sm text-surface-400">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h4 className="font-semibold mb-4">Requests Chart (24h)</h4>
        <div className="h-64 bg-surface-800/50 rounded-lg flex items-center justify-center text-surface-500">
          [Interactive Chart - Chart.js]
        </div>
      </div>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="h-full flex flex-col bg-surface-950">
    <div className="p-4 border-b border-surface-800">
      <h3 className="text-heading-md font-semibold mb-2">Admin Settings</h3>
      <p className="text-body-sm text-surface-400">Configure environment, keys, integrations</p>
    </div>
    <div className="flex-1 overflow-auto p-4 space-y-6 max-w-2xl">
      <div className="card p-6">
        <h4 className="font-semibold mb-4">API Keys</h4>
        <div className="space-y-3">
          {['GitHub Token', 'OpenAI API Key', 'Anthropic API Key', 'Database URL', 'Redis URL', 'Sentry DSN'].map(key => (
            <div key={key} className="flex items-center justify-between p-3 bg-surface-800/50 rounded-lg">
              <span className="text-body-sm">{key}</span>
              <div className="flex items-center gap-2">
                <input type="password" value="••••••••" className="bg-surface-700 border border-surface-600 rounded px-2 py-1 text-body-xs text-white w-40" readOnly />
                <button className="btn-icon p-1 text-surface-400 hover:text-white"><Eye className="h-4 w-4" /></button>
                <button className="btn-icon p-1 text-surface-400 hover:text-white"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6">
        <h4 className="font-semibold mb-4">Environment</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-body-sm">Development Mode</span>
            <button className="relative h-6 w-11 rounded-full bg-brand-600" role="switch" aria-checked="true"><span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" /></button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-body-sm">Request Logging</span>
            <button className="relative h-6 w-11 rounded-full bg-brand-600" role="switch" aria-checked="true"><span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" /></button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-body-sm">Performance Monitoring</span>
            <button className="relative h-6 w-11 rounded-full bg-brand-600" role="switch" aria-checked="true"><span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" /></button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-body-sm">Auto Updates</span>
            <button className="relative h-6 w-11 rounded-full bg-surface-600" role="switch" aria-checked="false"><span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" /></button>
          </label>
        </div>
      </div>
    </div>
  </div>
);

const DevTools = ({ consoleMessages, onClear }: any) => (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b border-surface-800 flex items-center justify-between">
      <h4 className="text-heading-sm font-semibold">DevTools</h4>
      <div className="flex items-center gap-2">
        <select className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-body-xs text-white">
          <option>Elements</option>
          <option>Console</option>
          <option>Network</option>
          <option>Performance</option>
          <option>Memory</option>
          <option>Application</option>
        </select>
        <button onClick={onClear} className="btn-icon p-1 text-surface-400 hover:text-white"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-3 font-mono text-body-xs space-y-1">
      {consoleMessages.slice(-50).map(msg => (
        <div key={msg.id} className={cn('flex gap-2 p-1 rounded', msg.type === 'error' && 'bg-red-500/10', msg.type === 'warn' && 'bg-amber-500/10')}>
          <span className="text-surface-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          <span className={cn(msg.type === 'error' && 'text-red-400', msg.type === 'warn' && 'text-amber-400', msg.type === 'success' && 'text-emerald-400', msg.type === 'info' && 'text-blue-400')}>
            {msg.type.toUpperCase()}
          </span>
          <span className="flex-1">{msg.message}</span>
        </div>
      ))}
    </div>
  </div>
);

import { useState, useRef, useEffect } from 'react';