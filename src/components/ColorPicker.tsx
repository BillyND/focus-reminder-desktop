import { PRESET_COLORS } from '../types/reminder'

interface ColorPickerProps {
  selectedColor: string
  onSelect: (color: string) => void
}

export default function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <div className="flex gap-3">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
            selectedColor === color
              ? 'ring-2 ring-white dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-dark-bg scale-110'
              : 'hover:scale-105'
          }`}
          style={{ backgroundColor: color }}
        >
          {selectedColor === color && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M3 8L6.5 11.5L13 5" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
