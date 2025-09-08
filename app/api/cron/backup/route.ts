import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/app/lib/backup';

export const dynamic = 'force-dynamic';

/**
 * Automated backup cron job
 * Should be called by external cron service or scheduled job
 * GET /api/cron/backup
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Skipped during build' });
  }
  
  try {
    // Verify cron job authentication
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      console.warn('🚨 Unauthorized cron backup attempt');
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    console.log('⏰ Starting scheduled backup job...');
    
    const startTime = Date.now();
    const results = [];
    
    // Determine backup schedule based on day of week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    
    // Database backup: Daily at 2 AM
    if (hour === 2) {
      console.log('📦 Creating scheduled database backup...');
      const dbResult = await backupManager.createDatabaseBackup('scheduled');
      results.push({ type: 'database', ...dbResult });
    }
    
    // File backup: Weekly on Sundays at 3 AM
    if (dayOfWeek === 0 && hour === 3) {
      console.log('📁 Creating scheduled file backup...');
      const fileResult = await backupManager.createFileBackup();
      results.push({ type: 'files', ...fileResult });
    }
    
    // If no backups were scheduled for this time, return early
    if (results.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No backups scheduled for this time',
        timestamp: now.toISOString(),
        nextDatabaseBackup: getNextBackupTime('database'),
        nextFileBackup: getNextBackupTime('files')
      });
    }
    
    const totalDuration = Date.now() - startTime;
    const successfulBackups = results.filter(r => r.success);
    const failedBackups = results.filter(r => !r.success);
    
    // Log results
    if (successfulBackups.length > 0) {
      console.log(`✅ Scheduled backup completed: ${successfulBackups.length} successful, ${failedBackups.length} failed`);
    }
    
    if (failedBackups.length > 0) {
      console.error(`❌ Some backups failed:`, failedBackups.map(b => b.error).join(', '));
    }
    
    // Return comprehensive status
    return NextResponse.json({
      success: failedBackups.length === 0,
      results,
      summary: {
        totalDuration,
        backupsAttempted: results.length,
        backupsSuccessful: successfulBackups.length,
        backupsFailed: failedBackups.length,
        totalSize: successfulBackups.reduce((sum, result) => sum + (result.size || 0), 0)
      },
      timestamp: now.toISOString(),
      nextSchedule: {
        database: getNextBackupTime('database'),
        files: getNextBackupTime('files')
      }
    });
    
  } catch (error) {
    console.error('❌ Scheduled backup job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup job failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Calculate next backup time
 */
function getNextBackupTime(type: 'database' | 'files'): string {
  const now = new Date();
  const next = new Date(now);
  
  if (type === 'database') {
    // Daily at 2 AM
    next.setHours(2, 0, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else {
    // Weekly on Sundays at 3 AM
    next.setHours(3, 0, 0, 0);
    const daysUntilSunday = (7 - now.getDay()) % 7;
    if (daysUntilSunday === 0 && now.getHours() >= 3) {
      // If it's Sunday and past 3 AM, schedule for next Sunday
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + daysUntilSunday);
    }
  }
  
  return next.toISOString();
}

/**
 * Manual trigger for testing
 * POST /api/cron/backup
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication for manual triggers
    // TODO: Add proper admin auth check
    
    const body = await request.json();
    const { force } = body as { force?: boolean };
    
    if (!force) {
      return NextResponse.json({
        error: 'Manual backup trigger requires force=true parameter'
      }, { status: 400 });
    }
    
    console.log('🔧 Manual backup trigger activated...');
    
    const dbResult = await backupManager.createDatabaseBackup('manual');
    
    return NextResponse.json({
      success: dbResult.success,
      result: dbResult,
      message: 'Manual backup completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Manual backup trigger failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Manual backup failed'
    }, { status: 500 });
  }
} 