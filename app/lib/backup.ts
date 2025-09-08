import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { getEnvConfig } from './env';
import { logSecurityEvent } from './security';

const execAsync = promisify(exec);

interface BackupResult {
  success: boolean;
  filePath?: string;
  size?: number;
  duration: number;
  error?: string;
  timestamp: string;
}

interface BackupConfig {
  retentionDays: number;
  compressionLevel: number;
  encryptionEnabled: boolean;
  storageLocation: string;
  maxBackupSize: number; // in MB
}

/**
 * Backup management system
 */
class BackupManager {
  private static instance: BackupManager;
  private config: BackupConfig;
  
  private constructor() {
    this.config = {
      retentionDays: 30,
      compressionLevel: 6,
      encryptionEnabled: true,
      storageLocation: process.env.BACKUP_STORAGE_PATH || path.join(process.cwd(), 'backups'),
      maxBackupSize: 1000 // 1GB max
    };
  }
  
  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }
  
  /**
   * Create database backup
   */
  async createDatabaseBackup(type: 'manual' | 'scheduled' = 'manual'): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `db-backup-${timestamp}.sql`;
    const backupPath = path.join(this.config.storageLocation, backupFileName);
    
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.config.storageLocation, { recursive: true });
      
      const env = getEnvConfig();
      const dbUrl = new URL(env.DATABASE_URL);
      
      // Extract database connection details
      const dbConfig = {
        host: dbUrl.hostname,
        port: dbUrl.port || '5432',
        database: dbUrl.pathname.slice(1), // Remove leading slash
        username: dbUrl.username,
        password: dbUrl.password
      };
      
      console.log(`📦 Starting ${type} database backup...`);
      
      // Create PostgreSQL dump
      const dumpCommand = [
        'pg_dump',
        `--host=${dbConfig.host}`,
        `--port=${dbConfig.port}`,
        `--username=${dbConfig.username}`,
        `--dbname=${dbConfig.database}`,
        '--verbose',
        '--clean',
        '--no-owner',
        '--no-privileges',
        `--file=${backupPath}`
      ].join(' ');
      
      // Set password via environment variable
      const env_vars = { 
        ...process.env, 
        PGPASSWORD: dbConfig.password 
      };
      
      await execAsync(dumpCommand, { env: env_vars });
      
      // Get file size
      const stats = await fs.stat(backupPath);
      const sizeInMB = stats.size / (1024 * 1024);
      
      // Check if backup is too large
      if (sizeInMB > this.config.maxBackupSize) {
        throw new Error(`Backup size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${this.config.maxBackupSize}MB)`);
      }
      
      // Compress backup if enabled
      let finalPath = backupPath;
      if (this.config.compressionLevel > 0) {
        finalPath = await this.compressBackup(backupPath);
        // Remove uncompressed file
        await fs.unlink(backupPath);
      }
      
      const duration = Date.now() - startTime;
      const finalStats = await fs.stat(finalPath);
      
      // Log successful backup
      logSecurityEvent('database_backup_created', {
        type,
        size: finalStats.size,
        duration,
        compressed: this.config.compressionLevel > 0
      });
      
      console.log(`✅ Database backup completed: ${path.basename(finalPath)} (${(finalStats.size / (1024 * 1024)).toFixed(2)}MB)`);
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      return {
        success: true,
        filePath: finalPath,
        size: finalStats.size,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ Database backup failed:', errorMessage);
      
      // Log failed backup
      logSecurityEvent('database_backup_failed', {
        type,
        error: errorMessage,
        duration
      });
      
      return {
        success: false,
        error: errorMessage,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Create file system backup (images, uploads, etc.)
   */
  async createFileBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `files-backup-${timestamp}.tar.gz`;
    const backupPath = path.join(this.config.storageLocation, backupFileName);
    
    try {
      console.log('📁 Starting file system backup...');
      
      // Directories to backup
      const dirsToBackup = [
        'public/recept_images_vision_optimized',
        'public/recept_images_optimized', 
        'public/uploads',
        'public/kurser',
        'recept_images_2025'
      ];
      
      // Filter existing directories
      const existingDirs = [];
      for (const dir of dirsToBackup) {
        try {
          await fs.access(dir);
          existingDirs.push(dir);
        } catch {
          // Directory doesn't exist, skip
        }
      }
      
      if (existingDirs.length === 0) {
        throw new Error('No directories found to backup');
      }
      
      // Create tar.gz archive
      const tarCommand = `tar -czf "${backupPath}" ${existingDirs.join(' ')}`;
      await execAsync(tarCommand);
      
      const stats = await fs.stat(backupPath);
      const duration = Date.now() - startTime;
      
      console.log(`✅ File backup completed: ${path.basename(backupPath)} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
      
      return {
        success: true,
        filePath: backupPath,
        size: stats.size,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ File backup failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Compress backup file
   */
  private async compressBackup(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`;
    const command = `gzip -${this.config.compressionLevel} "${filePath}"`;
    
    await execAsync(command);
    
    // gzip replaces the original file, so the compressed file has the .gz extension
    return compressedPath;
  }
  
  /**
   * Clean up old backup files
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.storageLocation);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.config.storageLocation, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate && (file.includes('backup') || file.endsWith('.sql') || file.endsWith('.gz'))) {
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`🗑️ Deleted old backup: ${file}`);
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} old backup files`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error);
    }
  }
  
  /**
   * List available backups
   */
  async listBackups(): Promise<Array<{
    name: string;
    type: 'database' | 'files';
    size: number;
    created: string;
    path: string;
  }>> {
    try {
      const files = await fs.readdir(this.config.storageLocation);
      const backups = [];
      
      for (const file of files) {
        if (file.includes('backup')) {
          const filePath = path.join(this.config.storageLocation, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            name: file,
            type: file.includes('db-backup') ? 'database' as const : 'files' as const,
            size: stats.size,
            created: stats.mtime.toISOString(),
            path: filePath
          });
        }
      }
      
      return backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return [];
    }
  }
  
  /**
   * Restore database from backup
   */
  async restoreDatabase(backupPath: string): Promise<BackupResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Starting database restore from: ${path.basename(backupPath)}`);
      
      const env = getEnvConfig();
      const dbUrl = new URL(env.DATABASE_URL);
      
      const dbConfig = {
        host: dbUrl.hostname,
        port: dbUrl.port || '5432',
        database: dbUrl.pathname.slice(1),
        username: dbUrl.username,
        password: dbUrl.password
      };
      
      // Decompress if needed
      let sqlFile = backupPath;
      if (backupPath.endsWith('.gz')) {
        sqlFile = backupPath.replace('.gz', '');
        await execAsync(`gunzip -c "${backupPath}" > "${sqlFile}"`);
      }
      
      // Restore database
      const restoreCommand = [
        'psql',
        `--host=${dbConfig.host}`,
        `--port=${dbConfig.port}`,
        `--username=${dbConfig.username}`,
        `--dbname=${dbConfig.database}`,
        `--file=${sqlFile}`
      ].join(' ');
      
      const env_vars = { 
        ...process.env, 
        PGPASSWORD: dbConfig.password 
      };
      
      await execAsync(restoreCommand, { env: env_vars });
      
      // Clean up decompressed file if we created it
      if (sqlFile !== backupPath) {
        await fs.unlink(sqlFile);
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ Database restore completed in ${duration}ms`);
      
      return {
        success: true,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ Database restore failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const backupManager = BackupManager.getInstance(); 