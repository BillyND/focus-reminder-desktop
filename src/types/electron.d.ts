// Type definitions for Electron API exposed via preload
import { Reminder } from './reminder'

export interface ElectronAPI {
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  scheduleReminder: (reminder: Reminder | any) => Promise<boolean>
  clearReminder: (id: string) => Promise<boolean>
  clearAllReminders: () => Promise<boolean>
  showNotification: (data: { emoji: string; message: string; color: string; durationMinutes: number }) => Promise<boolean>
  testReminder: (data: { emoji: string; message: string; color: string; durationMinutes: number }) => Promise<boolean>
  closeOverlay: () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

