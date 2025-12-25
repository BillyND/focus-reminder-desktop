import path from "path";

export function getIconPath(): string {
  return path.join(__dirname, "../public/icon.png");
}

export function getSoundFilePath(): string {
  return path.join(__dirname, "../public/alarm.mp3");
}
