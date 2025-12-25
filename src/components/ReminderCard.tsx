import { Reminder } from "../types/reminder";
import { useReminderStore } from "../store/reminderStore";

interface ReminderCardProps {
  reminder: Reminder;
}

export default function ReminderCard({ reminder }: ReminderCardProps) {
  const { deleteReminder, toggleReminder, setEditingReminder, globalEnabled } =
    useReminderStore();

  const getRepeatText = () => {
    if (reminder.type === "interval" && reminder.interval) {
      return `Lặp lại mỗi ${reminder.interval} phút`;
    }
    if (
      reminder.type === "scheduled" &&
      reminder.times &&
      reminder.times.length > 0
    ) {
      if (reminder.times.length === 1) {
        return `Hàng ngày lúc ${reminder.times[0]}`;
      }
      return `${reminder.times.length} lần mỗi ngày`;
    }
    return "";
  };

  const handleTest = () => {
    window.electronAPI?.testReminder({
      emoji: reminder.icon,
      message: reminder.message,
      color: reminder.color,
      durationMinutes: reminder.displayMinutes,
    } as any);
  };

  const isActive = reminder.enabled && globalEnabled;

  return (
    <div
      className={`
        card group relative overflow-hidden
        ${!isActive ? "opacity-60" : ""}
      `}
    >
      {/* Color indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: reminder.color }}
      />

      <div className="flex items-start gap-3 pl-3">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0 mt-0.5">{reminder.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-dark-text text-base leading-snug mb-1">
            {reminder.message}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: reminder.color }}
            />
            <span className="text-xs text-gray-500 dark:text-dark-muted truncate">
              {getRepeatText()}
            </span>
            <span className="text-xs text-gray-500 dark:text-dark-muted">
              • {reminder.displayMinutes}p
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleTest}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            title="Test nhắc nhở"
          >
            <span className="text-sm">▶️</span>
          </button>
          <button
            onClick={() => toggleReminder(reminder.id)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors ${
              isActive ? "text-green-500" : "text-gray-400 dark:text-dark-muted"
            }`}
            title={isActive ? "Tắt" : "Bật"}
          >
            <span className="text-sm">{isActive ? "⏸️" : "▶️"}</span>
          </button>
          <button
            onClick={() => setEditingReminder(reminder)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors text-yellow-500"
            title="Chỉnh sửa"
          >
            <span className="text-sm">✏️</span>
          </button>
          <button
            onClick={() => deleteReminder(reminder.id)}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-gray-400 dark:text-dark-muted hover:text-red-500"
            title="Xóa"
          >
            <span className="text-sm">🗑️</span>
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      )}
    </div>
  );
}
