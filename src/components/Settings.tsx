import { useState, useCallback } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useReminderStore } from "@/store/reminderStore";
import { FILE_NAMES, MESSAGES, DEFAULTS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Trash2 } from "lucide-react";

export default function Settings() {
  const { settings, toggleDarkMode, toggleSound, setSoundVolume } =
    useSettingsStore();
  const { exportData, importData, resetAll } = useReminderStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
            alert(MESSAGES.DATA_IMPORTED_SUCCESS);
          } else {
            alert(MESSAGES.DATA_IMPORTED_ERROR);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importData]);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      resetAll();
      setShowResetConfirm(false);
      alert(MESSAGES.DATA_RESET_SUCCESS);
    } else {
      setShowResetConfirm(true);
    }
  }, [showResetConfirm, resetAll]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dark Mode */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-semibold cursor-pointer">
                {MESSAGES.DARK_MODE}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {MESSAGES.DARK_MODE_DESCRIPTION}
              </p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
          </div>
        </Card>

        {/* Notification Sound */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-semibold cursor-pointer">
                {MESSAGES.NOTIFICATION_SOUND}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {MESSAGES.NOTIFICATION_SOUND_DESCRIPTION}
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={toggleSound}
              aria-label="Toggle sound"
            />
          </div>
        </Card>

        {/* Sound Volume */}
        {settings.soundEnabled && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-base font-semibold">
                    {MESSAGES.NOTIFICATION_VOLUME}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {MESSAGES.NOTIFICATION_VOLUME_DESCRIPTION}
                  </p>
                </div>
                <span className="text-primary font-medium ml-4">
                  {settings.soundVolume || DEFAULTS.SOUND_VOLUME}%
                </span>
              </div>
              <Slider
                value={[settings.soundVolume || DEFAULTS.SOUND_VOLUME]}
                onValueChange={(value) => setSoundVolume(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </Card>
        )}

        {/* Data Management */}
        <Card className="p-4">
          <h3 className="text-base font-semibold mb-4">
            {MESSAGES.DATA_MANAGEMENT}
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                {MESSAGES.EXPORT_DATA}
              </Button>
              <Button
                onClick={handleImport}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {MESSAGES.IMPORT_DATA}
              </Button>
            </div>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {showResetConfirm ? MESSAGES.CONFIRM_RESET : MESSAGES.RESET_ALL}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
