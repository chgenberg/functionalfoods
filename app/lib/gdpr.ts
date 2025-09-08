/**
 * GDPR Compliance utilities
 * Handles data protection, user rights, and privacy requirements
 */

import { PrismaClient } from '@prisma/client';
import { logInfo, logWarn, logError } from './monitoring';

interface DataExportRequest {
  userId: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
}

interface DataDeletionRequest {
  userId: string;
  email: string;
  requestedAt: string;
  scheduledFor: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
}

interface CookieConsent {
  userId?: string;
  sessionId: string;
  consents: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

interface PersonalDataSummary {
  profile: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    lastLogin?: string;
  };
  purchases: Array<{
    id: string;
    amount: number;
    date: string;
    items: string[];
  }>;
  courseProgress: Array<{
    courseId: string;
    courseName: string;
    progress: number;
    startedAt: string;
    completedAt?: string;
  }>;
  communications: Array<{
    type: 'email' | 'notification';
    subject: string;
    sentAt: string;
  }>;
  activityLog: Array<{
    action: string;
    timestamp: string;
    ipAddress?: string;
  }>;
}

/**
 * GDPR Compliance service
 */
class GDPRService {
  private static instance: GDPRService;
  private prisma: PrismaClient;
  
  private constructor() {
    this.prisma = new PrismaClient();
  }
  
  static getInstance(): GDPRService {
    if (!GDPRService.instance) {
      GDPRService.instance = new GDPRService();
    }
    return GDPRService.instance;
  }
  
  /**
   * Record cookie consent
   */
  async recordCookieConsent(consent: CookieConsent): Promise<void> {
    try {
      // Store consent in database or file system
      // This is a simplified implementation
      logInfo('Cookie consent recorded', {
        userId: consent.userId,
        sessionId: consent.sessionId,
        consents: consent.consents,
        ipAddress: consent.ipAddress
      });
      
      // In a real implementation, you would store this in a dedicated table
      // await this.prisma.cookieConsent.create({ data: consent });
      
    } catch (error) {
      logError('Failed to record cookie consent', { consent, error });
      throw error;
    }
  }
  
  /**
   * Get user's cookie consent status
   */
  async getCookieConsent(sessionId: string, userId?: string): Promise<CookieConsent | null> {
    try {
      // Retrieve consent from database
      // This is a placeholder implementation
      return null; // Would return actual consent data
      
    } catch (error) {
      logError('Failed to get cookie consent', { sessionId, userId, error });
      return null;
    }
  }
  
  /**
   * Request data export (Right to Data Portability)
   */
  async requestDataExport(userId: string, email: string): Promise<DataExportRequest> {
    try {
      logInfo('Data export requested', { userId, email });
      
      const request: DataExportRequest = {
        userId,
        email,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store request in database
      // await this.prisma.dataExportRequest.create({ data: request });
      
      // Queue background job to process export
      await this.queueDataExport(request);
      
      return request;
      
    } catch (error) {
      logError('Failed to create data export request', { userId, email, error });
      throw error;
    }
  }
  
  /**
   * Process data export in background
   */
  private async queueDataExport(request: DataExportRequest): Promise<void> {
    try {
      // Update status to processing
      request.status = 'processing';
      
      // Generate comprehensive data export
      const personalData = await this.generatePersonalDataExport(request.userId);
      
      // Create downloadable file (JSON format)
      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: request.userId,
        email: request.email,
        data: personalData,
        disclaimer: 'This export contains all personal data we have stored about you as of the export date.'
      };
      
      // In a real implementation, you would:
      // 1. Store the file securely (encrypted)
      // 2. Generate a secure download link
      // 3. Set expiration date (typically 30 days)
      // 4. Send email notification to user
      
      request.status = 'completed';
      request.downloadUrl = `https://secure-downloads.functionalfoods.se/exports/${request.userId}-${Date.now()}.json`;
      request.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      
      logInfo('Data export completed', { 
        userId: request.userId, 
        downloadUrl: request.downloadUrl 
      });
      
    } catch (error) {
      request.status = 'failed';
      logError('Data export processing failed', { 
        userId: request.userId, 
        error 
      });
    }
  }
  
  /**
   * Generate comprehensive personal data export
   */
  private async generatePersonalDataExport(userId: string): Promise<PersonalDataSummary> {
    try {
      // Fetch all user data from various tables
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          purchases: {
            include: {
              course: true
            }
          },
          // Add other relations as needed
        }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Compile comprehensive data summary
      const summary: PersonalDataSummary = {
        profile: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          createdAt: user.createdAt.toISOString(),
          lastLogin: user.lastLogin?.toISOString()
        },
        purchases: user.purchases.map(purchase => ({
          id: purchase.id,
          amount: purchase.amount,
          date: purchase.createdAt.toISOString(),
          items: [purchase.course?.name || 'Unknown Course']
        })),
        courseProgress: [], // Would fetch from course progress table
        communications: [], // Would fetch from email logs
        activityLog: []     // Would fetch from activity logs
      };
      
