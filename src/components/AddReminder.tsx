import { useState, useCallback, useMemo } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { ReminderFormData } from "@/types/reminder";
import { REMINDER_TYPE, DEFAULTS, TAB, MESSAGES } from "@/constants";
import { PRESET_COLORS } from "@/types/reminder";
import { validateReminderForm } from "@/utils/reminder";
import { ReminderFormFields } from "./ReminderFormFields";
import { ReminderPreview } from "./ReminderPreview";
import { Button } from "@/components/ui/button";

const defaultFormData: ReminderFormData = {
  message: "",
  icon: DEFAULTS.ICON,
  color: PRESET_COLORS[DEFAULTS.COLOR_INDEX],
  type: REMINDER_TYPE.INTERVAL,
  interval: DEFAULTS.INTERVAL,
  times: [DEFAULTS.TIME],
  displayMinutes: DEFAULTS.DISPLAY_MINUTES,
  enabled: true,
};

export default function AddReminder() {
  const { addReminder, setActiveTab } = useReminderStore();
  const [formData, setFormData] = useState<ReminderFormData>(defaultFormData);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newTime, setNewTime] = useState<string>(DEFAULTS.TIME);

  const handleFormDataChange = useCallback(
    (data: Partial<ReminderFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validation = validateReminderForm(formData);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      addReminder(formData);
      setFormData(defaultFormData);
      setActiveTab(TAB.REMINDERS);
    },
    [formData, addReminder, setActiveTab]
  );

  const handleReset = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  const addTime = useCallback(() => {
    if (newTime && formData.times && !formData.times.includes(newTime)) {
      setFormData((prev) => ({
        ...prev,
        times: [...(prev.times || []), newTime].sort(),
      }));
      setNewTime(DEFAULTS.TIME);
    }
  }, [newTime, formData.times]);

  const removeTime = useCallback((time: string) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times?.filter((t) => t !== time) || [],
    }));
  }, []);

  const handleEmojiSelect = useCallback(
    (icon: string) => {
      handleFormDataChange({ icon });
      setShowEmojiPicker(false);
    },
    [handleFormDataChange]
  );

  const isFormValid = useMemo(
    () => formData.message.trim().length > 0,
    [formData.message]
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        <ReminderFormFields
          formData={formData}
          onFormDataChange={handleFormDataChange}
          showEmojiPicker={showEmojiPicker}
          onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
          onEmojiSelect={handleEmojiSelect}
          onEmojiPickerClose={() => setShowEmojiPicker(false)}
          newTime={newTime}
          onNewTimeChange={setNewTime}
          onAddTime={addTime}
          onRemoveTime={removeTime}
        />

        <ReminderPreview formData={formData} />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={handleReset}
            variant="secondary"
            className="flex-1"
          >
            {MESSAGES.CANCEL}
          </Button>
          <Button type="submit" className="flex-1" disabled={!isFormValid}>
            {MESSAGES.SAVE_REMINDER}
          </Button>
        </div>
      </form>
    </div>
  );
}
