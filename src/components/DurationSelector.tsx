import { memo } from "react";
import { useTranslation } from "react-i18next";
import { DURATION_OPTIONS } from "@/types/reminder";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DurationSelectorProps {
  displayMinutes: number;
  onDisplayMinutesChange: (minutes: number) => void;
}

export const DurationSelector = memo(function DurationSelector({
  displayMinutes,
  onDisplayMinutesChange,
}: DurationSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{t("display-duration")}</Label>
      <div className="flex gap-2 flex-wrap">
        {DURATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            onClick={() => onDisplayMinutesChange(option.value)}
            variant={displayMinutes === option.value ? "default" : "outline"}
            size="sm"
          >
            {t("duration-minutes", { minute: option.value })}
          </Button>
        ))}
      </div>
    </div>
  );
});
