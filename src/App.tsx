import { useEffect, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";
import { useReminderStore } from "@/store/reminderStore";
import { useSettingsStore } from "@/store/settingsStore";
import { TAB } from "@/constants";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import ReminderList from "@/components/ReminderList";
import AddReminder from "@/components/AddReminder";
import EditModal from "@/components/EditModal";
import Settings from "@/components/Settings";

function App() {
  const { activeTab, syncAllReminders, editingReminder } = useReminderStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      syncAllReminders: state.syncAllReminders,
      editingReminder: state.editingReminder,
    }))
  );
  const { autoLaunchEnabled, setAutoLaunchEnabled } = useSettingsStore(
    useShallow((state) => ({
      autoLaunchEnabled: state.settings.autoLaunchEnabled,
      setAutoLaunchEnabled: state.setAutoLaunchEnabled,
    }))
  );

  useEffect(() => {
    // Sync all reminders when app starts - run async to not block render
    const syncReminders = async () => {
      // Small delay to ensure window is ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      syncAllReminders();
    };
    syncReminders();
  }, [syncAllReminders]);

  useEffect(() => {
    const syncAutoLaunchSetting = async () => {
      if (!window.electronAPI?.setAutoLaunch) return;
      try {
        await window.electronAPI.setAutoLaunch(autoLaunchEnabled);
      } catch (error) {
        console.error("===> Failed to update auto-launch:", error);
      }
    };

    syncAutoLaunchSetting();
  }, [autoLaunchEnabled]);

  useEffect(() => {
    const fetchAutoLaunchStatus = async () => {
      if (!window.electronAPI?.getAutoLaunchStatus) return;
      try {
        const enabled = await window.electronAPI.getAutoLaunchStatus();
        setAutoLaunchEnabled(enabled);
      } catch (error) {
        console.error("===> Failed to fetch auto-launch status:", error);
      }
    };

    fetchAutoLaunchStatus();
  }, [setAutoLaunchEnabled]);

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
    <div className="h-full flex flex-col">
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-hidden">{content}</main>
      {editingReminder && <EditModal />}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
