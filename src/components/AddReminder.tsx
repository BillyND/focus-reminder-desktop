import { useState } from 'react'
import { useReminderStore } from '../store/reminderStore'
import { PRESET_EMOJIS, PRESET_COLORS, DURATION_OPTIONS, ReminderFormData } from '../types/reminder'
import EmojiPicker from './EmojiPicker'
import ColorPicker from './ColorPicker'

const defaultFormData: ReminderFormData = {
  message: '',
  emoji: '💧',
  color: PRESET_COLORS[0],
  type: 'interval',
  intervalMinutes: 30,
  fixedTime: '09:00',
  durationMinutes: 1,
  enabled: true,
}

export default function AddReminder() {
  const { addReminder, setActiveTab } = useReminderStore()
  const [formData, setFormData] = useState<ReminderFormData>(defaultFormData)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) return

    addReminder(formData)
    setFormData(defaultFormData)
    setActiveTab('reminders')
  }

  const handleReset = () => {
    setFormData(defaultFormData)
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Message */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-text">
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

        {/* Emoji Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-text">
            Biểu tượng
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-14 h-14 text-3xl bg-dark-card border border-dark-border rounded-xl hover:bg-dark-hover transition-colors flex items-center justify-center"
            >
              {formData.emoji}
            </button>
            <span className="text-sm text-dark-muted">
              Nhấn để chọn biểu tượng
            </span>
          </div>
          {showEmojiPicker && (
            <EmojiPicker
              selectedEmoji={formData.emoji}
              onSelect={(emoji) => {
                setFormData({ ...formData, emoji })
                setShowEmojiPicker(false)
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-text">
            Màu sắc
          </label>
          <ColorPicker
            selectedColor={formData.color}
            onSelect={(color) => setFormData({ ...formData, color })}
          />
        </div>

        {/* Reminder Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-text">
            Loại nhắc nhở
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'interval' })}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                formData.type === 'interval'
                  ? 'bg-accent-purple text-white'
                  : 'bg-dark-card border border-dark-border text-dark-muted hover:bg-dark-hover'
              }`}
            >
              ⏱️ Lặp lại theo phút
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'fixed' })}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                formData.type === 'fixed'
                  ? 'bg-accent-purple text-white'
                  : 'bg-dark-card border border-dark-border text-dark-muted hover:bg-dark-hover'
              }`}
            >
              🕐 Giờ cố định
            </button>
          </div>
        </div>

        {/* Interval Minutes or Fixed Time */}
        {formData.type === 'interval' ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-text">
              Lặp lại mỗi (phút)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.intervalMinutes}
                onChange={(e) => setFormData({ ...formData, intervalMinutes: parseInt(e.target.value) || 1 })}
                className="w-24"
              />
              <div className="flex gap-2">
                {[15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, intervalMinutes: mins })}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.intervalMinutes === mins
                        ? 'bg-accent-purple text-white'
                        : 'bg-dark-card border border-dark-border text-dark-muted hover:bg-dark-hover'
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
            <label className="block text-sm font-medium text-dark-text">
              Thời gian nhắc nhở
            </label>
            <input
              type="time"
              value={formData.fixedTime}
              onChange={(e) => setFormData({ ...formData, fixedTime: e.target.value })}
              className="w-32"
            />
          </div>
        )}

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-text">
            Thời gian hiển thị thông báo
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, durationMinutes: option.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.durationMinutes === option.value
                    ? 'bg-accent-purple text-white'
                    : 'bg-dark-card border border-dark-border text-dark-muted hover:bg-dark-hover'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-text">
            Xem trước
          </label>
          <div className="card relative overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: formData.color }}
            />
            <div className="flex items-center gap-3 pl-3">
              <span className="text-3xl">{formData.emoji}</span>
              <div>
                <p className="font-semibold text-dark-text">
                  {formData.message || 'Nội dung nhắc nhở'}
                </p>
                <p className="text-xs text-dark-muted mt-0.5">
                  {formData.type === 'interval'
                    ? `Lặp lại mỗi ${formData.intervalMinutes} phút`
                    : `Hàng ngày lúc ${formData.fixedTime}`
                  } • {formData.durationMinutes}p
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
