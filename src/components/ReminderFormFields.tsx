import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ReminderFormData } from "@/types/reminder";
import { REMINDER_TYPE, DEFAULTS } from "@/constants";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "./EmojiPicker";
import ColorPicker from "./ColorPicker";
import { ReminderTypeSelector } from "./ReminderTypeSelector";
import { IntervalInput } from "./IntervalInput";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
import { DurationSelector } from "./DurationSelector";

interface ReminderFormFieldsProps {
  formData: ReminderFormData;
  onFormDataChange: (data: Partial<ReminderFormData>) => void;
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  onTimeChange: (index: number, time: string) => void;
}

export const ReminderFormFields = memo(function ReminderFormFields({
  formData,
  onFormDataChange,
  onAddTime,
  onRemoveTime,
  onTimeChange,
}: ReminderFormFieldsProps) {
  const { t } = useTranslation();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleEmojiSelect = useCallback(
    (icon: string) => {
      onFormDataChange({ icon });
      setIsEmojiPickerOpen(false);
    },
    [onFormDataChange]
  );

  return (
    <>
      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">{t("reminder-content")}</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => onFormDataChange({ message: e.target.value })}
          placeholder={t("enter-reminder-content")}
          required
        />
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <Label>{t("icon")}</Label>
        <div className="flex items-center gap-3">
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="default">
                <span className="text-3xl">{formData.icon}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <EmojiPicker
                selectedEmoji={formData.icon}
                onSelect={handleEmojiSelect}
              />
            </PopoverContent>
          </Popover>
          <span className="text-sm text-muted-foreground">
            {t("click-to-choose-icon")}
          </span>
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>{t("color")}</Label>
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
          onAddTime={onAddTime}
          onRemoveTime={onRemoveTime}
          onTimeChange={onTimeChange}
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
