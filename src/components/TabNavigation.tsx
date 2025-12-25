import { useReminderStore } from "@/store/reminderStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Plus } from "lucide-react";

type TabType = "reminders" | "add";

interface Tab {
  id: TabType;
  label: string;
  icon: typeof Bell;
}

const tabs: Tab[] = [
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "add", label: "Add New", icon: Plus },
];

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useReminderStore();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabType)}
      className="w-full"
    >
      <TabsList className="w-full h-12 grid grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
