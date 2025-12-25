import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ReminderType } from "@/types/common";
import { REMINDER_TYPE } from "@/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Timer, Clock } from "lucide-react";

interface ReminderTypeSelectorProps {
  type: ReminderType;
  onTypeChange: (type: ReminderType) => void;
  size?: "default" | "sm";
}

export const ReminderTypeSelector = memo(function ReminderTypeSelector({
  type,
  onTypeChange,
  size = "default",
}: ReminderTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{t("reminder-type")}</Label>
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => onTypeChange(REMINDER_TYPE.INTERVAL)}
          variant={type === REMINDER_TYPE.INTERVAL ? "default" : "outline"}
          className="flex-1"
          size={size}
        >
          <Timer className="mr-2 h-4 w-4" />
          {t("repeat-by-minutes")}
        </Button>
        <Button
          type="button"
          onClick={() => onTypeChange(REMINDER_TYPE.SCHEDULED)}
          variant={type === REMINDER_TYPE.SCHEDULED ? "default" : "outline"}
          className="flex-1"
          size={size}
        >
          <Clock className="mr-2 h-4 w-4" />
          {t("fixed-time")}
        </Button>
      </div>
    </div>
  );
});

