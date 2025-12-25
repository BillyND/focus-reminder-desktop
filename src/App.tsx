import { useEffect } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { useSettingsStore } from "@/store/settingsStore";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import ReminderList from "@/components/ReminderList";
import AddReminder from "@/components/AddReminder";
import EditModal from "@/components/EditModal";
import Settings from "@/components/Settings";

function App() {
  const { activeTab, syncAllReminders, editingReminder } = useReminderStore();
  const { showSettings } = useSettingsStore();

  useEffect(() => {
    // Sync all reminders when app starts
    syncAllReminders();
  }, [syncAllReminders]);

  const renderContent = () => {
    if (showSettings) {
      return <Settings />;
    }

    switch (activeTab) {
      case "reminders":
        return <ReminderList />;
      case "add":
        return <AddReminder />;
      default:
        return <ReminderList />;
    }
  };

  return (
    <div className="h-full flex flex-col transition-colors">
      <Header />
      {!showSettings && <TabNavigation />}
      <main className="flex-1 overflow-hidden">{renderContent()}</main>
      {editingReminder && <EditModal />}
    </div>
  );
}

export default App;
