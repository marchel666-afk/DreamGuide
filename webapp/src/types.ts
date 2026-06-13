export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface User {
  id: number;
  username?: string;
  first_name: string;
  streak_days: number;
  total_stars: number;
  is_premium: boolean;
  free_interpretations_today: number;
}

export type Emotion = 'fear' | 'joy' | 'sadness' | 'surprise';

export type InterpretationType = 'psychological' | 'everyday' | 'creative';

export interface Dream {
  id: number;
  user_id: number;
  text: string;
  emotion: Emotion;
  created_at: string;
  is_public: boolean;
  interpretations?: Interpretation[];
}

export interface Interpretation {
  id: number;
  dream_id: number;
  type: InterpretationType;
  content: string;
  is_premium: boolean;
  created_at: string;
}

export interface Stats {
  total_dreams: number;
  streak_days: number;
  total_stars: number;
  emotions: Record<string, number>;
  recent_dreams: Dream[];
}

export interface GalleryDream {
  id: number;
  text: string;
  emotion: Emotion;
  created_at: string;
  author_initials: string;
}

export interface CalendarData {
  [date: string]: number;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          query_id?: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        expand(): void;
        close(): void;
        ready(): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback: (ok: boolean) => void): void;
        MainButton: {
          text: string;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive: boolean): void;
          hideProgress(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          setParams(params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }): void;
        };
        BackButton: {
          isVisible: boolean;
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
      };
    };
  }
}
