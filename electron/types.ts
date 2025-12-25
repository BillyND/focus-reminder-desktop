import { REMINDER_TYPE } from "./constants";

export type ReminderType = (typeof REMINDER_TYPE)[keyof typeof REMINDER_TYPE];

export interface Reminder {
  id: string;
  message: string;
  icon: string;
  color: string;
  type: ReminderType;
  interval?: number;
  times?: string[];
  displayMinutes: number;
  enabled: boolean;
}

export interface SoundSettings {
  soundEnabled: boolean;
  soundVolume: number;
}
