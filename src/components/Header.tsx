import { useReminderStore } from '../store/reminderStore'

export default function Header() {
  const { globalEnabled, toggleGlobalEnabled } = useReminderStore()

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow()
  }

  const handleClose = () => {
    window.electronAPI?.closeWindow()
  }

  return (
    <header className="draggable flex items-center justify-between px-4 py-3 bg-dark-card border-b border-dark-border">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div>
          <h1 className="text-lg font-semibold text-dark-text">Focus Reminder</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-dark-muted">Bật nhắc nhở</span>
            <button
              onClick={toggleGlobalEnabled}
              className={`non-draggable toggle-switch ${globalEnabled ? 'active' : ''}`}
              aria-label="Toggle reminders"
            />
          </div>
        </div>
      </div>

      <div className="non-draggable flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-hover transition-colors"
          aria-label="Minimize"
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor" className="text-dark-muted">
            <rect width="12" height="2" rx="1" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-hover transition-colors"
          aria-label="Maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dark-muted">
            <rect x="1" y="1" width="8" height="8" rx="1" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 transition-colors group"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dark-muted group-hover:text-red-500">
            <path d="M1 1L9 9M1 9L9 1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
