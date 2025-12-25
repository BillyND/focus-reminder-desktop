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

export type ReminderFormData = Omit<Reminder, 'id'>

export const PRESET_EMOJIS = [
  '💧', '🏃', '👀', '🧘', '💪', '🎯',
  '☕', '🍎', '📚', '✨', '🌟', '⏰',
  '🔔', '💡', '🎵', '🌈', '❤️', '🔥',
  '🌙', '☀️', '🌸', '🍀', '🎮', '📱',
]

export const PRESET_COLORS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#f97316', // orange
]

export const DURATION_OPTIONS = [
  { value: 1, label: '1p' },
  { value: 2, label: '2p' },
  { value: 3, label: '3p' },
  { value: 5, label: '5p' },
]
