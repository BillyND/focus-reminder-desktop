import { useState, useEffect, useCallback, useMemo } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { ReminderFormData } from "@/types/reminder";
import { DEFAULTS, MESSAGES } from "@/constants";
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
  const { editingReminder, setEditingReminder, updateReminder } =
    useReminderStore();
  const [formData, setFormData] = useState<ReminderFormData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newTime, setNewTime] = useState<string>(DEFAULTS.TIME);

  useEffect(() => {
    if (editingReminder) {
      const { id, ...formDataWithoutId } = editingReminder;
      setFormData(formDataWithoutId);
      if (editingReminder.times && editingReminder.times.length > 0) {
        setNewTime(editingReminder.times[editingReminder.times.length - 1]);
      } else {
        setNewTime(DEFAULTS.TIME);
      }
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
        alert(validation.error);
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
    if (newTime && formData.times && !formData.times.includes(newTime)) {
      setFormData({
        ...formData,
        times: [...formData.times, newTime].sort(),
      });
      setNewTime(DEFAULTS.TIME);
    } else if (newTime && !formData.times) {
      setFormData({
        ...formData,
        times: [newTime],
      });
      setNewTime(DEFAULTS.TIME);
    }
  }, [newTime, formData]);

  const removeTime = useCallback(
    (time: string) => {
      if (formData?.times) {
        setFormData({
          ...formData,
          times: formData.times.filter((t) => t !== time),
        });
      }
    },
    [formData]
  );

  const handleEmojiSelect = useCallback(
    (icon: string) => {
      handleFormDataChange({ icon });
      setShowEmojiPicker(false);
    },
    [handleFormDataChange]
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
          <DialogTitle>{MESSAGES.EDIT_REMINDER}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[calc(90vh-180px)] pr-2"
        >
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
        </form>

        <DialogFooter>
          <Button type="button" onClick={handleClose} variant="secondary">
            {MESSAGES.CANCEL}
          </Button>
          <Button onClick={() => handleSubmit()} disabled={!isFormValid}>
            {MESSAGES.SAVE_CHANGES}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
