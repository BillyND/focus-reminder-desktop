import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Maximize2, X } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

export default memo(function Header() {
  const handleMinimize = useCallback(() => {
    window.electronAPI?.minimizeWindow();
  }, []);

  const handleMaximize = useCallback(() => {
    window.electronAPI?.maximizeWindow();
  }, []);

  const handleClose = useCallback(() => {
    window.electronAPI?.closeWindow();
  }, []);

  return (
    <header className="draggable flex items-center justify-between px-3 py-2 border-b transition-colors">
      <div className="flex items-center gap-3">
        {/* <span className="text-2xl">💧</span>
        <div>
          <h1 className="text-lg font-semibold">Health Reminder</h1>
        </div> */}
      </div>

      <div className="non-draggable flex items-center gap-2">
        <LanguageSelector />
        {/* Window Controls */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            onClick={handleMinimize}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Minimize"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleMaximize}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Maximize"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
});