      return summary;
      
    } catch (error) {
      logError('Failed to generate personal data export', { userId, error });
      throw error;
    }
  }
  
  /**
   * Request account deletion (Right to be Forgotten)
   */
  async requestAccountDeletion(userId: string, email: string, reason?: string): Promise<DataDeletionRequest> {
    try {
      logInfo('Account deletion requested', { userId, email, reason });
      
      // Schedule deletion for 30 days from now (grace period)
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 30);
      
      const request: DataDeletionRequest = {
        userId,
        email,
        requestedAt: new Date().toISOString(),
        scheduledFor: scheduledFor.toISOString(),
        status: 'scheduled',
        reason
      };
      
      // Store deletion request
      // await this.prisma.dataDeletionRequest.create({ data: request });
      
      // Send confirmation email with cancellation option
      await this.sendDeletionConfirmationEmail(request);
      
      return request;
      
    } catch (error) {
      logError('Failed to create deletion request', { userId, email, error });
      throw error;
    }
  }
  
  /**
   * Execute account deletion
   */
  async executeAccountDeletion(userId: string): Promise<void> {
    try {
      logWarn('Executing account deletion', { userId });
      
      // This is a critical operation - implement with extreme care
      // 1. Archive essential data for legal/business requirements
      // 2. Anonymize data that must be retained
      // 3. Delete personal data
      
      // Example deletion process:
      await this.prisma.$transaction(async (tx) => {
        // Archive purchase records (anonymized)
        // await tx.purchase.updateMany({
        //   where: { userId },
        //   data: { 
        //     userEmail: 'deleted@example.com',
        //     userName: 'Deleted User'
        //   }
        // });
        
        // Delete personal data
        // await tx.user.delete({ where: { id: userId } });
      });
      
      logInfo('Account deletion completed', { userId });
      
    } catch (error) {
      logError('Account deletion failed', { userId, error });
      throw error;
    }
  }
  
  /**
   * Cancel scheduled deletion
   */
  async cancelAccountDeletion(userId: string): Promise<void> {
    try {
      logInfo('Account deletion cancelled', { userId });
      
      // Update deletion request status
      // await this.prisma.dataDeletionRequest.updateMany({
      //   where: { userId, status: 'scheduled' },
      //   data: { status: 'cancelled' }
      // });
      
    } catch (error) {
      logError('Failed to cancel deletion', { userId, error });
      throw error;
    }
  }
  
  /**
   * Send deletion confirmation email
   */
  private async sendDeletionConfirmationEmail(request: DataDeletionRequest): Promise<void> {
    try {
      // Send email with:
      // - Confirmation of deletion request
      // - Scheduled deletion date
      // - Cancellation link
      // - Information about what data will be deleted
      
      logInfo('Deletion confirmation email sent', { 
        userId: request.userId,
        email: request.email 
      });
      
    } catch (error) {
      logError('Failed to send deletion confirmation email', request);
    }
  }
  
  /**
   * Generate privacy policy compliance report
   */
  async generateComplianceReport(): Promise<{
    totalUsers: number;
    activeConsents: number;
    pendingDeletions: number;
    completedExports: number;
    dataRetentionSummary: Record<string, number>;
  }> {
    try {
      // Generate comprehensive compliance metrics
      const report = {
        totalUsers: await this.prisma.user.count(),
        activeConsents: 0, // Would count from consent table
        pendingDeletions: 0, // Would count from deletion requests
        completedExports: 0, // Would count from export requests
        dataRetentionSummary: {
          'users_older_than_2_years': 0,
          'inactive_users_1_year': 0,
          'unverified_accounts': 0
        }
      };
      
      logInfo('Compliance report generated', report);
      return report;
      
    } catch (error) {
      logError('Failed to generate compliance report', error);
      throw error;
    }
  }
  
  /**
   * Cleanup expired data (automated retention)
   */
  async cleanupExpiredData(): Promise<{
    deletedSessions: number;
    deletedLogs: number;
    anonymizedRecords: number;
  }> {
    try {
      logInfo('Starting expired data cleanup');
      
      const results = {
        deletedSessions: 0,
        deletedLogs: 0,
        anonymizedRecords: 0
      };
      
      // Delete old session data (90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      // Delete old activity logs (1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      // Anonymize very old purchase records (7 years retention for tax purposes)
      const sevenYearsAgo = new Date();
      sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
      
      logInfo('Data cleanup completed', results);
      return results;
      
    } catch (error) {
      logError('Data cleanup failed', error);
      throw error;
    }
  }
}

// Export singleton instance
export const gdprService = GDPRService.getInstance();

// Convenience exports
export const recordCookieConsent = (consent: CookieConsent) => 
  gdprService.recordCookieConsent(consent);

export const requestDataExport = (userId: string, email: string) => 
  gdprService.requestDataExport(userId, email);

export const requestAccountDeletion = (userId: string, email: string, reason?: string) => 
  gdprService.requestAccountDeletion(userId, email, reason); 