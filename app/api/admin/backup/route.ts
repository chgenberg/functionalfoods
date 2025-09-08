import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/app/lib/backup';
import { withRateLimit, apiRateLimit } from '@/app/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/backup - List all backups
 */
export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      // const user = await getAuthenticatedUser(request);
      // if (!user || user.role !== 'admin') {
      //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // }
      
      const backups = await backupManager.listBackups();
      
      return NextResponse.json({
        success: true,
        backups: backups.map(backup => ({
          name: backup.name,
          type: backup.type,
          size: backup.size,
          sizeFormatted: formatBytes(backup.size),
          created: backup.created,
          createdFormatted: new Date(backup.created).toLocaleString('sv-SE')
        }))
      });
      
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list backups'
      }, { status: 500 });
    }
  });
}

/**
 * POST /api/admin/backup - Create new backup
 */
export async function POST(request: NextRequest) {
  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      
      const body = await request.json();
      const { type } = body as { type: 'database' | 'files' | 'full' };
      
      if (!type || !['database', 'files', 'full'].includes(type)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid backup type. Must be "database", "files", or "full"'
        }, { status: 400 });
      }
      
      const results = [];
      
      // Create database backup
      if (type === 'database' || type === 'full') {
        console.log('📦 Creating database backup...');
        const dbResult = await backupManager.createDatabaseBackup('manual');
        results.push({ type: 'database', ...dbResult });
      }
      
      // Create file backup
      if (type === 'files' || type === 'full') {
        console.log('📁 Creating file backup...');
        const fileResult = await backupManager.createFileBackup();
        results.push({ type: 'files', ...fileResult });
      }
      
      const allSuccessful = results.every(result => result.success);
      const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
      const totalSize = results.reduce((sum, result) => sum + (result.size || 0), 0);
      
      return NextResponse.json({
        success: allSuccessful,
        results,
        summary: {
          totalDuration,
          totalSize,
          totalSizeFormatted: formatBytes(totalSize),
          backupsCreated: results.filter(r => r.success).length,
          backupsFailed: results.filter(r => !r.success).length
        }
      }, { 
        status: allSuccessful ? 200 : 207 // 207 = Multi-Status for partial success
      });
      
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Backup creation failed'
      }, { status: 500 });
    }
  });
}

/**
 * Helper function to format bytes
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 