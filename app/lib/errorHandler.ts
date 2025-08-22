export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export const ErrorHandler = {
  // Log error for debugging (only in development)
  logError(error: Error | AppError, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'App'}] Error:`, error);
    }
  },

  // Create user-friendly error message
  getUserMessage(error: Error | AppError, fallback: string = 'Ett oväntat fel uppstod'): string {
    if (error instanceof AppError) {
      return error.message;
    }
    
    // Map common errors to user-friendly messages
    if (error.message.includes('Failed to fetch')) {
      return 'Anslutningsproblem. Kontrollera din internetanslutning.';
    }
    
    if (error.message.includes('401')) {
      return 'Du behöver logga in för att fortsätta.';
    }
    
    if (error.message.includes('403')) {
      return 'Du har inte behörighet för denna åtgärd.';
    }
    
    if (error.message.includes('404')) {
      return 'Den begärda informationen kunde inte hittas.';
    }
    
    if (error.message.includes('500')) {
      return 'Ett serverfel uppstod. Försök igen senare.';
    }
    
    return fallback;
  },

  // Handle API errors consistently
  handleApiError(response: Response, defaultMessage: string = 'API-fel uppstod'): AppError {
    const status = response.status;
    
    switch (status) {
      case 400:
        return new AppError('Ogiltiga data skickades till servern', 'BAD_REQUEST');
      case 401:
        return new AppError('Du behöver logga in för att fortsätta', 'UNAUTHORIZED');
      case 403:
        return new AppError('Du har inte behörighet för denna åtgärd', 'FORBIDDEN');
      case 404:
        return new AppError('Den begärda informationen kunde inte hittas', 'NOT_FOUND');
      case 429:
        return new AppError('För många förfrågningar. Försök igen senare.', 'RATE_LIMITED');
      case 500:
        return new AppError('Ett serverfel uppstod. Försök igen senare.', 'SERVER_ERROR');
      default:
        return new AppError(defaultMessage, 'UNKNOWN_ERROR', { status });
    }
  },

  // Async wrapper for consistent error handling
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackMessage?: string
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            this.getUserMessage(error as Error, fallbackMessage),
            'OPERATION_FAILED',
            error
          );
      
      this.logError(appError, context);
      return { error: appError };
    }
  }
};

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: Error | AppError, context?: string) => {
    ErrorHandler.logError(error, context);
    return ErrorHandler.getUserMessage(error);
  };

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context: string,
    onError?: (message: string) => void
  ): Promise<T | null> => {
    const result = await ErrorHandler.withErrorHandling(operation, context);
    
    if (result.error) {
      onError?.(result.error.message);
      return null;
    }
    
    return result.data!;
  };

  return { handleError, withErrorHandling };
} 