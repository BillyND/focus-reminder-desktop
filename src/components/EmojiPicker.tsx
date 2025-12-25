import { useState } from 'react'
import { PRESET_EMOJIS } from '../types/reminder'

interface EmojiPickerProps {
  selectedEmoji: string
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ selectedEmoji, onSelect, onClose }: EmojiPickerProps) {
  const [customEmoji, setCustomEmoji] = useState('')

  const handleCustomEmojiSubmit = () => {
    if (customEmoji.trim()) {
      onSelect(customEmoji.trim())
      setCustomEmoji('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomEmojiSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 animate-in">
      {/* Preset Emojis */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {PRESET_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-all ${
              selectedEmoji === emoji
                ? 'bg-blue-500 dark:bg-accent-purple scale-110'
                : 'hover:bg-gray-100 dark:hover:bg-dark-hover'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Custom Emoji Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dán emoji tùy chỉnh..."
          className="flex-1 text-center"
          maxLength={4}
        />
        <button
          type="button"
          onClick={handleCustomEmojiSubmit}
          className="btn btn-primary px-4"
          disabled={!customEmoji.trim()}
        >
          OK
        </button>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-3 text-sm text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text transition-colors"
      >
        Đóng
      </button>
    </div>
  )
}
