import { app, BrowserWindow, ipcMain, Notification, screen } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let reminderIntervals: Map<string, NodeJS.Timeout> = new Map()
let fixedTimeCheckers: Map<string, NodeJS.Timeout> = new Map()
let lastFixedTimeTriggers: Map<string, string> = new Map() // Track last trigger time to prevent duplicates

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const isDev = !!VITE_DEV_SERVER_URL

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 650,
    minWidth: 380,
    minHeight: 500,
    frame: false,
    transparent: false,
    backgroundColor: '#1a1a2e',
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createOverlayWindow(emoji: string, message: string, color: string, durationMinutes: number) {
  if (overlayWindow) {
    overlayWindow.close()
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  overlayWindow.setVisibleOnAllWorkspaces(true)
  overlayWindow.setAlwaysOnTop(true, 'screen-saver')

  const overlayHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: fadeIn 0.3s ease-out;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .container {
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        .emoji {
          font-size: 120px;
          margin-bottom: 30px;
          animation: pulse 2s infinite;
        }
        .message {
          font-size: 36px;
          color: white;
          font-weight: 600;
          max-width: 80%;
          margin: 0 auto 30px;
          line-height: 1.4;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${color};
          margin: 0 auto 20px;
          box-shadow: 0 0 20px ${color};
        }
        .close-hint {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin-top: 40px;
        }
        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          margin: 20px auto 0;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: ${color};
          animation: shrink ${durationMinutes * 60}s linear forwards;
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="color-indicator"></div>
        <div class="emoji">${emoji}</div>
        <div class="message">${message}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="close-hint">Nhấn vào bất kỳ đâu hoặc ESC để đóng</div>
      </div>
      <script>
        // Close handler will be injected after preload loads
        window.addEventListener('load', () => {
          function closeOverlay() {
            if (window.electronAPI) {
              window.electronAPI.closeOverlay();
            }
          }
          document.body.addEventListener('click', closeOverlay);
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
              closeOverlay();
            }
          });
        });
      </script>
    </body>
    </html>
  `

  overlayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(overlayHTML)}`)

  // Auto-close after duration
  const autoCloseTimeout = setTimeout(() => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close()
      overlayWindow = null
    }
  }, durationMinutes * 60 * 1000)

  overlayWindow.on('closed', () => {
    clearTimeout(autoCloseTimeout)
    overlayWindow = null
  })

  // Handle close via IPC
  overlayWindow.webContents.on('did-finish-load', () => {
    // Inject close handler that uses IPC
    overlayWindow?.webContents.executeJavaScript(`
      (function() {
        function closeOverlay() {
          window.electronAPI?.closeOverlay();
        }
        document.body.addEventListener('click', closeOverlay);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            closeOverlay();
          }
        });
      })();
    `).catch(() => {
      console.log('===> Failed to inject overlay close handler')
    })
  })
}

function showNotification(emoji: string, message: string, color: string, durationMinutes: number) {
  // Try native notification first
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Focus Reminder Desktop',
      body: `${emoji} ${message}`,
      silent: false,
      urgency: 'critical',
    })

    notification.show()

    notification.on('click', () => {
      // Show overlay on click for stronger reminder
      createOverlayWindow(emoji, message, color, durationMinutes)
    })
  }

  // Also show overlay for stronger reminder
  createOverlayWindow(emoji, message, color, durationMinutes)
}

function scheduleReminder(reminder: {
  id: string
  message: string
  icon?: string
  emoji?: string // Legacy support
  color: string
  type: 'interval' | 'scheduled' | 'fixed' // 'fixed' for legacy
  interval?: number
  intervalMinutes?: number // Legacy
  times?: string[]
  fixedTime?: string // Legacy
  displayMinutes?: number
  durationMinutes?: number // Legacy
  enabled: boolean
}) {
  // Clear existing scheduler for this reminder
  clearReminderScheduler(reminder.id)

  if (!reminder.enabled) return

  const icon = reminder.icon || reminder.emoji || '💧'
  const displayMinutes = reminder.displayMinutes || reminder.durationMinutes || 1

  if (reminder.type === 'interval' && (reminder.interval || reminder.intervalMinutes)) {
    // Interval-based reminder
    const intervalMinutes = reminder.interval || reminder.intervalMinutes || 30
    const intervalMs = intervalMinutes * 60 * 1000

    const intervalId = setInterval(() => {
      showNotification(icon, reminder.message, reminder.color, displayMinutes)
    }, intervalMs)

    reminderIntervals.set(reminder.id, intervalId)
  } else if ((reminder.type === 'scheduled' && reminder.times && reminder.times.length > 0) ||
             (reminder.type === 'fixed' && reminder.fixedTime)) {
    // Scheduled reminder with multiple times or legacy fixed time
    const times = reminder.type === 'scheduled' && reminder.times 
      ? reminder.times 
      : reminder.fixedTime 
        ? [reminder.fixedTime] 
        : []

    // Check every minute
    const checkInterval = setInterval(() => {
      const now = new Date()
      const currentTimeKey = `${now.getHours()}:${now.getMinutes()}`
      const lastTrigger = lastFixedTimeTriggers.get(reminder.id)

      // Check if current time matches any scheduled time
      const shouldTrigger = times.some((time) => {
        const [hours, minutes] = time.split(':').map(Number)
        return now.getHours() === hours && now.getMinutes() === minutes
      })

      // Only trigger if it's the right time and we haven't triggered in this minute
      if (shouldTrigger && lastTrigger !== currentTimeKey) {
        lastFixedTimeTriggers.set(reminder.id, currentTimeKey)
        showNotification(icon, reminder.message, reminder.color, displayMinutes)
      }
    }, 60000) // Check every minute

    fixedTimeCheckers.set(reminder.id, checkInterval)
  }
}

function clearReminderScheduler(id: string) {
  if (reminderIntervals.has(id)) {
    clearInterval(reminderIntervals.get(id))
    reminderIntervals.delete(id)
  }
  if (fixedTimeCheckers.has(id)) {
    clearInterval(fixedTimeCheckers.get(id))
    fixedTimeCheckers.delete(id)
  }
  lastFixedTimeTriggers.delete(id)
}

function clearAllSchedulers() {
  reminderIntervals.forEach((interval) => clearInterval(interval))
  fixedTimeCheckers.forEach((interval) => clearInterval(interval))
  reminderIntervals.clear()
  fixedTimeCheckers.clear()
  lastFixedTimeTriggers.clear()
}

// IPC Handlers
ipcMain.handle('schedule-reminder', (_, reminder) => {
  scheduleReminder(reminder)
  return true
})

ipcMain.handle('clear-reminder', (_, id: string) => {
  clearReminderScheduler(id)
  return true
})

ipcMain.handle('clear-all-reminders', () => {
  clearAllSchedulers()
  return true
})

ipcMain.handle('show-notification', (_, { emoji, message, color, durationMinutes }) => {
  showNotification(emoji, message, color, durationMinutes)
  return true
})

ipcMain.handle('test-reminder', (_, { emoji, message, color, durationMinutes }) => {
  showNotification(emoji, message, color, durationMinutes)
  return true
})

ipcMain.on('close-overlay', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close()
    overlayWindow = null
  }
})

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

// App lifecycle
app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  clearAllSchedulers()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  clearAllSchedulers()
})
