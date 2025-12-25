import { memo } from "react";
import { ReminderFormData } from "@/types/reminder";
import { REMINDER_TYPE, DEFAULTS, MESSAGES } from "@/constants";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import EmojiPicker from "./EmojiPicker";
import ColorPicker from "./ColorPicker";
import { ReminderTypeSelector } from "./ReminderTypeSelector";
import { IntervalInput } from "./IntervalInput";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
import { DurationSelector } from "./DurationSelector";

interface ReminderFormFieldsProps {
  formData: ReminderFormData;
  onFormDataChange: (data: Partial<ReminderFormData>) => void;
  showEmojiPicker: boolean;
  onToggleEmojiPicker: () => void;
  onEmojiSelect: (icon: string) => void;
  onEmojiPickerClose: () => void;
  newTime: string;
  onNewTimeChange: (time: string) => void;
  onAddTime: () => void;
  onRemoveTime: (time: string) => void;
}

export const ReminderFormFields = memo(function ReminderFormFields({
  formData,
  onFormDataChange,
  showEmojiPicker,
  onToggleEmojiPicker,
  onEmojiSelect,
  onEmojiPickerClose,
  newTime,
  onNewTimeChange,
  onAddTime,
  onRemoveTime,
}: ReminderFormFieldsProps) {
  return (
    <>
      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">{MESSAGES.REMINDER_CONTENT}</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => onFormDataChange({ message: e.target.value })}
          placeholder={MESSAGES.ENTER_REMINDER_CONTENT}
          required
        />
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <Label>{MESSAGES.ICON}</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onToggleEmojiPicker}
            variant="outline"
            size="lg"
          >
            <span className="text-3xl">{formData.icon}</span>
          </Button>
          <span className="text-sm text-muted-foreground">
            {MESSAGES.CLICK_TO_CHOOSE_ICON}
          </span>
        </div>
        {showEmojiPicker && (
          <EmojiPicker
            selectedEmoji={formData.icon}
            onSelect={onEmojiSelect}
            onClose={onEmojiPickerClose}
          />
        )}
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>{MESSAGES.COLOR}</Label>
        <ColorPicker
          selectedColor={formData.color}
          onSelect={(color) => onFormDataChange({ color })}
        />
      </div>

      {/* Reminder Type */}
      <ReminderTypeSelector
        type={formData.type}
        onTypeChange={(type) => onFormDataChange({ type })}
      />

      {/* Interval or Scheduled Times */}
      {formData.type === REMINDER_TYPE.INTERVAL ? (
        <IntervalInput
          interval={formData.interval || DEFAULTS.INTERVAL}
          onIntervalChange={(interval) => onFormDataChange({ interval })}
        />
      ) : (
        <ScheduledTimeInput
          times={formData.times || []}
          newTime={newTime}
          onNewTimeChange={onNewTimeChange}
          onAddTime={onAddTime}
          onRemoveTime={onRemoveTime}
        />
      )}

      {/* Duration */}
      <DurationSelector
        displayMinutes={formData.displayMinutes}
        onDisplayMinutesChange={(displayMinutes) =>
          onFormDataChange({ displayMinutes })
        }
      />
    </>
  );
});
