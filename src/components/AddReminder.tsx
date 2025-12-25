import { useState } from 'react'
import { useReminderStore } from '../store/reminderStore'
import { PRESET_EMOJIS, PRESET_COLORS, DURATION_OPTIONS } from '../types/reminder'
import { Reminder } from '../types/reminder'
import EmojiPicker from './EmojiPicker'
import ColorPicker from './ColorPicker'

const defaultFormData = {
  message: '',
  icon: '💧',
  color: PRESET_COLORS[0],
  type: 'interval' as 'interval' | 'scheduled',
  interval: 30,
  times: ['09:00'] as string[],
  displayMinutes: 1,
  enabled: true,
}

export default function AddReminder() {
  const { addReminder, setActiveTab } = useReminderStore()
  const [formData, setFormData] = useState(defaultFormData)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [newTime, setNewTime] = useState('09:00')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) return
    if (formData.type === 'scheduled' && formData.times.length === 0) {
      alert('Vui lòng thêm ít nhất một thời gian nhắc nhở!')
      return
    }

    const reminderData: Reminder = {
      id: '', // Will be generated in store
      message: formData.message,
      icon: formData.icon,
      color: formData.color,
      type: formData.type,
      displayMinutes: formData.displayMinutes,
      enabled: formData.enabled,
      ...(formData.type === 'interval' 
        ? { interval: formData.interval }
        : { times: formData.times }
      ),
    }

    addReminder(reminderData)
    setFormData(defaultFormData)
    setActiveTab('reminders')
  }

  const handleReset = () => {
    setFormData(defaultFormData)
  }

  const addTime = () => {
    if (newTime && !formData.times.includes(newTime)) {
      setFormData({
        ...formData,
        times: [...formData.times, newTime].sort(),
      })
      setNewTime('09:00')
    }
  }

  const removeTime = (time: string) => {
    setFormData({
      ...formData,
      times: formData.times.filter((t) => t !== time),
    })
  }

  return (
    <div className="h-full overflow-y-auto p-4 bg-white dark:bg-dark-bg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Message */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Nội dung nhắc nhở
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Nhập nội dung nhắc nhở..."
            className="w-full h-24"
            required
          />
        </div>

        {/* Icon Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Biểu tượng
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-14 h-14 text-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors flex items-center justify-center"
            >
              {formData.icon}
            </button>
            <span className="text-sm text-gray-500 dark:text-dark-muted">
              Nhấn để chọn biểu tượng
            </span>
          </div>
          {showEmojiPicker && (
            <EmojiPicker
              selectedEmoji={formData.icon}
              onSelect={(icon) => {
                setFormData({ ...formData, icon })
                setShowEmojiPicker(false)
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Màu sắc
          </label>
          <ColorPicker
            selectedColor={formData.color}
            onSelect={(color) => setFormData({ ...formData, color })}
          />
        </div>

        {/* Reminder Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Loại nhắc nhở
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'interval' })}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                formData.type === 'interval'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-hover'
              }`}
            >
              ⏱️ Lặp lại theo phút
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'scheduled' })}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                formData.type === 'scheduled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-hover'
              }`}
            >
              🕐 Giờ cố định
            </button>
          </div>
        </div>

        {/* Interval or Scheduled Times */}
        {formData.type === 'interval' ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
              Lặp lại mỗi (phút)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 1 })}
                className="w-24"
              />
              <div className="flex gap-2">
                {[15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, interval: mins })}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.interval === mins
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-hover'
                    }`}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
              Thời gian nhắc nhở
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-32"
              />
              <button
                type="button"
                onClick={addTime}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Thêm
              </button>
            </div>
            {formData.times.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.times.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                  >
                    {time}
                    <button
                      type="button"
                      onClick={() => removeTime(time)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Thời gian hiển thị thông báo
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, displayMinutes: option.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.displayMinutes === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-hover'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Xem trước
          </label>
          <div className="card relative overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: formData.color }}
            />
            <div className="flex items-center gap-3 pl-3">
              <span className="text-3xl">{formData.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-dark-text">
                  {formData.message || 'Nội dung nhắc nhở'}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                  {formData.type === 'interval'
                    ? `Lặp lại mỗi ${formData.interval} phút`
                    : `${formData.times.length} lần mỗi ngày: ${formData.times.join(', ')}`
                  } • {formData.displayMinutes}p
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary flex-1"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={!formData.message.trim()}
          >
            Lưu nhắc nhở
          </button>
        </div>
      </form>
    </div>
  )
}
