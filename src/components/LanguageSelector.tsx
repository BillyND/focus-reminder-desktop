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

  // Get selected language info for trigger display
  const selectedLang =
    languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          aria-label={t("language")}
          className="gap-2 pr-3 px-2 py-1 h-[fit-content]"
        >
          {/* Show flag or fallback text */}
          {imageErrors.has(selectedLang.countryCode) ? (
            <div className="w-5 h-4 bg-muted rounded-sm flex items-center justify-center text-xs">
              {selectedLang.countryCode.toUpperCase()}
            </div>
          ) : (
            <img
              src={getFlagUrl(selectedLang.countryCode)}
              alt={`${selectedLang.nativeName} flag`}
              className="w-5 h-4 object-cover rounded-sm"
              loading="lazy"
              onError={() => handleImageError(selectedLang.countryCode)}
              crossOrigin="anonymous"
            />
          )}
          <span className="font-medium">{selectedLang.nativeName}</span>
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
