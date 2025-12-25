import { memo } from "react";
import { INTERVAL_PRESETS, LIMITS, MESSAGES } from "@/constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IntervalInputProps {
  interval: number;
  onIntervalChange: (interval: number) => void;
}

export const IntervalInput = memo(function IntervalInput({
  interval,
  onIntervalChange,
}: IntervalInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="interval">{MESSAGES.REPEAT_EVERY}</Label>
      <div className="flex items-center gap-3">
        <Input
          id="interval"
          type="number"
          min={LIMITS.MIN_INTERVAL}
          max={LIMITS.MAX_INTERVAL}
          value={interval}
          onChange={(e) =>
            onIntervalChange(parseInt(e.target.value) || LIMITS.MIN_INTERVAL)
          }
        />
        <div className="flex gap-2">
          {INTERVAL_PRESETS.map((mins) => (
            <Button
              key={mins}
              type="button"
              onClick={() => onIntervalChange(mins)}
              variant={interval === mins ? "default" : "outline"}
              size="sm"
            >
              {mins}m
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});
