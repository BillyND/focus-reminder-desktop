import { useReminderStore } from '../store/reminderStore'

type TabType = 'reminders' | 'add' | 'notes' | 'messages'

interface Tab {
  id: TabType
  label: string
  icon: string
}

const tabs: Tab[] = [
  { id: 'reminders', label: 'Nhắc nhở', icon: '🔔' },
  { id: 'add', label: 'Thêm mới', icon: '➕' },
  { id: 'notes', label: 'Ghi chú', icon: '📝' },
  { id: 'messages', label: 'Nhắn tin', icon: '💬' },
]

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useReminderStore()

  return (
    <nav className="flex border-b border-dark-border bg-dark-card/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-2
            text-sm font-medium transition-all duration-200
            ${activeTab === tab.id
              ? 'text-accent-purple border-b-2 border-accent-purple bg-dark-hover/30'
              : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover/20'
            }
          `}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
