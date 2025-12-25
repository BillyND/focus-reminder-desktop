import { memo, useCallback } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { ReminderCard } from "./ReminderCard";
import { Button } from "@/components/ui/button";
import { TAB, MESSAGES } from "@/constants";
import { Plus, Inbox } from "lucide-react";

export default memo(function ReminderList() {
  const { reminders, setActiveTab } = useReminderStore();

  const handleAddClick = useCallback(() => {
    setActiveTab(TAB.ADD);
  }, [setActiveTab]);

  if (reminders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Inbox className="h-16 w-16 mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">
          {MESSAGES.NO_REMINDERS_TITLE}
        </h2>
        <p className="text-muted-foreground mb-6">
          {MESSAGES.NO_REMINDERS_DESCRIPTION}
        </p>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          {MESSAGES.ADD_REMINDER}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {reminders.map((reminder, index) => (
        <div
          key={reminder.id}
          className="animate-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ReminderCard reminder={reminder} />
        </div>
      ))}
    </div>
  );
});
