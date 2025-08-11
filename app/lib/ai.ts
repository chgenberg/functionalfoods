export const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || process.env.NEXT_PUBLIC_OPENAI_CHAT_MODEL || 'gpt-5-mini';

export function resolveModel(fallback?: string): string {
  return OPENAI_CHAT_MODEL || fallback || 'gpt-5-mini';
} 