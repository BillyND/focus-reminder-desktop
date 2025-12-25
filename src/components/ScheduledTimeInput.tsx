import { memo } from "react";
import { MESSAGES } from "@/constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ScheduledTimeInputProps {
  times: string[];
  newTime: string;
  onNewTimeChange: (time: string) => void;
  onAddTime: () => void;
  onRemoveTime: (time: string) => void;
}

export const ScheduledTimeInput = memo(function ScheduledTimeInput({
  times,
  newTime,
  onNewTimeChange,
  onAddTime,
  onRemoveTime,
}: ScheduledTimeInputProps) {
  return (
    <div className="space-y-2">
      <Label>{MESSAGES.REMINDER_TIME}</Label>
      <div className="flex gap-2">
        <Input
          type="time"
          value={newTime}
          onChange={(e) => onNewTimeChange(e.target.value)}
        />
        <Button type="button" onClick={onAddTime}>
          {MESSAGES.ADD}
        </Button>
      </div>
      {times.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {times.map((time) => (
            <Badge key={time} variant="secondary" className="gap-1">
              {time}
              <button
                type="button"
                onClick={() => onRemoveTime(time)}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});

