import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/config";
import {
  playNotificationSound,
  playNotificationSoundRepeatedly,
  stopAllSounds,
  stopRepeatedSound,
} from "./utils/sound";

// Expose sound functions to window for main process to call
if (typeof window !== "undefined") {
  (window as any).__soundFunctions = {
    playNotificationSound,
    playNotificationSoundRepeatedly,
    stopAllSounds,
    stopRepeatedSound,
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
