import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ReminderFormData } from "@/types/reminder";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getPreviewText } from "@/utils/reminder";

interface ReminderPreviewProps {
  formData: ReminderFormData;
}

export const ReminderPreview = memo(function ReminderPreview({
  formData,
}: ReminderPreviewProps) {
  const { t } = useTranslation();
  const previewText = getPreviewText(formData);

  return (
    <div className="space-y-2">
      <Label>{t("preview")}</Label>
      <Card className="relative overflow-hidden p-4">
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: formData.color }}
        />
        <div className="flex items-center gap-3 pl-3">
          <span className="text-3xl">{formData.icon}</span>
          <div>
            <p className="font-semibold">
              {formData.message || t("reminder-content")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {previewText} • {formData.displayMinutes}m
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
});
