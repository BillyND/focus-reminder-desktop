import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useReminderStore } from "@/store/reminderStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabType } from "@/types/common";
import { TAB } from "@/constants";
import { Bell, Plus, Settings } from "lucide-react";

interface Tab {
  id: TabType;
  labelKey: string;
  icon: typeof Bell;
}

export default memo(function TabNavigation() {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useReminderStore();

  const tabs: Tab[] = useMemo(
    () => [
      { id: TAB.REMINDERS, labelKey: "reminders", icon: Bell },
      { id: TAB.ADD, labelKey: "add-new", icon: Plus },
      { id: TAB.SETTINGS, labelKey: "settings", icon: Settings },
    ],
    []
  );

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
              <span>{t(tab.labelKey)}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
});
