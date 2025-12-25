import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useReminderStore } from "@/store/reminderStore";
import { FILE_NAMES } from "@/constants";
import { SettingsSoundSection } from "./SettingsSoundSection";
import { SettingsDataSection } from "./SettingsDataSection";

export default memo(function Settings() {
  const { t } = useTranslation();
  const { settings, toggleSound, setSoundVolume } = useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      toggleSound: state.toggleSound,
      setSoundVolume: state.setSoundVolume,
    }))
  );
  const { exportData, importData, resetAll } = useReminderStore(
    useShallow((state) => ({
      exportData: state.exportData,
      importData: state.importData,
      resetAll: state.resetAll,
    }))
  );

  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${FILE_NAMES.BACKUP_PREFIX}${
      new Date().toISOString().split("T")[0]
    }${FILE_NAMES.BACKUP_EXTENSION}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportData]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          if (importData(data)) {
            toast.success(t("data-imported-success"));
          } else {
            toast.error(t("data-imported-error"));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importData, t]);

  const handleReset = useCallback(() => {
    resetAll();
    toast.success(t("data-reset-success"));
  }, [resetAll, t]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <SettingsSoundSection
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume}
          onToggleSound={toggleSound}
          onVolumeChange={setSoundVolume}
        />
        <SettingsDataSection
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
        />
      </div>
    </div>
  );
});
