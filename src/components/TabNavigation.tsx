import { useReminderStore } from "../store/reminderStore";

type TabType = "reminders" | "add";

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "reminders", label: "Nhắc nhở", icon: "🔔" },
  { id: "add", label: "Thêm mới", icon: "➕" },
];

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useReminderStore();

  return (
    <nav className="flex border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-2
            text-sm font-medium transition-all duration-200
            ${
              activeTab === tab.id
                ? "text-blue-500 dark:text-accent-purple border-b-2 border-blue-500 dark:border-accent-purple bg-blue-50/30 dark:bg-dark-hover/30"
                : "text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover/20"
            }
          `}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
