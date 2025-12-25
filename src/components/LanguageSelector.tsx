import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Map language codes to country codes for flags
const languages = [
  { code: "en", countryCode: "us", nativeName: "English" },
  { code: "vi", countryCode: "vn", nativeName: "Tiếng Việt" },
  { code: "fr", countryCode: "fr", nativeName: "Français" },
  { code: "de", countryCode: "de", nativeName: "Deutsch" },
  { code: "zh-CN", countryCode: "cn", nativeName: "简体中文" },
  { code: "zh-TW", countryCode: "tw", nativeName: "繁體中文" },
  { code: "es", countryCode: "es", nativeName: "Español" },
  { code: "sv", countryCode: "se", nativeName: "Svenska" },
  { code: "da", countryCode: "dk", nativeName: "Dansk" },
  { code: "nl", countryCode: "nl", nativeName: "Nederlands" },
];

const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/24x18/${countryCode}.png`;
};

export default memo(function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { settings, setLanguage } = useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      setLanguage: state.setLanguage,
    }))
  );
  const currentLanguage = settings.language || i18n.language || "en";
  const [isOpen, setIsOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleLanguageChange = useCallback(
    (languageCode: string) => {
      setLanguage(languageCode);
      setIsOpen(false);
    },
    [setLanguage]
  );

  const handleImageError = useCallback((countryCode: string) => {
    setImageErrors((prev) => new Set(prev).add(countryCode));
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("language")}>
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
                "flex items-center gap-2",
                currentLanguage === lang.code &&
                  "bg-accent text-accent-foreground font-medium"
              )}
            >
              {imageErrors.has(lang.countryCode) ? (
                <div className="w-5 h-4 bg-muted rounded-sm flex items-center justify-center text-xs">
                  {lang.countryCode.toUpperCase()}
                </div>
              ) : (
                <img
                  src={getFlagUrl(lang.countryCode)}
                  alt={`${lang.nativeName} flag`}
                  className="w-5 h-4 object-cover rounded-sm"
                  loading="lazy"
                  onError={() => handleImageError(lang.countryCode)}
                  crossOrigin="anonymous"
                />
              )}
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
