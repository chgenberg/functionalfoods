/**
 * Production monitoring and error tracking
 */

interface ErrorContext {
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  /**
   * Log application errors
   */
  logError(error: Error, context: Partial<ErrorContext> = {}) {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
      timestamp: new Date().toISOString(),
      severity: context.severity || 'medium'
    };
    
    // In production, send to external service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with Sentry or similar service
      console.error('🚨 Production Error:', errorLog);
      
      // For critical errors, send immediate alert
      if (context.severity === 'critical') {
        this.sendCriticalAlert(errorLog);
      }
    } else {
      console.error('Development Error:', errorLog);
    }
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(metric: PerformanceMetric) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
      console.log('📊 Performance Metric:', metric);
    }
  }
  
  /**
   * Track user actions for analytics
   */
  trackUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    const event = {
      action,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    };
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to analytics service
      console.log('👤 User Action:', event);
    }
  }
  
  /**
   * Send critical alerts (email, Slack, etc.)
   */
  private async sendCriticalAlert(errorLog: any) {
    try {
      // TODO: Implement critical alert system
      // Could send to Slack webhook, email, or monitoring service
      console.error('🚨 CRITICAL ALERT:', errorLog);
    } catch (err) {
      console.error('Failed to send critical alert:', err);
    }
  }
  
  /**
   * Health check endpoint data
   */
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}

export const monitoring = MonitoringService.getInstance();

// Global error handler for unhandled promises
if (typeof window === 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    monitoring.logError(new Error(`Unhandled Rejection: ${reason}`), {
      severity: 'critical',
      timestamp: new Date().toISOString()
    });
  });
  
  process.on('uncaughtException', (error) => {
    monitoring.logError(error, {
      severity: 'critical',
      timestamp: new Date().toISOString()
    });
  });
}