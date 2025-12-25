import { Reminder, ReminderFormData } from "@/types/reminder";
import { ReminderType } from "@/types/common";
import { REMINDER_TYPE } from "@/constants";
import i18n from "@/i18n/config";

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
    return i18n.t("repeat-every-minutes", { minutes: reminder.interval });
  }
  if (
    reminder.type === REMINDER_TYPE.SCHEDULED &&
    reminder.times &&
    reminder.times.length > 0
  ) {
    if (reminder.times.length === 1) {
      return i18n.t("daily-at", { time: reminder.times[0] });
    }
    return i18n.t("times-a-day", { count: reminder.times.length });
  }
  return "";
};

export const getPreviewText = (formData: ReminderFormData): string => {
  if (formData.type === REMINDER_TYPE.INTERVAL && formData.interval) {
    return i18n.t("repeats-every", { minutes: formData.interval });
  }
  if (
    formData.type === REMINDER_TYPE.SCHEDULED &&
    formData.times &&
    formData.times.length > 0
  ) {
    return i18n.t("times-daily", {
      count: formData.times.length,
      times: formData.times.join(", "),
    });
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
    return { valid: false, error: i18n.t("add-time-required") };
  }
  return { valid: true };
};
