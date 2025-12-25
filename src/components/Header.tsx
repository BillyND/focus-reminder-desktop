import { useReminderStore } from '../store/reminderStore'
import { useSettingsStore } from '../store/settingsStore'

export default function Header() {
  const { globalEnabled, toggleGlobalEnabled } = useReminderStore()
  const { settings, toggleDarkMode, showSettings, setShowSettings } = useSettingsStore()

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
    <header className="draggable flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💧</span>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Nhắc nhở sức khỏe</h1>
        </div>
      </div>

      <div className="non-draggable flex items-center gap-2">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-dark-muted">
            <circle cx="9" cy="9" r="2.5" />
            <path d="M9 1V3M9 15V17M17 9H15M3 9H1M14.66 3.34L13.24 4.76M4.76 13.24L3.34 14.66M14.66 14.66L13.24 13.24M4.76 4.76L3.34 3.34" />
          </svg>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          aria-label="Toggle theme"
        >
          {settings.darkMode ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-gray-600 dark:text-dark-muted">
              <path d="M9 1C4.58 1 1 4.58 1 9s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
              <path d="M9 3v2M9 13v2M3 9h2M13 9h2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-gray-600">
              <path d="M9 1C4.58 1 1 4.58 1 9s3.58 8 8 8c.34 0 .67-.03 1-.08-1.79-.89-3-2.75-3-4.92 0-3.31 2.69-6 6-6 .34 0 .67.03 1 .08C14.67 2.33 12.07 1 9 1z" />
            </svg>
          )}
        </button>

        {/* Window Controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            aria-label="Minimize"
          >
            <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor" className="text-gray-600 dark:text-dark-muted">
              <rect width="12" height="2" rx="1" />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            aria-label="Maximize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 dark:text-dark-muted">
              <rect x="1" y="1" width="8" height="8" rx="1" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 transition-colors group"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 dark:text-dark-muted group-hover:text-red-500">
              <path d="M1 1L9 9M1 9L9 1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
