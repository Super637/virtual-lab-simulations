/**
 * Comprehensive Debug Logger for Virtual Lab Simulations
 * Provides detailed logging, error tracking, and debugging capabilities
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  sessionId: string;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private maxLogs: number = 1000;
  private isDevelopment: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    this.initializeLogger();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogger(): void {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.error('UNHANDLED_ERROR', 'Unhandled JavaScript error occurred', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('UNHANDLED_REJECTION', 'Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Log initial session info
    this.info('SESSION_START', 'Debug logger initialized', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      isDevelopment: this.isDevelopment
    });
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    if (data !== undefined) {
      entry.data = this.safeStringify(data);
    }

    if (error) {
      entry.error = error;
      entry.stackTrace = error.stack;
    }

    return entry;
  }

  private safeStringify(obj: any): any {
    try {
      // Handle circular references and complex objects
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack
            };
          }
          if (value instanceof HTMLElement) {
            return `HTMLElement: ${value.tagName}`;
          }
        }
        return value;
      }));
    } catch (e) {
      return `[Object could not be serialized: ${e}]`;
    }
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDevelopment) {
      this.outputToConsole(entry);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('virtualLab_debugLogs', JSON.stringify(this.logs.slice(-100)));
    } catch (e) {
      console.warn('Could not save logs to localStorage:', e);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}] [${entry.category}] ${entry.timestamp}`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case 'debug':
        console.debug(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
      case 'info':
        console.info(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
      case 'error':
      case 'critical':
        console.error(`%c${prefix}`, style, entry.message, entry.data || '', entry.error || '');
        break;
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #888; font-weight: normal;',
      info: 'color: #2196F3; font-weight: bold;',
      warn: 'color: #FF9800; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold;',
      critical: 'color: #FF0000; font-weight: bold; background: #FFEBEE;'
    };
    return styles[level];
  }

  // Public logging methods
  debug(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('debug', category, message, data);
    this.addLog(entry);
  }

  info(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('info', category, message, data);
    this.addLog(entry);
  }

  warn(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('warn', category, message, data);
    this.addLog(entry);
  }

  error(category: string, message: string, data?: any, error?: Error): void {
    const entry = this.createLogEntry('error', category, message, data, error);
    this.addLog(entry);
  }

  critical(category: string, message: string, data?: any, error?: Error): void {
    const entry = this.createLogEntry('critical', category, message, data, error);
    this.addLog(entry);
  }

  // Performance logging
  time(label: string): void {
    console.time(label);
    this.debug('PERFORMANCE', `Timer started: ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
    this.debug('PERFORMANCE', `Timer ended: ${label}`);
  }

  // Network request logging
  logNetworkRequest(method: string, url: string, status?: number, error?: Error): void {
    this.info('NETWORK', `${method} ${url}`, {
      method,
      url,
      status,
      error: error?.message
    });
  }

  // User interaction logging
  logUserInteraction(action: string, element?: string, data?: any): void {
    this.info('USER_INTERACTION', `User ${action}`, {
      action,
      element,
      data,
      timestamp: Date.now()
    });
  }

  // Lab-specific logging
  logLabAccess(labType: string, url: string, success: boolean, error?: string): void {
    const level = success ? 'info' : 'error';
    this[level]('LAB_ACCESS', `Lab access: ${labType}`, {
      labType,
      url,
      success,
      error
    });
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    return filtered;
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('virtualLab_debugLogs');
    this.info('SYSTEM', 'Debug logs cleared');
  }

  // Get system info for debugging
  getSystemInfo(): any {
    return {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      isDevelopment: this.isDevelopment,
      logCount: this.logs.length,
      memoryUsage: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : 'Not available'
    };
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger;
}

export default debugLogger;
