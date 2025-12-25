import { REMINDER_TYPE } from "../constants";
import { Reminder } from "../types";
import { showNotification } from "./notificationService";

const reminderIntervals: Map<string, NodeJS.Timeout> = new Map();
const fixedTimeCheckers: Map<string, NodeJS.Timeout> = new Map();
const lastFixedTimeTriggers: Map<string, string> = new Map();

export function scheduleReminder(reminder: Reminder): void {
  clearReminderScheduler(reminder.id);

  if (!reminder.enabled) return;

  const icon = reminder.icon || "💧";
  const displayMinutes = reminder.displayMinutes || 1;

  if (reminder.type === REMINDER_TYPE.INTERVAL && reminder.interval) {
    const intervalMs = reminder.interval * 60 * 1000;

    const intervalId = setInterval(() => {
      showNotification(
        icon,
        reminder.message,
        reminder.color,
        displayMinutes,
        reminder.id
      ).catch((err) => {
        console.error("===> Error showing notification:", err);
      });
    }, intervalMs);

    reminderIntervals.set(reminder.id, intervalId);
  } else if (
    reminder.type === REMINDER_TYPE.SCHEDULED &&
    reminder.times &&
    reminder.times.length > 0
  ) {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentTimeKey = `${now.getHours()}:${now.getMinutes()}`;
      const lastTrigger = lastFixedTimeTriggers.get(reminder.id);

      const shouldTrigger = reminder.times!.some((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return now.getHours() === hours && now.getMinutes() === minutes;
      });

      if (shouldTrigger && lastTrigger !== currentTimeKey) {
        lastFixedTimeTriggers.set(reminder.id, currentTimeKey);
        showNotification(
          icon,
          reminder.message,
          reminder.color,
          displayMinutes,
          reminder.id
        ).catch((err) => {
          console.error("===> Error showing notification:", err);
        });
      }
    }, 60000);

    fixedTimeCheckers.set(reminder.id, checkInterval);
  }
}

export function clearReminderScheduler(id: string): void {
  if (reminderIntervals.has(id)) {
    clearInterval(reminderIntervals.get(id));
    reminderIntervals.delete(id);
  }
  if (fixedTimeCheckers.has(id)) {
    clearInterval(fixedTimeCheckers.get(id));
    fixedTimeCheckers.delete(id);
  }
  lastFixedTimeTriggers.delete(id);
}

export function clearAllSchedulers(): void {
  reminderIntervals.forEach((interval) => clearInterval(interval));
  fixedTimeCheckers.forEach((interval) => clearInterval(interval));
  reminderIntervals.clear();
  fixedTimeCheckers.clear();
  lastFixedTimeTriggers.clear();
}
