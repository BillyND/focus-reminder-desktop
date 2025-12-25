import { contextBridge, ipcRenderer } from 'electron'

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

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Reminder scheduling
  scheduleReminder: (reminder: Reminder) => ipcRenderer.invoke('schedule-reminder', reminder),
  clearReminder: (id: string) => ipcRenderer.invoke('clear-reminder', id),
  clearAllReminders: () => ipcRenderer.invoke('clear-all-reminders'),

  // Notifications
  showNotification: (data: { emoji: string; message: string; color: string; durationMinutes: number }) =>
    ipcRenderer.invoke('show-notification', data),
  testReminder: (data: { emoji: string; message: string; color: string; durationMinutes: number }) =>
    ipcRenderer.invoke('test-reminder', data),

  // Overlay
  closeOverlay: () => ipcRenderer.send('close-overlay'),
})

// Type declarations for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
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
  }
}
