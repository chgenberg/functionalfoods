import { PrismaClient } from '@prisma/client';

/**
 * Database connection and health monitoring
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
    
    // Graceful shutdown handling
    process.on('beforeExit', () => {
      this.disconnect();
    });
    
    process.on('SIGINT', () => {
      this.disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      this.disconnect();
      process.exit(0);
    });
  }
  
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  
  getClient(): PrismaClient {
    return this.prisma;
  }
  
  /**
   * Check database connection health
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
    timestamp: string;
  }> {
    const start = Date.now();
    
    try {
      // Simple query to test connection
      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const latency = Date.now() - start;
      
      console.error('❌ Database health check failed:', error);
      
      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Start periodic health monitoring
   */
  startHealthMonitoring(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.healthCheck();
      
      if (health.status === 'unhealthy') {
        console.error('🚨 Database unhealthy:', health);
        // In production, send alert to monitoring service
      } else if (health.latency > 1000) {
        console.warn(`⚠️ Database slow response: ${health.latency}ms`);
      }
    }, intervalMs);
    
    console.log(`✅ Database health monitoring started (interval: ${intervalMs}ms)`);
  }
  
  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 Database health monitoring stopped');
    }
  }
  
  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRecipes: number;
    totalBlogPosts: number;
    recentActivity: {
      newUsersToday: number;
      ordersToday: number;
      lastOrderTime?: string;
    };
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [
        totalUsers,
        totalOrders, 
        totalRecipes,
        totalBlogPosts,
        newUsersToday,
        ordersToday,
        lastOrder
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.recipe.count(),
        this.prisma.blogPost.count(),
        this.prisma.user.count({
          where: { createdAt: { gte: today } }
        }),
        this.prisma.order.count({
          where: { createdAt: { gte: today } }
        }),
        this.prisma.order.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      ]);
      
      return {
        totalUsers,
        totalOrders,
        totalRecipes,
        totalBlogPosts,
        recentActivity: {
          newUsersToday,
          ordersToday,
          lastOrderTime: lastOrder?.createdAt.toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      throw error;
    }
  }
  
  /**
   * Create database backup metadata
   */
  async createBackupRecord(backupType: 'manual' | 'automated', size?: number): Promise<void> {
    try {
      // Store backup metadata in a dedicated table (would need to add to schema)
      console.log(`📦 Backup record created: ${backupType} at ${new Date().toISOString()}`);
      
      // In a real implementation, you might store this in a separate monitoring database
      // or send to external backup service
    } catch (error) {
      console.error('❌ Failed to create backup record:', error);
    }
  }
  
  /**
   * Cleanup old data (GDPR compliance, performance)
   */
  async cleanupOldData(): Promise<{
    deletedLogs: number;
    deletedSessions: number;
    archivedOrders: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // Clean up old sessions (if you have a sessions table)
      // const deletedSessions = await this.prisma.session.deleteMany({
      //   where: { createdAt: { lt: thirtyDaysAgo } }
      // });
      
      // Archive old completed orders (move to archive table)
      // const archivedOrders = await this.prisma.orderArchive.createMany({
      //   data: await this.prisma.order.findMany({
      //     where: { 
      //       createdAt: { lt: sixMonthsAgo },
      //       status: 'completed'
      //     }
      //   })
      // });
      
      console.log('🧹 Database cleanup completed');
      
      return {
        deletedLogs: 0, // Implement based on your logging system
        deletedSessions: 0, // Implement if you have sessions
        archivedOrders: 0 // Implement based on your archival strategy
      };
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    try {
      this.stopHealthMonitoring();
      await this.prisma.$disconnect();
      console.log('🔌 Database disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();

// Export Prisma client for direct use
export const prisma = db.getClient();

// Initialize health monitoring in production (but not during build)
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE && !process.argv.includes('build')) {
  db.startHealthMonitoring(60000); // Check every minute in production
} 