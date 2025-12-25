import { useState, useCallback, useMemo } from "react";
import { ReminderFormData } from "@/types/reminder";
import { REMINDER_TYPE, DEFAULTS } from "@/constants";
import { PRESET_COLORS } from "@/types/reminder";

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

export function useReminderForm(initialData?: ReminderFormData) {
  const [formData, setFormData] = useState<ReminderFormData>(
    initialData || defaultFormData
  );

  const updateFormData = useCallback((data: Partial<ReminderFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  const isFormValid = useMemo(
    () => formData.message.trim().length > 0,
    [formData.message]
  );

  return {
    formData,
    updateFormData,
    resetForm,
    isFormValid,
    setFormData,
  };
}
