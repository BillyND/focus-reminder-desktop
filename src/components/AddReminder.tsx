import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useReminderStore } from "@/store/reminderStore";
import { ReminderFormData } from "@/types/reminder";
import { REMINDER_TYPE, DEFAULTS, TAB } from "@/constants";
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
  const { t } = useTranslation();
  const { addReminder, setActiveTab } = useReminderStore();
  const [formData, setFormData] = useState<ReminderFormData>(defaultFormData);

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
        toast.error(validation.error || "Validation error");
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
    setFormData((prev) => ({
      ...prev,
      times: [...(prev.times || []), DEFAULTS.TIME],
    }));
  }, []);

  const removeTime = useCallback((index: number) => {
    setFormData((prev) => {
      const newTimes = [...(prev.times || [])];
      newTimes.splice(index, 1);
      return {
        ...prev,
        times: newTimes,
      };
    });
  }, []);

  const handleTimeChange = useCallback((index: number, time: string) => {
    setFormData((prev) => {
      const newTimes = [...(prev.times || [])];
      newTimes[index] = time;
      return {
        ...prev,
        times: newTimes,
      };
    });
  }, []);

  const isFormValid = useMemo(
    () => formData.message.trim().length > 0,
    [formData.message]
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ReminderFormFields
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onAddTime={addTime}
          onRemoveTime={removeTime}
          onTimeChange={handleTimeChange}
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
            {t("cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={!isFormValid}>
            {t("save-reminder")}
          </Button>
        </div>
      </form>
    </div>
  );
}
