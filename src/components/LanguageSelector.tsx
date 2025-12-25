import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", nameKey: "english" },
  { code: "vi", nameKey: "vietnamese" },
  { code: "fr", nameKey: "french" },
  { code: "de", nameKey: "german" },
  { code: "zh-CN", nameKey: "simplified-chinese" },
  { code: "zh-TW", nameKey: "traditional-chinese" },
  { code: "es", nameKey: "spanish" },
  { code: "sv", nameKey: "swedish" },
  { code: "da", nameKey: "danish" },
  { code: "nl", nameKey: "dutch" },
];

export default memo(function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { settings, setLanguage } = useSettingsStore();
  const currentLanguage = settings.language || i18n.language || "en";

  const handleLanguageChange = useCallback(
    (languageCode: string) => {
      setLanguage(languageCode);
    },
    [setLanguage]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={t("language")}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                currentLanguage === lang.code &&
                  "bg-accent text-accent-foreground font-medium"
              )}
            >
              {t(lang.nameKey)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
