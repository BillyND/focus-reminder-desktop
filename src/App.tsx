import { useEffect, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { useReminderStore } from "@/store/reminderStore";
import { TAB } from "@/constants";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import ReminderList from "@/components/ReminderList";
import AddReminder from "@/components/AddReminder";
import EditModal from "@/components/EditModal";
import Settings from "@/components/Settings";

function App() {
  const { activeTab, syncAllReminders, editingReminder } = useReminderStore();

  useEffect(() => {
    // Sync all reminders when app starts - run async to not block render
    const syncReminders = async () => {
      // Small delay to ensure window is ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      syncAllReminders();
    };
    syncReminders();
  }, [syncAllReminders]);

  const content = useMemo(() => {
    switch (activeTab) {
      case TAB.REMINDERS:
        return <ReminderList />;
      case TAB.ADD:
        return <AddReminder />;
      case TAB.SETTINGS:
        return <Settings />;
      default:
        return <ReminderList />;
    }
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col transition-colors">
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-hidden">{content}</main>
      {editingReminder && <EditModal />}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
