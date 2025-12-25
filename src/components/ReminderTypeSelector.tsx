import { memo } from "react";
import { ReminderType } from "@/types/common";
import { REMINDER_TYPE, MESSAGES } from "@/constants";
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
  return (
    <div className="space-y-2">
      <Label>{MESSAGES.REMINDER_TYPE}</Label>
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => onTypeChange(REMINDER_TYPE.INTERVAL)}
          variant={type === REMINDER_TYPE.INTERVAL ? "default" : "outline"}
          className="flex-1"
          size={size}
        >
          <Timer className="mr-2 h-4 w-4" />
          {MESSAGES.REPEAT_BY_MINUTES}
        </Button>
        <Button
          type="button"
          onClick={() => onTypeChange(REMINDER_TYPE.SCHEDULED)}
          variant={type === REMINDER_TYPE.SCHEDULED ? "default" : "outline"}
          className="flex-1"
          size={size}
        >
          <Clock className="mr-2 h-4 w-4" />
          {MESSAGES.FIXED_TIME}
        </Button>
      </div>
    </div>
  );
});

