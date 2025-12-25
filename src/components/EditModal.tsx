import { useState, useEffect } from "react";
import { useReminderStore } from "@/store/reminderStore";
import { DURATION_OPTIONS, Reminder } from "@/types/reminder";
import EmojiPicker from "./EmojiPicker";
import ColorPicker from "./ColorPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Timer, Clock, X } from "lucide-react";

export default function EditModal() {
  const { editingReminder, setEditingReminder, updateReminder } =
    useReminderStore();
  const [formData, setFormData] = useState<Reminder | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newTime, setNewTime] = useState("09:00");

  useEffect(() => {
    if (editingReminder) {
      setFormData({ ...editingReminder });
      if (editingReminder.times && editingReminder.times.length > 0) {
        setNewTime(editingReminder.times[editingReminder.times.length - 1]);
      }
    }
  }, [editingReminder]);

  if (!formData) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.message.trim()) return;
    if (
      formData.type === "scheduled" &&
      (!formData.times || formData.times.length === 0)
    ) {
      alert("Please add at least one reminder time!");
      return;
    }

    updateReminder(formData.id, formData);
    setEditingReminder(null);
  };

  const handleClose = () => {
    setEditingReminder(null);
  };

  const addTime = () => {
    if (newTime && formData.times && !formData.times.includes(newTime)) {
      setFormData({
        ...formData,
        times: [...formData.times, newTime].sort(),
      });
      setNewTime("09:00");
    } else if (newTime && !formData.times) {
      setFormData({
        ...formData,
        times: [newTime],
      });
      setNewTime("09:00");
    }
  };

  const removeTime = (time: string) => {
    if (formData.times) {
      setFormData({
        ...formData,
        times: formData.times.filter((t) => t !== time),
      });
    }
  };

  return (
    <Dialog
      open={!!editingReminder}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Reminder</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[calc(90vh-180px)] pr-2"
        >
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="edit-message">Reminder Content</Label>
            <Textarea
              id="edit-message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Enter reminder content..."
              required
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                variant="outline"
                size="lg"
              >
                <span className="text-2xl">{formData.icon}</span>
              </Button>
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

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker
              selectedColor={formData.color}
              onSelect={(color) => setFormData({ ...formData, color })}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Reminder Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, type: "interval" })}
                variant={formData.type === "interval" ? "default" : "outline"}
                className="flex-1"
                size="sm"
              >
                <Timer className="mr-2 h-4 w-4" />
                Repeat
              </Button>
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, type: "scheduled" })}
                variant={formData.type === "scheduled" ? "default" : "outline"}
                className="flex-1"
                size="sm"
              >
                <Clock className="mr-2 h-4 w-4" />
                Fixed time
              </Button>
            </div>
          </div>

          {/* Interval or Scheduled Times */}
          {formData.type === "interval" ? (
            <div className="space-y-2">
              <Label htmlFor="edit-interval">Repeat every (minutes)</Label>
              <Input
                id="edit-interval"
                type="number"
                min="1"
                max="1440"
                value={formData.interval || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
              />
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
                <Button type="button" onClick={addTime} size="sm">
                  Add
                </Button>
              </div>
              {formData.times && formData.times.length > 0 && (
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
            <Label>Display duration</Label>
            <div className="flex gap-2 flex-wrap">
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
        </form>

        <DialogFooter>
          <Button type="button" onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={!formData.message.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
