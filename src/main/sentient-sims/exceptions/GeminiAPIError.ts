import { ApiError } from '@google/genai';

export function isApiError(data: unknown): data is ApiError {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const errorObj = data as Record<string, unknown>;

  return typeof errorObj.status === 'number' && typeof errorObj.message === 'string';
}
