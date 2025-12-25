import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useReminderStore } from "@/store/reminderStore";
import { FILE_NAMES, DEFAULTS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, Trash2 } from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();
  const { settings, toggleSound, setSoundVolume } = useSettingsStore();
  const { exportData, importData, resetAll } = useReminderStore();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

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
  }, [importData]);

  const handleResetConfirm = useCallback(() => {
    resetAll();
    setIsResetDialogOpen(false);
    toast.success(t("data-reset-success"));
  }, [resetAll, t]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Notification Sound */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-semibold cursor-pointer">
                {t("notification-sound")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("notification-sound-description")}
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
                    {t("notification-volume")}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("notification-volume-description")}
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
            {t("data-management")}
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t("export-data")}
              </Button>
              <Button
                onClick={handleImport}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("import-data")}
              </Button>
            </div>
            <AlertDialog
              open={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("reset-all")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirm-reset")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("reset-confirm-description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("reset-all")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
}
