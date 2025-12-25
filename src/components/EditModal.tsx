import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useReminderStore } from "@/store/reminderStore";
import { ReminderFormData } from "@/types/reminder";
import { DEFAULTS } from "@/constants";
import { validateReminderForm } from "@/utils/reminder";
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
    useReminderStore();
  const [formData, setFormData] = useState<ReminderFormData | null>(null);

  useEffect(() => {
    if (editingReminder) {
      const { id, ...formDataWithoutId } = editingReminder;
      setFormData(formDataWithoutId);
    }
  }, [editingReminder]);

  const handleFormDataChange = useCallback(
    (data: Partial<ReminderFormData>) => {
      setFormData((prev) => (prev ? { ...prev, ...data } : null));
    },
    []
  );

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

  const addTime = useCallback(() => {
    if (!formData) return;
    setFormData({
      ...formData,
      times: [...(formData.times || []), DEFAULTS.TIME],
    });
  }, [formData]);

  const removeTime = useCallback(
    (index: number) => {
      if (formData?.times) {
        const newTimes = [...formData.times];
        newTimes.splice(index, 1);
        setFormData({
          ...formData,
          times: newTimes,
        });
      }
    },
    [formData]
  );

  const handleTimeChange = useCallback(
    (index: number, time: string) => {
      if (formData?.times) {
        const newTimes = [...formData.times];
        newTimes[index] = time;
        setFormData({
          ...formData,
          times: newTimes,
        });
      }
    },
    [formData]
  );

  const isFormValid = useMemo(
    () => (formData?.message.trim().length ?? 0) > 0,
    [formData?.message]
  );

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
          className="space-y-4 overflow-y-auto max-h-[calc(90vh-180px)] pr-2"
        >
          <ReminderFormFields
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onAddTime={addTime}
            onRemoveTime={removeTime}
            onTimeChange={handleTimeChange}
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
