import { useState } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { PRESET_COLORS, DURATION_OPTIONS } from "@/types/reminder";
import { Reminder } from "@/types/reminder";
import EmojiPicker from "./EmojiPicker";
import ColorPicker from "./ColorPicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Timer, X } from "lucide-react";

const defaultFormData = {
  message: "",
  icon: "💧",
  color: PRESET_COLORS[0],
  type: "interval" as "interval" | "scheduled",
  interval: 30,
  times: ["09:00"] as string[],
  displayMinutes: 1,
  enabled: true,
};

export default function AddReminder() {
  const { addReminder, setActiveTab } = useReminderStore();
  const [formData, setFormData] = useState(defaultFormData);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newTime, setNewTime] = useState("09:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    if (formData.type === "scheduled" && formData.times.length === 0) {
      alert("Please add at least one reminder time!");
      return;
    }

    const reminderData: Reminder = {
      id: "", // Will be generated in store
      message: formData.message,
      icon: formData.icon,
      color: formData.color,
      type: formData.type,
      displayMinutes: formData.displayMinutes,
      enabled: formData.enabled,
      ...(formData.type === "interval"
        ? { interval: formData.interval }
        : { times: formData.times }),
    };

    addReminder(reminderData);
    setFormData(defaultFormData);
    setActiveTab("reminders");
  };

  const handleReset = () => {
    setFormData(defaultFormData);
  };

  const addTime = () => {
    if (newTime && !formData.times.includes(newTime)) {
      setFormData({
        ...formData,
        times: [...formData.times, newTime].sort(),
      });
      setNewTime("09:00");
    }
  };

  const removeTime = (time: string) => {
    setFormData({
      ...formData,
      times: formData.times.filter((t) => t !== time),
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Reminder Content</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="Enter reminder content..."
            required
          />
        </div>

        {/* Icon Picker */}
        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              variant="outline"
              size="lg"
            >
              <span className="text-3xl">{formData.icon}</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              Click to choose an icon
            </span>
          </div>
          {showEmojiPicker && (
            <EmojiPicker
              selectedEmoji={formData.icon}
              onSelect={(icon) => {
                setFormData({ ...formData, icon });
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <Label>Color</Label>
          <ColorPicker
            selectedColor={formData.color}
            onSelect={(color) => setFormData({ ...formData, color })}
          />
        </div>

        {/* Reminder Type */}
        <div className="space-y-2">
          <Label>Reminder Type</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, type: "interval" })}
              variant={formData.type === "interval" ? "default" : "outline"}
              className="flex-1"
            >
              <Timer className="mr-2 h-4 w-4" />
              Repeat by minutes
            </Button>
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, type: "scheduled" })}
              variant={formData.type === "scheduled" ? "default" : "outline"}
              className="flex-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              Fixed time
            </Button>
          </div>
        </div>

        {/* Interval or Scheduled Times */}
        {formData.type === "interval" ? (
          <div className="space-y-2">
            <Label htmlFor="interval">Repeat every (minutes)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="interval"
                type="number"
                min="1"
                max="1440"
                value={formData.interval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
              />
              <div className="flex gap-2">
                {[15, 30, 60].map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, interval: mins })}
                    variant={formData.interval === mins ? "default" : "outline"}
                    size="sm"
                  >
                    {mins}m
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <div className="flex gap-2">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <Button type="button" onClick={addTime}>
                Add
              </Button>
            </div>
            {formData.times.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.times.map((time) => (
                  <Badge key={time} variant="secondary" className="gap-1">
                    {time}
                    <button
                      type="button"
                      onClick={() => removeTime(time)}
                      className="hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        <div className="space-y-2">
          <Label>Notification display duration</Label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, displayMinutes: option.value })
                }
                variant={
                  formData.displayMinutes === option.value
                    ? "default"
                    : "outline"
                }
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <Card className="relative overflow-hidden p-4">
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: formData.color }}
            />
            <div className="flex items-center gap-3 pl-3">
              <span className="text-3xl">{formData.icon}</span>
              <div>
                <p className="font-semibold">
                  {formData.message || "Reminder Content"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.type === "interval"
                    ? `Repeats every ${formData.interval} minutes`
                    : `${
                        formData.times.length
                      } times daily: ${formData.times.join(", ")}`}{" "}
                  • {formData.displayMinutes}m
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={handleReset}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={!formData.message.trim()}
          >
            Save Reminder
          </Button>
        </div>
      </form>
    </div>
  );
}
