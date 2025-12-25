import { memo } from "react";
import { PRESET_EMOJIS } from "@/types/reminder";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

export default memo(function EmojiPicker({
  selectedEmoji,
  onSelect,
}: EmojiPickerProps) {
  return (
    <div className="p-4">
      {/* Preset Emojis */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            variant={selectedEmoji === emoji ? "default" : "ghost"}
            size="icon"
          >
            <span className="text-xl">{emoji}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});
