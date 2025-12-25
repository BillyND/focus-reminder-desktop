import { ReminderType } from "./common";

export interface Reminder {
  id: string;
  message: string;
  icon: string; // Changed from emoji to icon for consistency
  color: string;
  type: ReminderType;
  interval?: number; // Minutes for interval type
  times?: string[]; // Array of "HH:mm" for scheduled type
  displayMinutes: number; // Changed from durationMinutes
  enabled: boolean;
}

export interface AppSettings {
  enabled: boolean;
  soundEnabled: boolean;
  soundVolume?: number; // 0-100
  language?: string; // Language code (en, vi, fr, etc.)
}

export interface AppData {
  reminders: Reminder[];
  settings: AppSettings;
  version: string;
}

export type ReminderFormData = Omit<Reminder, "id">;

export const PRESET_EMOJIS = [
  "💧",
  "🏃",
  "👀",
  "🧘",
  "💪",
  "🎯",
  "☕",
  "🍎",
  "📚",
  "✨",
  "🌟",
  "⏰",
  "🔔",
  "💡",
  "🎵",
  "🌈",
  "❤️",
  "🔥",
  "🌙",
  "☀️",
  "🌸",
  "🍀",
  "🎮",
  "📱",
];

export const PRESET_COLORS = [
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#f97316", // orange
];

export const DURATION_OPTIONS = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 5 },
];
