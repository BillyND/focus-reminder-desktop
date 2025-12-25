import { useEffect } from 'react'
import { useReminderStore } from './store/reminderStore'
import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import ReminderList from './components/ReminderList'
import AddReminder from './components/AddReminder'
import EditModal from './components/EditModal'
import Placeholder from './components/Placeholder'

function App() {
  const { activeTab, syncAllReminders, editingReminder } = useReminderStore()

  useEffect(() => {
    // Sync all reminders when app starts
    syncAllReminders()
  }, [syncAllReminders])

  const renderContent = () => {
    switch (activeTab) {
      case 'reminders':
        return <ReminderList />
      case 'add':
        return <AddReminder />
      case 'notes':
        return <Placeholder icon="📝" title="Ghi chú" message="Tính năng đang phát triển" />
      case 'messages':
        return <Placeholder icon="💬" title="Nhắn tin" message="Tính năng đang phát triển" />
      default:
        return <ReminderList />
    }
  }

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      {editingReminder && <EditModal />}
    </div>
  )
}

export default App
