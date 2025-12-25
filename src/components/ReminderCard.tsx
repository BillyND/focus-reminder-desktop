import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { Reminder } from "@/types/reminder";
import { useReminderStore } from "@/store/reminderStore";
import { Button } from "@/components/ui/button";
import { getRepeatText } from "@/utils/reminder";
import { Play, Pause, Edit2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReminderCardBase } from "./ReminderCardBase";

interface ReminderCardProps {
  reminder: Reminder;
}

export const ReminderCard = memo(function ReminderCard({
  reminder,
}: ReminderCardProps) {
  const { t } = useTranslation();
  const { deleteReminder, toggleReminder, setEditingReminder, globalEnabled } =
    useReminderStore(
      useShallow((state) => ({
        deleteReminder: state.deleteReminder,
        toggleReminder: state.toggleReminder,
        setEditingReminder: state.setEditingReminder,
        globalEnabled: state.globalEnabled,
      }))
    );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleTest = useCallback(() => {
    window.electronAPI?.testReminder({
      icon: reminder.icon,
      message: reminder.message,
      color: reminder.color,
      displayMinutes: reminder.displayMinutes,
    });
  }, [
    reminder.icon,
    reminder.message,
    reminder.color,
    reminder.displayMinutes,
  ]);

  const handleToggle = useCallback(() => {
    toggleReminder(reminder.id);
  }, [reminder.id, toggleReminder]);

  const handleEdit = useCallback(() => {
    setEditingReminder(reminder);
  }, [reminder, setEditingReminder]);

  const handleDelete = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteReminder(reminder.id);
  }, [reminder.id, deleteReminder]);

  const isActive = reminder.enabled && globalEnabled;
  const repeatText = getRepeatText(reminder);

  const metadata = (
    <>
      <span className="text-xs text-muted-foreground truncate">
        {repeatText}
      </span>
      <span className="text-xs text-muted-foreground">
        • {reminder.displayMinutes}m
      </span>
    </>
  );

  const actions = (
    <>
      <Button
        onClick={handleTest}
        variant="ghost"
        size="icon"
        title={t("test-reminder")}
      >
        <Play className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleToggle}
        variant={isActive ? "default" : "ghost"}
        size="icon"
        title={isActive ? t("disable") : t("enable")}
      >
        {isActive ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <Button
        onClick={handleEdit}
        variant="ghost"
        size="icon"
        title={t("edit")}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleDelete}
        variant="ghost"
        size="icon"
        title={t("delete")}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <>
      <ReminderCardBase
        icon={reminder.icon}
        message={reminder.message}
        color={reminder.color}
        metadata={metadata}
        actions={actions}
        isActive={isActive}
      />
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t("confirm-delete")}
        description={t("delete-confirm-description")}
        confirmText={t("delete")}
        variant="destructive"
      />
    </>
  );
});
