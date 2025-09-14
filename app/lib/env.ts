/**
 * Environment variable validation and management
 * Ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;
  
  // Authentication & Security
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  PASSWORD_SALT: string;
  
  // Payment
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Email
  MAILCHIMP_TRANSACTIONAL_API_KEY: string;
  
  // External APIs
  OPENAI_API_KEY?: string; // Optional for AI features
  
  // App Configuration
  NEXT_PUBLIC_SITE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private config: EnvironmentConfig | null = null;
  
  private constructor() {}
  
  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }
  
  /**
   * Validate and load environment variables
   */
  validateAndLoad(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }
    
    // Skip validation during build process
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.argv.includes('build') ||
                       process.env.npm_lifecycle_event === 'build';
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required environment variables (critical for boot)
    const requiredVars = {
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      PASSWORD_SALT: process.env.PASSWORD_SALT,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      // Accept either server or public publishable key naming
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      // Optional-at-boot: webhook and email keys
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      MAILCHIMP_TRANSACTIONAL_API_KEY: process.env.MAILCHIMP_TRANSACTIONAL_API_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test'
    };
    
    // Check for missing required variables (skip during build)
    if (!isBuildTime) {
      // Only treat truly critical vars as fatal for boot
      const criticalKeys = ['DATABASE_URL','NEXTAUTH_SECRET','NEXTAUTH_URL','PASSWORD_SALT','STRIPE_SECRET_KEY','STRIPE_PUBLISHABLE_KEY','NEXT_PUBLIC_SITE_URL'] as const;
      const criticalMissing = criticalKeys.filter((key) => {
        const val = (requiredVars as any)[key];
        return !val || (typeof val === 'string' && val.trim() === '');
      });

      // Non-critical warnings
      if (!requiredVars.STRIPE_WEBHOOK_SECRET) warnings.push('STRIPE_WEBHOOK_SECRET is not set (webhooks will be disabled until configured)');
      if (!requiredVars.MAILCHIMP_TRANSACTIONAL_API_KEY) warnings.push('MAILCHIMP_TRANSACTIONAL_API_KEY is not set (emails may be disabled)');

      if (criticalMissing.length > 0) {
        criticalMissing.forEach((key) => errors.push(`Missing required environment variable: ${key}`));
      }
    } else {
      console.log('🔧 Skipping environment validation during build process');
    }
    
    // Validate specific formats (only if present)
    if (requiredVars.DATABASE_URL && !this.isValidDatabaseUrl(requiredVars.DATABASE_URL)) {
      errors.push('DATABASE_URL format is invalid');
    }
    
    if (requiredVars.NEXTAUTH_URL && !this.isValidUrl(requiredVars.NEXTAUTH_URL)) {
      errors.push('NEXTAUTH_URL format is invalid');
    }
    
    if (requiredVars.NEXT_PUBLIC_SITE_URL && !this.isValidUrl(requiredVars.NEXT_PUBLIC_SITE_URL)) {
      errors.push('NEXT_PUBLIC_SITE_URL format is invalid');
    }
    
    if (requiredVars.STRIPE_SECRET_KEY && !requiredVars.STRIPE_SECRET_KEY.startsWith('sk_')) {
      errors.push('STRIPE_SECRET_KEY must start with sk_');
    }
    
    if (requiredVars.STRIPE_PUBLISHABLE_KEY && !requiredVars.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
      errors.push('STRIPE_PUBLISHABLE_KEY must start with pk_');
    }
    
    if (requiredVars.STRIPE_WEBHOOK_SECRET && !requiredVars.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      warnings.push('STRIPE_WEBHOOK_SECRET should start with whsec_');
    }
    
    if (requiredVars.PASSWORD_SALT && requiredVars.PASSWORD_SALT.length < 16) {
      errors.push('PASSWORD_SALT must be at least 16 characters long');
    }
    
    if (requiredVars.NEXTAUTH_SECRET && requiredVars.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
    }
    
    if (!['development', 'production', 'test'].includes(requiredVars.NODE_ENV || '')) {
      errors.push('NODE_ENV must be development, production, or test');
    }
    
    // Production-specific validations (only warn if missing HTTPS)
    if (requiredVars.NODE_ENV === 'production') {
      if (requiredVars.NEXT_PUBLIC_SITE_URL && !requiredVars.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        warnings.push('NEXT_PUBLIC_SITE_URL should use HTTPS in production');
      }
      if (requiredVars.NEXTAUTH_URL && !requiredVars.NEXTAUTH_URL.startsWith('https://')) {
        warnings.push('NEXTAUTH_URL should use HTTPS in production');
      }
    }
    
    if (errors.length > 0 && !isBuildTime) {
      console.error('❌ Environment validation failed:');
      errors.forEach(error => console.error(`   - ${error}`));
      // Throw only when truly blocking
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }

    if (warnings.length > 0 && !isBuildTime) {
      console.warn('⚠️ Environment validation warnings:');
      warnings.forEach(w => console.warn(`   - ${w}`));
    }
    
    // Create config with fallbacks for build time or missing optionals
    this.config = {
      DATABASE_URL: requiredVars.DATABASE_URL || 'postgresql://localhost:5432/dev',
      NEXTAUTH_SECRET: requiredVars.NEXTAUTH_SECRET || 'build-time-secret-32-characters-minimum-xxxxxxxx',
      NEXTAUTH_URL: requiredVars.NEXTAUTH_URL || 'http://localhost:3000',
      PASSWORD_SALT: requiredVars.PASSWORD_SALT || 'build-time-salt-16-chars-minimum',
      STRIPE_SECRET_KEY: requiredVars.STRIPE_SECRET_KEY || 'sk_test_build',
      STRIPE_PUBLISHABLE_KEY: requiredVars.STRIPE_PUBLISHABLE_KEY || 'pk_test_build',
      STRIPE_WEBHOOK_SECRET: requiredVars.STRIPE_WEBHOOK_SECRET || 'whsec_build',
      MAILCHIMP_TRANSACTIONAL_API_KEY: requiredVars.MAILCHIMP_TRANSACTIONAL_API_KEY || 'md-build',
      NEXT_PUBLIC_SITE_URL: requiredVars.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      NODE_ENV: (requiredVars.NODE_ENV || 'development') as 'development' | 'production' | 'test',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY // Optional
    };
    
    // Log successful validation (without sensitive values) - skip during build
    if (!isBuildTime) {
      console.log('✅ Environment variables validated successfully');
      console.log(`   - NODE_ENV: ${this.config.NODE_ENV}`);
      console.log(`   - SITE_URL: ${this.config.NEXT_PUBLIC_SITE_URL}`);
      console.log(`   - Database: ${this.config.DATABASE_URL.includes('localhost') ? 'Local' : 'Remote'}`);
      console.log(`   - Stripe: ${this.config.STRIPE_SECRET_KEY.includes('test') ? 'Test Mode' : 'Live Mode'}`);
    }
    
    return this.config;
  }
  
  /**
   * Get validated environment config
   */
  getConfig(): EnvironmentConfig {
    if (!this.config) {
      return this.validateAndLoad();
    }
    return this.config;
  }
  
  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getConfig().NODE_ENV === 'production';
  }
  
  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.getConfig().NODE_ENV === 'development';
  }
  
  /**
   * Check if Stripe is in test mode
   */
  isStripeTestMode(): boolean {
    return this.getConfig().STRIPE_SECRET_KEY.includes('test');
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  private isValidDatabaseUrl(url: string): boolean {
    return url.startsWith('postgresql://') || 
           url.startsWith('postgres://') || 
           url.startsWith('mysql://') || 
           url.startsWith('sqlite://') ||
           url.startsWith('file:');
  }
}

// Export singleton instance
export const env = EnvironmentValidator.getInstance();

// Export config getter for convenience
export const getEnvConfig = () => env.getConfig();

// Initialize validation on module load (will throw if invalid)
// Skip validation during build process
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && !process.env.NEXT_PHASE) {
  try {
    env.validateAndLoad();
  } catch (error) {
    // During development keep going, but in production we still want the error to surface
    if (process.env.NODE_ENV === 'development' || process.argv.includes('build')) {
      console.warn('⚠️ Environment validation skipped during build process');
    } else {
      // Already limited to critical failures above
      throw error;
    }
  }
} 