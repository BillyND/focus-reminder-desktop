// ============================================
// REMINDER TYPES
// ============================================
export const REMINDER_TYPE = {
  INTERVAL: "interval",
  SCHEDULED: "scheduled",
} as const;

// ============================================
// TAB TYPES
// ============================================
export const TAB = {
  REMINDERS: "reminders",
  ADD: "add",
  SETTINGS: "settings",
} as const;

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  REMINDER_STORE: "focus-reminder-desktop-storage",
  SETTINGS_STORE: "focus-reminder-settings",
} as const;

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULTS = {
  ICON: "💧",
  TIME: "09:00",
  INTERVAL: 30,
  DISPLAY_MINUTES: 1,
  SOUND_VOLUME: 50,
  COLOR_INDEX: 0,
} as const;

// ============================================
// INTERVAL PRESETS (minutes)
// ============================================
export const INTERVAL_PRESETS = [15, 30, 60] as const;

// ============================================
// VALIDATION LIMITS
// ============================================
export const LIMITS = {
  MIN_INTERVAL: 1,
  MAX_INTERVAL: 1440, // 24 hours in minutes
  MAX_EMOJI_LENGTH: 4,
} as const;

// ============================================
// MESSAGES
// ============================================
export const MESSAGES = {
  NO_REMINDERS_TITLE: "No reminders yet",
  NO_REMINDERS_DESCRIPTION: "Create your first reminder to get started",
  ADD_REMINDER: "Add reminder",
  REMINDER_CONTENT: "Reminder Content",
  ENTER_REMINDER_CONTENT: "Enter reminder content...",
  ICON: "Icon",
  CLICK_TO_CHOOSE_ICON: "Click to choose an icon",
  COLOR: "Color",
  REMINDER_TYPE: "Reminder Type",
  REPEAT_BY_MINUTES: "Repeat by minutes",
  FIXED_TIME: "Fixed time",
  REPEAT: "Repeat",
  REPEAT_EVERY: "Repeat every (minutes)",
  REMINDER_TIME: "Reminder Time",
  ADD: "Add",
  DISPLAY_DURATION: "Notification display duration",
  PREVIEW: "Preview",
  CANCEL: "Cancel",
  SAVE_REMINDER: "Save Reminder",
  EDIT_REMINDER: "Edit Reminder",
  SAVE_CHANGES: "Save Changes",
  DISPLAY_DURATION_SHORT: "Display duration",
  TEST_REMINDER: "Test reminder",
  ENABLE: "Enable",
  DISABLE: "Disable",
  EDIT: "Edit",
  DELETE: "Delete",
  REPEAT_EVERY_MINUTES: (minutes: number) => `Repeat every ${minutes} minutes`,
  DAILY_AT: (time: string) => `Daily at ${time}`,
  TIMES_A_DAY: (count: number) => `${count} times a day`,
  REPEATS_EVERY: (minutes: number) => `Repeats every ${minutes} minutes`,
  TIMES_DAILY: (times: string[]) =>
    `${times.length} times daily: ${times.join(", ")}`,
  ADD_TIME_REQUIRED: "Please add at least one reminder time!",
  DATA_IMPORTED_SUCCESS: "Data imported successfully!",
  DATA_IMPORTED_ERROR: "Error: Invalid data!",
  DATA_RESET_SUCCESS: "All data has been reset!",
  CONFIRM_RESET: "Confirm reset?",
  RESET_ALL: "Reset All",
  NOTIFICATION_SOUND: "Notification Sound",
  NOTIFICATION_SOUND_DESCRIPTION: "Play sound when showing reminders",
  NOTIFICATION_VOLUME: "Notification Volume",
  NOTIFICATION_VOLUME_DESCRIPTION: "Adjust sound volume",
  DATA_MANAGEMENT: "Data Management",
  EXPORT_DATA: "Export Data",
  IMPORT_DATA: "Import Data",
  PASTE_CUSTOM_EMOJI: "Paste custom emoji...",
  OK: "OK",
  CLOSE: "Close",
} as const;

// ============================================
// APP VERSION
// ============================================
export const APP_VERSION = "1.1.0";

// ============================================
// FILE NAMES
// ============================================
export const FILE_NAMES = {
  BACKUP_PREFIX: "focus-reminder-backup-",
  BACKUP_EXTENSION: ".json",
} as const;
