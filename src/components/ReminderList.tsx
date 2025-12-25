import { useReminderStore } from '../store/reminderStore'
import ReminderCard from './ReminderCard'

export default function ReminderList() {
  const { reminders, setActiveTab } = useReminderStore()

  if (reminders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <span className="text-6xl mb-4">📭</span>
        <h2 className="text-xl font-semibold text-dark-text mb-2">
          Chưa có nhắc nhở nào
        </h2>
        <p className="text-dark-muted mb-6">
          Tạo nhắc nhở đầu tiên để bắt đầu
        </p>
        <button
          onClick={() => setActiveTab('add')}
          className="btn btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          <span>Thêm nhắc nhở</span>
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {reminders.map((reminder, index) => (
        <div
          key={reminder.id}
          className="animate-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ReminderCard reminder={reminder} />
        </div>
      ))}
    </div>
  )
}
