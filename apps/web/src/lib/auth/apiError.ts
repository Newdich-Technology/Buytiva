/** Normalize the API's nested error envelope for existing server actions. */
export function normalizeApiError(data: unknown): { message?: string; code?: string; requestId?: string } {
  if (!data || typeof data !== 'object') return {};
  const value = data as Record<string, unknown>;
  const nested = value.error && typeof value.error === 'object' ? value.error as Record<string, unknown> : value;
  return { ...(typeof nested.message === 'string' ? { message: nested.message } : {}),
    ...(typeof nested.code === 'string' ? { code: nested.code } : {}),
    ...(typeof nested.requestId === 'string' ? { requestId: nested.requestId } : {}) };
}
