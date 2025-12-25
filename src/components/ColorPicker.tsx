import { PRESET_COLORS } from "@/types/reminder";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({
  selectedColor,
  onSelect,
}: ColorPickerProps) {
  return (
    <div className="flex gap-2">
      {PRESET_COLORS.map((color) => (
        <Button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          variant={selectedColor === color ? "default" : "outline"}
          size="icon"
          className="w-10 h-10"
          style={{ backgroundColor: color }}
        >
          {selectedColor === color && <Check className="h-4 w-4 text-white" />}
        </Button>
      ))}
    </div>
  );
}
