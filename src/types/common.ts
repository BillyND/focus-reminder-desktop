import { REMINDER_TYPE, TAB } from "@/constants";

// ============================================
// REMINDER TYPES
// ============================================
export type ReminderType = typeof REMINDER_TYPE[keyof typeof REMINDER_TYPE];

// ============================================
// TAB TYPES
// ============================================
export type TabType = typeof TAB[keyof typeof TAB];

// ============================================
// UTILITY TYPES
// ============================================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

