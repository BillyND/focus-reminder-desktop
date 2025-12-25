import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { Reminder } from "@/types/reminder";
import { useReminderStore } from "@/store/reminderStore";
import { Button } from "@/components/ui/button";
import { getRepeatText } from "@/utils/reminder";
import { Play, Pause, Edit2, Trash2, MoreVertical } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReminderCardBase } from "./ReminderCardBase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleTest = useCallback(() => {
    window.electronAPI?.testReminder({
      icon: reminder.icon,
      message: reminder.message,
      color: reminder.color,
      displayMinutes: reminder.displayMinutes,
    });
    setIsPopoverOpen(false);
  }, [
    reminder.icon,
    reminder.message,
    reminder.color,
    reminder.displayMinutes,
  ]);

  const handleToggle = useCallback(() => {
    toggleReminder(reminder.id);
    setIsPopoverOpen(false);
  }, [reminder.id, toggleReminder]);

  const handleEdit = useCallback(() => {
    setEditingReminder(reminder);
    setIsPopoverOpen(false);
  }, [reminder, setEditingReminder]);

  const handleDelete = useCallback(() => {
    setIsDeleteDialogOpen(true);
    setIsPopoverOpen(false);
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
        •{" "}
        {reminder.displayMinutes > 1
          ? t("duration-minutes", { duration: reminder.displayMinutes })
          : t("duration-minute", { duration: reminder.displayMinutes })}
      </span>
    </>
  );

  const actions = (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-3"
            onClick={(e) => {
              e.stopPropagation();
              handleTest();
            }}
          >
            <Play className="h-4 w-4" />
            <span>{t("test-reminder")}</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-3"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isActive ? t("disable") : t("enable")}</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-3"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          >
            <Edit2 className="h-4 w-4" />
            <span>{t("edit")}</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span>{t("delete")}</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
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
