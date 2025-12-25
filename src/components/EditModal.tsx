import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { useReminderStore } from "@/store/reminderStore";
import { validateReminderForm } from "@/utils/reminder";
import { useReminderForm } from "@/hooks/useReminderForm";
import { useTimeManagement } from "@/hooks/useTimeManagement";
import { ReminderFormFields } from "./ReminderFormFields";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditModal() {
  const { t } = useTranslation();
  const { editingReminder, setEditingReminder, updateReminder } =
    useReminderStore(
      useShallow((state) => ({
        editingReminder: state.editingReminder,
        setEditingReminder: state.setEditingReminder,
        updateReminder: state.updateReminder,
      }))
    );
  const { formData, updateFormData, isFormValid, setFormData } =
    useReminderForm();
  const { addTime, removeTime, updateTime } = useTimeManagement(
    formData,
    updateFormData
  );

  useEffect(() => {
    if (editingReminder) {
      const { id, ...formDataWithoutId } = editingReminder;
      setFormData(formDataWithoutId);
    }
  }, [editingReminder, setFormData]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!formData || !editingReminder) return;

      const validation = validateReminderForm(formData);
      if (!validation.valid) {
        toast.error(validation.error || "Validation error");
        return;
      }

      updateReminder(editingReminder.id, formData);
      setEditingReminder(null);
    },
    [formData, editingReminder, updateReminder, setEditingReminder]
  );

  const handleClose = useCallback(() => {
    setEditingReminder(null);
  }, [setEditingReminder]);

  if (!formData || !editingReminder) return null;

  return (
    <Dialog
      open={!!editingReminder}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("edit-reminder")}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[calc(90vh-180px)] px-4 pb-4"
        >
          <ReminderFormFields
            formData={formData}
            onFormDataChange={updateFormData}
            onAddTime={addTime}
            onRemoveTime={removeTime}
            onTimeChange={updateTime}
          />
        </form>

        <DialogFooter>
          <Button type="button" onClick={handleClose} variant="secondary">
            {t("cancel")}
          </Button>
          <Button onClick={() => handleSubmit()} disabled={!isFormValid}>
            {t("save-changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
