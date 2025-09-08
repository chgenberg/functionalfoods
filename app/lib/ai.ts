export const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || process.env.NEXT_PUBLIC_OPENAI_CHAT_MODEL || 'gpt-4o-mini';

export function resolveModel(fallback?: string): string {
  return OPENAI_CHAT_MODEL || fallback || 'gpt-4o-mini';
}

export async function chatWithFallback(openai: any, params: { messages: any[]; max_tokens?: number; temperature?: number; stop?: any; }) {
  const primaryModel = resolveModel('gpt-4o-mini');
  try {
    return await openai.chat.completions.create({ model: primaryModel, ...params });
  } catch (err: any) {
    const message = (err?.message || '').toLowerCase();
    const isModelIssue = message.includes('model') || message.includes('unknown') || message.includes('not found');
    if (isModelIssue) {
      // Fallback to a widely available model name
      return await openai.chat.completions.create({ model: 'gpt-4o-mini', ...params });
    }
    throw err;
  }
} 