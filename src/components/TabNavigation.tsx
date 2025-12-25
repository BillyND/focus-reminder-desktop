import { memo, useCallback } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabType } from "@/types/common";
import { TAB } from "@/constants";
import { Bell, Plus, Settings } from "lucide-react";

interface Tab {
  id: TabType;
  label: string;
  icon: typeof Bell;
}

const tabs: Tab[] = [
  { id: TAB.REMINDERS, label: "Reminders", icon: Bell },
  { id: TAB.ADD, label: "Add New", icon: Plus },
  { id: TAB.SETTINGS, label: "Settings", icon: Settings },
];

export default memo(function TabNavigation() {
  const { activeTab, setActiveTab } = useReminderStore();

  const handleValueChange = useCallback(
    (value: string) => {
      setActiveTab(value as TabType);
    },
    [setActiveTab]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleValueChange}
      className="w-full"
    >
      <TabsList className="w-full grid grid-cols-3 rounded-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
});
