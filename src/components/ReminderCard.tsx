import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Reminder } from "@/types/reminder";
import { useReminderStore } from "@/store/reminderStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRepeatText } from "@/utils/reminder";
import { Play, Pause, Edit2, Trash2 } from "lucide-react";

interface ReminderCardProps {
  reminder: Reminder;
}

export const ReminderCard = memo(function ReminderCard({
  reminder,
}: ReminderCardProps) {
  const { t } = useTranslation();
  const { deleteReminder, toggleReminder, setEditingReminder, globalEnabled } =
    useReminderStore();

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
    deleteReminder(reminder.id);
  }, [reminder.id, deleteReminder]);

  const isActive = reminder.enabled && globalEnabled;
  const repeatText = getRepeatText(reminder);

  return (
    <Card
      className={`
        group relative overflow-hidden transition-opacity
        ${!isActive ? "opacity-60" : ""}
      `}
    >
      {/* Color indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: reminder.color }}
      />

      <div className="flex items-start gap-3 pl-3 p-4">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0 mt-1">{reminder.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base leading-snug mb-1">
            {reminder.message}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: reminder.color }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {repeatText}
            </span>
            <span className="text-xs text-muted-foreground">
              • {reminder.displayMinutes}m
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
      </div>

      {/* Status indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
      )}
    </Card>
  );
});
