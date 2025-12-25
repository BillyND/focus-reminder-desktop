import { useCallback } from "react";
import { ReminderFormData } from "@/types/reminder";
import { DEFAULTS } from "@/constants";

export function useTimeManagement(
  formData: ReminderFormData,
  updateFormData: (data: Partial<ReminderFormData>) => void
) {
  const addTime = useCallback(() => {
    updateFormData({
      times: [...(formData.times || []), DEFAULTS.TIME],
    });
  }, [formData.times, updateFormData]);

  const removeTime = useCallback(
    (index: number) => {
      const newTimes = [...(formData.times || [])];
      newTimes.splice(index, 1);
      updateFormData({ times: newTimes });
    },
    [formData.times, updateFormData]
  );

  const updateTime = useCallback(
    (index: number, time: string) => {
      const newTimes = [...(formData.times || [])];
      newTimes[index] = time;
      updateFormData({ times: newTimes });
    },
    [formData.times, updateFormData]
  );

  return {
    addTime,
    removeTime,
    updateTime,
  };
}

