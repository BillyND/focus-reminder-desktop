import path from "path";
import { existsSync } from "fs";

export function getIconPath(): string {
  // In production build, icon is in dist folder (copied from public by Vite)
  // In dev mode, icon is in public folder
  const distIconPath = path.join(__dirname, "../dist/icon.png");
  const publicIconPath = path.join(__dirname, "../public/icon.png");
  
  // Check which path exists (production build will have dist/icon.png)
  if (existsSync(distIconPath)) {
    return distIconPath;
  }
  
  // Fallback to public folder (dev mode)
  return publicIconPath;
}

export function getSoundFilePath(): string {
  return path.join(__dirname, "../public/alarm.mp3");
}
