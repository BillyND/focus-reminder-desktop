import { Reminder, ReminderFormData } from "@/types/reminder";
import { ReminderType } from "@/types/common";
import { REMINDER_TYPE, MESSAGES } from "@/constants";

// ============================================
// TYPE CHECKING UTILITIES
// ============================================
export const isIntervalType = (type: ReminderType): boolean => {
  return type === REMINDER_TYPE.INTERVAL;
};

export const isScheduledType = (type: ReminderType): boolean => {
  return type === REMINDER_TYPE.SCHEDULED;
};

// ============================================
// FORMATTING UTILITIES
// ============================================
export const getRepeatText = (reminder: Reminder): string => {
  if (reminder.type === REMINDER_TYPE.INTERVAL && reminder.interval) {
    return MESSAGES.REPEAT_EVERY_MINUTES(reminder.interval);
  }
  if (
    reminder.type === REMINDER_TYPE.SCHEDULED &&
    reminder.times &&
    reminder.times.length > 0
  ) {
    if (reminder.times.length === 1) {
      return MESSAGES.DAILY_AT(reminder.times[0]);
    }
    return MESSAGES.TIMES_A_DAY(reminder.times.length);
  }
  return "";
};

export const getPreviewText = (formData: ReminderFormData): string => {
  if (formData.type === REMINDER_TYPE.INTERVAL && formData.interval) {
    return MESSAGES.REPEATS_EVERY(formData.interval);
  }
  if (
    formData.type === REMINDER_TYPE.SCHEDULED &&
    formData.times &&
    formData.times.length > 0
  ) {
    return MESSAGES.TIMES_DAILY(formData.times);
  }
  return "";
};

// ============================================
// CONVERSION UTILITIES
// ============================================
export const toElectronReminder = (
  reminder: Reminder
): {
  id: string;
  message: string;
  icon: string;
  color: string;
  type: ReminderType;
  interval?: number;
  times?: string[];
  displayMinutes: number;
  enabled: boolean;
} => {
  return {
    id: reminder.id,
    message: reminder.message,
    icon: reminder.icon,
    color: reminder.color,
    type: reminder.type,
    interval: reminder.interval,
    times: reminder.times,
    displayMinutes: reminder.displayMinutes,
    enabled: reminder.enabled,
  };
};

// ============================================
// VALIDATION UTILITIES
// ============================================
export const validateReminderForm = (
  formData: ReminderFormData
): { valid: boolean; error?: string } => {
  if (!formData.message.trim()) {
    return { valid: false, error: "Message is required" };
  }
  if (
    formData.type === REMINDER_TYPE.SCHEDULED &&
    (!formData.times || formData.times.length === 0)
  ) {
    return { valid: false, error: MESSAGES.ADD_TIME_REQUIRED };
  }
  return { valid: true };
};
