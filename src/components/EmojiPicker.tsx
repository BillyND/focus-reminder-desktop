import { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { PRESET_EMOJIS } from "@/types/reminder";
import { LIMITS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default memo(function EmojiPicker({
  selectedEmoji,
  onSelect,
  onClose,
}: EmojiPickerProps) {
  const { t } = useTranslation();
  const [customEmoji, setCustomEmoji] = useState("");

  const handleCustomEmojiSubmit = useCallback(() => {
    if (customEmoji.trim()) {
      onSelect(customEmoji.trim());
      setCustomEmoji("");
    }
  }, [customEmoji, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCustomEmojiSubmit();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [handleCustomEmojiSubmit, onClose]
  );

  return (
    <Card className="p-4">
      {/* Preset Emojis */}
      <div className="grid grid-cols-6 gap-2 mb-4">
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

      {/* Custom Emoji Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("paste-custom-emoji")}
          maxLength={LIMITS.MAX_EMOJI_LENGTH}
        />
        <Button
          type="button"
          onClick={handleCustomEmojiSubmit}
          disabled={!customEmoji.trim()}
        >
          {t("ok")}
        </Button>
      </div>

      {/* Close button */}
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
        className="w-full mt-4"
      >
        {t("close")}
      </Button>
    </Card>
  );
});
