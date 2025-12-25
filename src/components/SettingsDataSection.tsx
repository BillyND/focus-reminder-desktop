import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Upload, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface SettingsDataSectionProps {
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export const SettingsDataSection = memo(function SettingsDataSection({
  onExport,
  onImport,
  onReset,
}: SettingsDataSectionProps) {
  const { t } = useTranslation();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleResetConfirm = useCallback(() => {
    onReset();
    setIsResetDialogOpen(false);
  }, [onReset]);

  return (
    <Card className="p-4">
      <h3 className="text-base font-semibold mb-4">{t("data-management")}</h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button onClick={onExport} variant="outline" className="flex-1">
            <Upload className="mr-2 h-4 w-4" />
            {t("export-data")}
          </Button>
          <Button onClick={onImport} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            {t("import-data")}
          </Button>
        </div>
        <div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("reset-all")}
          </Button>
          <ConfirmDialog
            open={isResetDialogOpen}
            onOpenChange={setIsResetDialogOpen}
            onConfirm={handleResetConfirm}
            title={t("confirm-reset")}
            description={t("reset-confirm-description")}
            confirmText={t("reset-all")}
            variant="destructive"
          />
        </div>
      </div>
    </Card>
  );
});
