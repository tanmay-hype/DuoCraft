export type BirthdayTheme =
  | "warm-confetti"
  | "rose-celebration"
  | "midnight-gold";

export type ThankYouTheme =
  | "pressed-flowers"
  | "warm-paper"
  | "garden-note";

export type PhotoPuzzleTheme =
  | "classic-pieces"
  | "romantic-pieces"
  | "playful-pieces";

export type BirthdayPersonalization = {
  recipient_name: string;
  sender_name: string;
  headline: string;
  message: string;
};

export type ThankYouPersonalization = {
  recipient_name: string;
  sender_name: string;
  headline: string;
  message: string;
};

export type PhotoPuzzlePersonalization = {
  recipient_name: string;
  sender_name: string;
  message: string;
  photo_asset_id: string | null;
};

export type Draft = {
  id: string;
  product_id: number;
  template_key: string;
  personalization: Record<string, unknown>;
  theme_key: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

export type DraftUpdate = {
  personalization?: Record<string, unknown>;
  theme_key?: string | null;
};