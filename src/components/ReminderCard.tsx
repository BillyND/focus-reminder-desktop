import { Reminder } from "@/types/reminder";
import { useReminderStore } from "@/store/reminderStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Play, Pause, Edit2, Trash2 } from "lucide-react";

interface ReminderCardProps {
  reminder: Reminder;
}

export default function ReminderCard({ reminder }: ReminderCardProps) {
  const { deleteReminder, toggleReminder, setEditingReminder, globalEnabled } =
    useReminderStore();

  const getRepeatText = () => {
    if (reminder.type === "interval" && reminder.interval) {
      return `Repeat every ${reminder.interval} minutes`;
    }
    if (
      reminder.type === "scheduled" &&
      reminder.times &&
      reminder.times.length > 0
    ) {
      if (reminder.times.length === 1) {
        return `Daily at ${reminder.times[0]}`;
      }
      return `${reminder.times.length} times a day`;
    }
    return "";
  };

  const handleTest = () => {
    window.electronAPI?.testReminder({
      emoji: reminder.icon,
      message: reminder.message,
      color: reminder.color,
      durationMinutes: reminder.displayMinutes,
    } as any);
  };

  const isActive = reminder.enabled && globalEnabled;

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
        <div className="text-3xl flex-shrink-0 mt-0.5">{reminder.icon}</div>

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
              {getRepeatText()}
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
            title="Test reminder"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => toggleReminder(reminder.id)}
            variant={isActive ? "default" : "ghost"}
            size="icon"
            title={isActive ? "Disable" : "Enable"}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={() => setEditingReminder(reminder)}
            variant="ghost"
            size="icon"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => deleteReminder(reminder.id)}
            variant="ghost"
            size="icon"
            title="Delete"
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
}
