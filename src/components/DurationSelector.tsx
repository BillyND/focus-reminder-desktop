import { memo } from "react";
import { DURATION_OPTIONS } from "@/types/reminder";
import { MESSAGES } from "@/constants";
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
  return (
    <div className="space-y-2">
      <Label>{MESSAGES.DISPLAY_DURATION}</Label>
      <div className="flex gap-2 flex-wrap">
        {DURATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            onClick={() => onDisplayMinutesChange(option.value)}
            variant={displayMinutes === option.value ? "default" : "outline"}
            size="sm"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
});
