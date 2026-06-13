import type {
  Dream,
  Interpretation,
  Stats,
  GalleryDream,
  CalendarData,
} from './types';
import { mockApi } from './api.mock';

const MOCK_MODE = import.meta.env.VITE_MOCK === 'true';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const getInitData = (): string => window.Telegram?.WebApp?.initData ?? '';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Init-Data': getInitData(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = (await response.json()) as { detail?: string; message?: string };
      message = body.detail ?? body.message ?? message;
    } catch {
      // ignore JSON parse errors; use the default message
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
};

export const api = MOCK_MODE ? mockApi : {
  dreams: {
    list: (page = 1): Promise<Dream[]> =>
      apiRequest<Dream[]>(`/dreams?page=${page}`),

    get: (id: number): Promise<Dream> =>
      apiRequest<Dream>(`/dreams/${id}`),

    create: (data: { text: string; emotion: string }): Promise<Dream> =>
      apiRequest<Dream>('/dreams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    interpret: (id: number, type: string): Promise<Interpretation> =>
      apiRequest<Interpretation>(`/dreams/${id}/interpret`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      }),

    togglePublic: (id: number): Promise<Dream> =>
      apiRequest<Dream>(`/dreams/${id}/toggle-public`, {
        method: 'PATCH',
      }),
  },

  stats: {
    get: (): Promise<Stats> =>
      apiRequest<Stats>('/stats'),

    calendar: (): Promise<CalendarData> =>
      apiRequest<CalendarData>('/stats/calendar'),

    emotions: (): Promise<Record<string, number>> =>
      apiRequest<Record<string, number>>('/stats/emotions'),
  },

  gallery: {
    list: (page = 1): Promise<GalleryDream[]> =>
      apiRequest<GalleryDream[]>(`/gallery?page=${page}`),
  },

  payments: {
    prices: (): Promise<Record<string, number>> =>
      apiRequest<Record<string, number>>('/payments/prices'),
  },
};

export { ApiError };
