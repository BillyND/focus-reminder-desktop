import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsStartupSectionProps {
  autoLaunchEnabled: boolean;
  onToggleAutoLaunch: () => void;
}

export const SettingsStartupSection = memo(function SettingsStartupSection({
  autoLaunchEnabled,
  onToggleAutoLaunch,
}: SettingsStartupSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Label className="text-base font-semibold cursor-pointer">
            {t("launch-on-startup")}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            {t("launch-on-startup-description")}
          </p>
        </div>
        <Switch
          checked={autoLaunchEnabled}
          onCheckedChange={onToggleAutoLaunch}
          aria-label="Toggle launch on startup"
        />
      </div>
    </Card>
  );
});
