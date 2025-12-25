import { useReminderStore } from "@/store/reminderStore";
import ReminderCard from "./ReminderCard";
import { Button } from "@/components/ui/button";
import { Plus, Inbox } from "lucide-react";

export default function ReminderList() {
  const { reminders, setActiveTab } = useReminderStore();

  if (reminders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Inbox className="h-16 w-16 mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No reminders yet</h2>
        <p className="text-muted-foreground mb-6">
          Create your first reminder to get started
        </p>
        <Button onClick={() => setActiveTab("add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add reminder
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
}
