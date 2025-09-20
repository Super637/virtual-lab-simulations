import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { debugLogger, LogEntry, LogLevel } from '@/utils/debugLogger';
import { X, Download, Trash2, Filter, Bug, Eye, EyeOff } from 'lucide-react';

interface DebugConsoleProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ 
  isVisible: controlledVisible, 
  onToggle 
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;
  const handleToggle = onToggle || (() => setInternalVisible(!internalVisible));

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  useEffect(() => {
    const updateLogs = () => {
      const allLogs = debugLogger.getLogs();
      setLogs(allLogs);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(allLogs.map(log => log.category))];
      setCategories(uniqueCategories);
    };

    // Initial load
    updateLogs();

    // Update logs every second
    const interval = setInterval(updateLogs, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getFilteredLogs = () => {
    let filtered = logs;

    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    return filtered.slice(-500); // Show last 500 logs for performance
  };

  const getLevelColor = (level: LogLevel): string => {
    const colors = {
      debug: 'bg-gray-500',
      info: 'bg-blue-500',
      warn: 'bg-yellow-500',
      error: 'bg-red-500',
      critical: 'bg-red-700'
    };
    return colors[level];
  };

  const getCategoryColor = (category: string): string => {
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = [
      'bg-purple-500', 'bg-green-500', 'bg-indigo-500', 
      'bg-pink-500', 'bg-teal-500', 'bg-orange-500'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleExportLogs = () => {
    const dataStr = debugLogger.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `virtual-lab-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    debugLogger.info('DEBUG_CONSOLE', 'Logs exported by user');
  };

  const handleClearLogs = () => {
    debugLogger.clearLogs();
    setLogs([]);
    debugLogger.info('DEBUG_CONSOLE', 'Logs cleared by user');
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleToggle}
          size="sm"
          variant="outline"
          className="bg-black/80 text-white border-white/20 hover:bg-black/90"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-black/95 text-white rounded-lg border border-white/20 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <span className="font-medium text-sm">Debug Console</span>
          <Badge variant="secondary" className="text-xs">
            {getFilteredLogs().length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAutoScroll(!autoScroll)}
            className="h-6 w-6 p-0 text-white hover:bg-white/10"
          >
            {autoScroll ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExportLogs}
            className="h-6 w-6 p-0 text-white hover:bg-white/10"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearLogs}
            className="h-6 w-6 p-0 text-white hover:bg-white/10"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            className="h-6 w-6 p-0 text-white hover:bg-white/10"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-2 border-b border-white/20">
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
          className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20"
        >
          <option value="all">All Levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="space-y-1">
          {getFilteredLogs().map((log, index) => (
            <div key={`${log.timestamp}-${index}`} className="text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/60">{formatTimestamp(log.timestamp)}</span>
                <Badge className={`${getLevelColor(log.level)} text-white text-xs px-1 py-0`}>
                  {log.level.toUpperCase()}
                </Badge>
                <Badge className={`${getCategoryColor(log.category)} text-white text-xs px-1 py-0`}>
                  {log.category}
                </Badge>
              </div>
              <div className="text-white/90 ml-2 mb-1">{log.message}</div>
              {log.data && (
                <details className="ml-2 text-white/60">
                  <summary className="cursor-pointer hover:text-white/80">Data</summary>
                  <pre className="text-xs mt-1 bg-white/5 p-1 rounded overflow-auto">
                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
              {log.error && (
                <details className="ml-2 text-red-300">
                  <summary className="cursor-pointer hover:text-red-200">Error Stack</summary>
                  <pre className="text-xs mt-1 bg-red-900/20 p-1 rounded overflow-auto">
                    {log.stackTrace || log.error.message}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-white/20 text-xs text-white/60">
        <span>Session: {debugLogger.getSystemInfo().sessionId.slice(-8)}</span>
        <span>{autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}</span>
      </div>
    </div>
  );
};
