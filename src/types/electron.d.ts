// Type definitions for Electron API exposed via preload
export interface ElectronAPI {
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  scheduleReminder: (reminder: Reminder) => Promise<boolean>
  clearReminder: (id: string) => Promise<boolean>
  clearAllReminders: () => Promise<boolean>
  showNotification: (data: { emoji: string; message: string; color: string; durationMinutes: number }) => Promise<boolean>
  testReminder: (data: { emoji: string; message: string; color: string; durationMinutes: number }) => Promise<boolean>
  closeOverlay: () => void
}

export interface Reminder {
  id: string
  message: string
  emoji: string
  color: string
  type: 'interval' | 'fixed'
  intervalMinutes?: number
  fixedTime?: string
  durationMinutes: number
  enabled: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

