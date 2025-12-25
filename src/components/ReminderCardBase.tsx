import { memo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

interface ReminderCardBaseProps {
  icon: string;
  message: string;
  color: string;
  metadata?: ReactNode;
  actions?: ReactNode;
  isActive?: boolean;
  className?: string;
}

export const ReminderCardBase = memo(function ReminderCardBase({
  icon,
  message,
  color,
  metadata,
  actions,
  isActive = false,
  className = "",
}: ReminderCardBaseProps) {
  return (
    <Card
      className={`
        group relative overflow-hidden transition-opacity
        ${!isActive ? "opacity-60" : ""}
        ${className}
      `}
    >
      {/* Color indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start gap-3 pl-3 p-4 pr-12">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0 mt-1">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base leading-snug mb-1">{message}</p>
          {metadata && (
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              {metadata}
            </div>
          )}
        </div>
      </div>

      {/* Active status indicator - top right */}
      {isActive && (
        <div className="absolute top-1 right-1 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      )}

      {/* Menu button - far right corner */}
      {actions && <div className="absolute top-3 right-3 z-10">{actions}</div>}
    </Card>
  );
});
