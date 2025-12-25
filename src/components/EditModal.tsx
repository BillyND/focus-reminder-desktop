import { useState, useEffect } from 'react'
import { useReminderStore } from '../store/reminderStore'
import { DURATION_OPTIONS, Reminder } from '../types/reminder'
import EmojiPicker from './EmojiPicker'
import ColorPicker from './ColorPicker'

export default function EditModal() {
  const { editingReminder, setEditingReminder, updateReminder } = useReminderStore()
  const [formData, setFormData] = useState<Reminder | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (editingReminder) {
      setFormData({ ...editingReminder })
    }
  }, [editingReminder])

  if (!formData) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) return

    updateReminder(formData.id, formData)
    setEditingReminder(null)
  }

  const handleClose = () => {
    setEditingReminder(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-dark-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-dark-text">
            Chỉnh sửa nhắc nhở
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-hover transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="text-dark-muted">
              <path d="M1 1L13 13M1 13L13 1" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-text">
              Nội dung nhắc nhở
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Nhập nội dung nhắc nhở..."
              className="w-full h-20"
              required
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-text">
              Biểu tượng
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-12 h-12 text-2xl bg-dark-bg border border-dark-border rounded-xl hover:bg-dark-hover transition-colors flex items-center justify-center"
              >
                {formData.emoji}
              </button>
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

          {/* Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-text">
              Màu sắc
            </label>
            <ColorPicker
              selectedColor={formData.color}
              onSelect={(color) => setFormData({ ...formData, color })}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-text">
              Loại nhắc nhở
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'interval' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  formData.type === 'interval'
                    ? 'bg-accent-purple text-white'
                    : 'bg-dark-bg border border-dark-border text-dark-muted hover:bg-dark-hover'
                }`}
              >
                ⏱️ Lặp lại
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'fixed' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  formData.type === 'fixed'
                    ? 'bg-accent-purple text-white'
                    : 'bg-dark-bg border border-dark-border text-dark-muted hover:bg-dark-hover'
                }`}
              >
                🕐 Giờ cố định
              </button>
            </div>
          </div>

          {/* Interval or Fixed Time */}
          {formData.type === 'interval' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-text">
                Lặp lại mỗi (phút)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.intervalMinutes || 30}
                onChange={(e) => setFormData({ ...formData, intervalMinutes: parseInt(e.target.value) || 1 })}
                className="w-24"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-text">
                Thời gian
              </label>
              <input
                type="time"
                value={formData.fixedTime || '09:00'}
                onChange={(e) => setFormData({ ...formData, fixedTime: e.target.value })}
                className="w-32"
              />
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-text">
              Thời gian hiển thị
            </label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, durationMinutes: option.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.durationMinutes === option.value
                      ? 'bg-accent-purple text-white'
                      : 'bg-dark-bg border border-dark-border text-dark-muted hover:bg-dark-hover'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-dark-border">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary flex-1"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
            disabled={!formData.message.trim()}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}
