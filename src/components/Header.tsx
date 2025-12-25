import { memo, useCallback } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useReminderStore } from "@/store/reminderStore";
import { Button } from "@/components/ui/button";
import { TAB } from "@/constants";
import { Settings, Sun, Moon, Minus, Maximize2, X } from "lucide-react";

export default memo(function Header() {
  const { settings, toggleDarkMode } = useSettingsStore();
  const { setActiveTab } = useReminderStore();

  const handleMinimize = useCallback(() => {
    window.electronAPI?.minimizeWindow();
  }, []);

  const handleMaximize = useCallback(() => {
    window.electronAPI?.maximizeWindow();
  }, []);

  const handleClose = useCallback(() => {
    window.electronAPI?.closeWindow();
  }, []);

  const handleSettingsClick = useCallback(() => {
    setActiveTab(TAB.SETTINGS);
  }, [setActiveTab]);

  return (
    <header className="draggable flex items-center justify-between px-4 py-3 border-b transition-colors">
      <div className="flex items-center gap-3">
        {/* <span className="text-2xl">💧</span>
        <div>
          <h1 className="text-lg font-semibold">Health Reminder</h1>
        </div> */}
      </div>

      <div className="non-draggable flex items-center gap-2">
        {/* Settings Button */}
        <Button
          onClick={handleSettingsClick}
          variant="ghost"
          size="icon"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          onClick={toggleDarkMode}
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
        >
          {settings.darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Window Controls */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            onClick={handleMinimize}
            variant="ghost"
            size="icon"
            aria-label="Minimize"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleMaximize}
            variant="ghost"
            size="icon"
            aria-label="Maximize"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
});
