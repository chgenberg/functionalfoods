/**
 * Comprehensive monitoring and logging system
 * Includes error tracking, performance monitoring, and alerting
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: string;
  tags?: Record<string, string>;
}

interface AlertConfig {
  type: 'email' | 'webhook' | 'sms';
  threshold: number;
  recipients: string[];
  cooldownMinutes: number;
}

/**
 * Monitoring and logging service
 */
class MonitoringService {
  private static instance: MonitoringService;
  private logBuffer: LogEntry[] = [];
  private metricsBuffer: PerformanceMetric[] = [];
  private alertCooldowns: Map<string, number> = new Map();
  private isEnabled: boolean;
  
  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    
    // Flush buffers periodically (skip during build)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.argv.includes('build');
    
    if (this.isEnabled && !isBuildTime) {
      setInterval(() => this.flushBuffers(), 30000); // Every 30 seconds
    }
  }
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  /**
   * Log an event
   */
  log(level: keyof LogLevel, message: string, data?: any, context?: {
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    url?: string;
    method?: string;
    duration?: number;
    statusCode?: number;
  }): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const emoji = this.getLevelEmoji(level);
      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, data ? data : '');
    }
    
    // Add to buffer for production logging
    this.logBuffer.push(entry);
    
    // Send critical errors immediately
    if (level === 'ERROR' && this.isEnabled) {
      this.sendToSentry(entry);
    }
  }
  
  /**
   * Log error with automatic context extraction
   */
  error(error: Error | string, context?: any, request?: Request): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : { message: error };
    
    const requestContext = request ? {
      url: request.url,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent')
    } : {};
    
    this.log('ERROR', error instanceof Error ? error.message : error, {
      error: errorData,
      context,
      ...requestContext
    });
  }
  
  /**
   * Log warning
   */
  warn(message: string, data?: any, context?: any): void {
    this.log('WARN', message, data, context);
  }
  
  /**
   * Log info
   */
  info(message: string, data?: any, context?: any): void {
    this.log('INFO', message, data, context);
  }
  
  /**
   * Log debug information
   */
  debug(message: string, data?: any, context?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data, context);
    }
  }
  
  /**
   * Track performance metric
   */
  trackMetric(name: string, value: number, unit: PerformanceMetric['unit'], tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags
    };
    
    this.metricsBuffer.push(metric);
    
    // Log performance issues
    if (this.shouldAlert(name, value)) {
      this.warn(`Performance alert: ${name}`, { value, unit, tags });
    }
  }
  
  /**
   * Track API response time
   */
  trackApiCall(endpoint: string, method: string, duration: number, statusCode: number, userId?: string): void {
    this.trackMetric('api_response_time', duration, 'ms', {
      endpoint,
      method,
      status: statusCode.toString(),
      userId: userId || 'anonymous'
    });
    
    // Track error rates
    if (statusCode >= 400) {
      this.trackMetric('api_error_count', 1, 'count', {
        endpoint,
        method,
        status: statusCode.toString()
      });
    }
  }
  
  /**
   * Track database query performance
   */
  trackDatabaseQuery(query: string, duration: number, success: boolean): void {
    this.trackMetric('db_query_time', duration, 'ms', {
      query: query.substring(0, 50), // Truncate for privacy
      success: success.toString()
    });
    
    if (duration > 1000) { // Slow query threshold
      this.warn('Slow database query detected', {
        query: query.substring(0, 100),
        duration,
        success
      });
    }
  }
  
  /**
   * Track user activity
   */
  trackUserActivity(userId: string, action: string, metadata?: any): void {
    this.info('User activity', {
      userId,
      action,
      metadata
    });
    
    this.trackMetric('user_activity', 1, 'count', {
      action,
      userId
    });
  }
  
  /**
   * Track business metrics
   */
  trackBusinessMetric(metric: 'course_purchase' | 'user_signup' | 'course_completion' | 'email_sent', value: number = 1, metadata?: any): void {
    this.trackMetric(`business_${metric}`, value, 'count', metadata);
    
    this.info(`Business metric: ${metric}`, { value, metadata });
  }
  
  /**
   * Send alert if conditions are met
   */
  private shouldAlert(metricName: string, value: number): boolean {
    const alertThresholds: Record<string, number> = {
      'api_response_time': 5000, // 5 seconds
      'db_query_time': 2000,     // 2 seconds
      'memory_usage': 90,        // 90%
      'error_rate': 5            // 5%
    };
    
    const threshold = alertThresholds[metricName];
    return threshold !== undefined && value > threshold;
  }
  
  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: keyof LogLevel): string {
    const emojis = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🐛'
    };
    return emojis[level] || 'ℹ️';
  }
  
  /**
   * Send error to Sentry (if configured)
   */
  private async sendToSentry(entry: LogEntry): Promise<void> {
    try {
      // In a real implementation, you would use @sentry/nextjs
      // Here's a basic example of what that might look like:
      
      if (process.env.SENTRY_DSN) {
        // const Sentry = require('@sentry/nextjs');
        // Sentry.captureException(new Error(entry.message), {
        //   level: entry.level,
        //   extra: entry.data,
        //   tags: {
        //     requestId: entry.requestId,
        //     userId: entry.userId
        //   }
        // });
        
        console.log('🚨 Would send to Sentry:', entry.message);
      }
    } catch (error) {
      console.error('Failed to send to Sentry:', error);
    }
  }
  
  /**
   * Flush log and metrics buffers
   */
  private async flushBuffers(): Promise<void> {
    if (this.logBuffer.length === 0 && this.metricsBuffer.length === 0) {
      return;
    }
    
    try {
      // In production, send to external logging service
      if (this.isEnabled) {
        await this.sendToExternalLogging();
      }
      
      // Clear buffers
      this.logBuffer = [];
      this.metricsBuffer = [];
      
    } catch (error) {
      console.error('Failed to flush monitoring buffers:', error);
    }
  }
  
  /**
   * Send logs to external service (placeholder)
   */
  private async sendToExternalLogging(): Promise<void> {
    // In a real implementation, you might send to:
    // - Elasticsearch/Kibana
    // - Datadog
    // - New Relic
    // - CloudWatch
    // - LogRocket
    
    if (process.env.MONITORING_WEBHOOK_URL) {
      try {
        const payload = {
          logs: this.logBuffer,
          metrics: this.metricsBuffer,
          timestamp: new Date().toISOString(),
          service: 'functional-foods',
          environment: process.env.NODE_ENV
        };
        
        await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
      } catch (error) {
        console.error('Failed to send to monitoring webhook:', error);
      }
    }
  }
  
  /**
   * Get system health metrics
   */
  getSystemMetrics(): {
    memory: NodeJS.MemoryUsage;
    uptime: number;
    cpuUsage: NodeJS.CpuUsage;
    bufferSizes: {
      logs: number;
      metrics: number;
    };
  } {
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      bufferSizes: {
        logs: this.logBuffer.length,
        metrics: this.metricsBuffer.length
      }
    };
  }
  
  /**
   * Create performance timer
   */
  createTimer(name: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.trackMetric(name, duration, 'ms');
      return duration;
    };
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Convenience exports
export const logError = (error: Error | string, context?: any, request?: Request) => 
  monitoring.error(error, context, request);

export const logWarn = (message: string, data?: any, context?: any) => 
  monitoring.warn(message, data, context);

export const logInfo = (message: string, data?: any, context?: any) => 
  monitoring.info(message, data, context);

export const logDebug = (message: string, data?: any, context?: any) => 
  monitoring.debug(message, data, context);

export const trackMetric = (name: string, value: number, unit: PerformanceMetric['unit'], tags?: Record<string, string>) => 
  monitoring.trackMetric(name, value, unit, tags);

export const trackApiCall = (endpoint: string, method: string, duration: number, statusCode: number, userId?: string) => 
  monitoring.trackApiCall(endpoint, method, duration, statusCode, userId);

export const createTimer = (name: string) => monitoring.createTimer(name); 