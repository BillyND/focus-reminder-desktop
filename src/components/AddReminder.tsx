import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { useReminderStore } from "@/store/reminderStore";
import { TAB } from "@/constants";
import { validateReminderForm } from "@/utils/reminder";
import { useReminderForm } from "@/hooks/useReminderForm";
import { useTimeManagement } from "@/hooks/useTimeManagement";
import { ReminderFormFields } from "./ReminderFormFields";
import { ReminderPreview } from "./ReminderPreview";
import { Button } from "@/components/ui/button";

export default function AddReminder() {
  const { t } = useTranslation();
  const { addReminder, setActiveTab } = useReminderStore(
    useShallow((state) => ({
      addReminder: state.addReminder,
      setActiveTab: state.setActiveTab,
    }))
  );
  const { formData, updateFormData, resetForm, isFormValid } =
    useReminderForm();
  const { addTime, removeTime, updateTime } = useTimeManagement(
    formData,
    updateFormData
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
      resetForm();
      setActiveTab(TAB.REMINDERS);
    },
    [formData, addReminder, resetForm, setActiveTab]
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ReminderFormFields
          formData={formData}
          onFormDataChange={updateFormData}
          onAddTime={addTime}
          onRemoveTime={removeTime}
          onTimeChange={updateTime}
        />

        <ReminderPreview formData={formData} />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={resetForm}
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
