/**
 * Centralized debug logging utility for SocialAffluence
 * Provides structured logging with component context and environment controls
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface DebugContext {
  component: string;
  operation?: string;
  userId?: string | number;
  sessionId?: string;
  requestId?: string;
  [key: string]: any;
}

class DebugLogger {
  private static instance: DebugLogger;
  private logLevel: LogLevel;
  private enabledComponents: Set<string>;
  private isEnabled: boolean;

  private constructor() {
    // Enable debug logging in development or when DEBUG env var is set
    this.isEnabled = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') || 
                     (typeof process !== 'undefined' && process.env?.DEBUG === 'true') ||
                     (typeof window !== 'undefined' && localStorage.getItem('debug') === 'true');
    
    // Set log level from environment or default to INFO
    this.logLevel = this.parseLogLevel(typeof process !== 'undefined' ? process.env?.LOG_LEVEL : undefined) || LogLevel.INFO;
    
    // Parse enabled components from environment
    const componentsFromEnv = typeof process !== 'undefined' ? process.env?.DEBUG_COMPONENTS : undefined;
    this.enabledComponents = new Set(
      componentsFromEnv?.split(',').map(c => c.trim()) || []
    );
  }

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private parseLogLevel(level?: string): LogLevel | null {
    if (!level) return null;
    const upperLevel = level.toUpperCase();
    return LogLevel[upperLevel as keyof typeof LogLevel] ?? null;
  }

  private shouldLog(level: LogLevel, component: string): boolean {
    if (!this.isEnabled) return false;
    if (level > this.logLevel) return false;
    if (this.enabledComponents.size > 0 && !this.enabledComponents.has(component)) return false;
    return true;
  }

  private formatMessage(level: LogLevel, context: DebugContext, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    
    let formatted = `[${timestamp}] ${levelName} [${contextStr}] ${message}`;
    
    if (data !== undefined) {
      const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
      formatted += `\nData: ${dataStr}`;
    }
    
    return formatted;
  }

  private log(level: LogLevel, context: DebugContext, message: string, data?: any): void {
    if (!this.shouldLog(level, context.component)) return;

    const formatted = this.formatMessage(level, context, message, data);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.log(formatted);
        break;
    }
  }

  public error(context: DebugContext, message: string, data?: any): void {
    this.log(LogLevel.ERROR, context, message, data);
  }

  public warn(context: DebugContext, message: string, data?: any): void {
    this.log(LogLevel.WARN, context, message, data);
  }

  public info(context: DebugContext, message: string, data?: any): void {
    this.log(LogLevel.INFO, context, message, data);
  }

  public debug(context: DebugContext, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  public trace(context: DebugContext, message: string, data?: any): void {
    this.log(LogLevel.TRACE, context, message, data);
  }

  // Performance timing utilities
  public time(context: DebugContext, label: string): void {
    if (this.shouldLog(LogLevel.DEBUG, context.component)) {
      console.time(`${context.component}:${label}`);
    }
  }

  public timeEnd(context: DebugContext, label: string): void {
    if (this.shouldLog(LogLevel.DEBUG, context.component)) {
      console.timeEnd(`${context.component}:${label}`);
    }
  }

  // Utilities for easier usage
  public createContext(component: string, additionalContext?: Partial<DebugContext>): DebugContext {
    return {
      component,
      ...additionalContext
    };
  }

  // Configuration methods
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public enableComponent(component: string): void {
    this.enabledComponents.add(component);
  }

  public disableComponent(component: string): void {
    this.enabledComponents.delete(component);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const debugLogger = DebugLogger.getInstance();

// Export convenience functions for easier usage
export function createDebugContext(component: string, additionalContext?: Partial<DebugContext>): DebugContext {
  return debugLogger.createContext(component, additionalContext);
}

export function debugLog(context: DebugContext, message: string, data?: any): void {
  debugLogger.debug(context, message, data);
}

export function infoLog(context: DebugContext, message: string, data?: any): void {
  debugLogger.info(context, message, data);
}

export function errorLog(context: DebugContext, message: string, data?: any): void {
  debugLogger.error(context, message, data);
}

export function warnLog(context: DebugContext, message: string, data?: any): void {
  debugLogger.warn(context, message, data);
}

export function traceLog(context: DebugContext, message: string, data?: any): void {
  debugLogger.trace(context, message, data);
}