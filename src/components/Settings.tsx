import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useReminderStore } from "@/store/reminderStore";
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

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focus-reminder-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
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
            alert("Data imported successfully!");
          } else {
            alert("Error: Invalid data!");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetAll();
      setShowResetConfirm(false);
      alert("All data has been reset!");
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dark Mode */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-semibold cursor-pointer">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Easier on the eyes in low light
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
                Notification Sound
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Play sound when showing reminders
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
                    Notification Volume
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adjust sound volume
                  </p>
                </div>
                <span className="text-primary font-medium ml-4">
                  {settings.soundVolume || 30}%
                </span>
              </div>
              <Slider
                value={[settings.soundVolume || 30]}
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
          <h3 className="text-base font-semibold mb-4">Data Management</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button
                onClick={handleImport}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            </div>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {showResetConfirm ? "Confirm reset?" : "Reset All"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
