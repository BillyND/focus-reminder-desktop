import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ScheduledTimeInputProps {
  times: string[];
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  onTimeChange: (index: number, time: string) => void;
}

export const ScheduledTimeInput = memo(function ScheduledTimeInput({
  times,
  onAddTime,
  onRemoveTime,
  onTimeChange,
}: ScheduledTimeInputProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="time-picker" className="px-1">
        {t("reminder-time")}
      </Label>

      {/* Time inputs */}
      {times.map((time, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            type="time"
            step="1"
            value={time}
            onChange={(e) => onTimeChange(index, e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveTime(index)}
            className="h-9 w-9 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add button */}
      <Button type="button" onClick={onAddTime} className="w-fit">
        {t("add")}
      </Button>
    </div>
  );
});
