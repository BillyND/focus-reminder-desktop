import { memo, useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DEFAULTS } from "@/constants";
import { playNotificationSoundUntilEnd, stopAllSounds } from "@/utils/sound";

interface SettingsSoundSectionProps {
  soundEnabled: boolean;
  soundVolume?: number;
  onToggleSound: () => void;
  onVolumeChange: (volume: number) => void;
}

export const SettingsSoundSection = memo(function SettingsSoundSection({
  soundEnabled,
  soundVolume,
  onToggleSound,
  onVolumeChange,
}: SettingsSoundSectionProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTestSound = useCallback(async () => {
    if (isPlaying) {
      stopAllSounds();
      setIsPlaying(false);
      return;
    }

    try {
      const currentVolume = soundVolume || DEFAULTS.SOUND_VOLUME;
      setIsPlaying(true);
      await playNotificationSoundUntilEnd(currentVolume);
      console.log("===> Test sound finished");
      setIsPlaying(false);
    } catch (error) {
      console.error("===> Failed to play test sound:", error);
      setIsPlaying(false);
    }
  }, [soundVolume, isPlaying]);

  useEffect(() => {
    if (!soundEnabled && isPlaying) {
      stopAllSounds();
      setIsPlaying(false);
    }
  }, [soundEnabled, isPlaying]);

  useEffect(() => {
    return () => {
      if (isPlaying) {
        stopAllSounds();
      }
    };
  }, [isPlaying]);

  return (
    <>
      {/* Notification Sound */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-base font-semibold cursor-pointer">
              {t("notification-sound")}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t("notification-sound-description")}
            </p>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={onToggleSound}
            aria-label="Toggle sound"
          />
        </div>
      </Card>

      {/* Sound Volume */}
      {soundEnabled && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-base font-semibold">
                  {t("notification-volume")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("notification-volume-description")}
                </p>
              </div>
              <span className="text-primary font-medium ml-4">
                {soundVolume || DEFAULTS.SOUND_VOLUME}%
              </span>
            </div>
            <Slider
              value={[soundVolume || DEFAULTS.SOUND_VOLUME]}
              onValueChange={(value) => onVolumeChange(value[0])}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-end pt-2">
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={handleTestSound}
                className="gap-2"
              >
                {isPlaying ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {isPlaying ? t("stop-sound") : t("test-sound")}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
});
