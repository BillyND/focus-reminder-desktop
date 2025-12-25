import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ReminderFormData } from "@/types/reminder";
import { Label } from "@/components/ui/label";
import { getPreviewText } from "@/utils/reminder";
import { ReminderCardBase } from "./ReminderCardBase";

interface ReminderPreviewProps {
  formData: ReminderFormData;
}

export const ReminderPreview = memo(function ReminderPreview({
  formData,
}: ReminderPreviewProps) {
  const { t } = useTranslation();
  const previewText = getPreviewText(formData);

  const metadata = (
    <>
      <span className="text-xs text-muted-foreground">
        {previewText} •{" "}
        {formData.displayMinutes > 1
          ? t("duration-minutes", { duration: formData.displayMinutes })
          : t("duration-minute", { duration: formData.displayMinutes })}
      </span>
    </>
  );

  return (
    <div className="space-y-2">
      <Label>{t("preview")}</Label>
      <ReminderCardBase
        icon={formData.icon}
        message={formData.message || t("reminder-content")}
        color={formData.color}
        metadata={metadata}
      />
    </div>
  );
});
