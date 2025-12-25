import { useState } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { useReminderStore } from "../store/reminderStore";

export default function Settings() {
  const { settings, toggleDarkMode, toggleSound, setSoundVolume } =
    useSettingsStore();
  const { exportData, importData, resetAll } = useReminderStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focus-reminder-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          if (importData(data)) {
            alert("Nhập dữ liệu thành công!");
          } else {
            alert("Lỗi: Dữ liệu không hợp lệ!");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetAll();
      setShowResetConfirm(false);
      alert("Đã đặt lại tất cả dữ liệu!");
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-white dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dark Mode */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">
                Giao diện tối
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                Dễ nhìn hơn trong điều kiện ánh sáng yếu
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`toggle-switch ${settings.darkMode ? "active" : ""}`}
              aria-label="Toggle dark mode"
            />
          </div>
        </div>

        {/* Notification Sound */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">
                Âm thanh thông báo
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                Phát âm thanh khi hiển thị nhắc nhở
              </p>
            </div>
            <button
              onClick={toggleSound}
              className={`toggle-switch ${
                settings.soundEnabled ? "active" : ""
              }`}
              aria-label="Toggle sound"
            />
          </div>
        </div>

        {/* Sound Volume */}
        {settings.soundEnabled && (
          <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">
                  Âm lượng thông báo
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  Điều chỉnh độ to của âm thanh
                </p>
              </div>
              <span className="text-blue-500 font-medium ml-4">
                {settings.soundVolume || 30}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.soundVolume || 30}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}

        {/* Data Management */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-dark-border">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">
            Quản lý dữ liệu
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-dark-hover rounded-lg text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-blue-500"
                >
                  <path d="M8 12L4 8H6V4H10V8H12L8 12Z" />
                </svg>
                <span className="font-medium">Xuất dữ liệu</span>
              </button>
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-dark-hover rounded-lg text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-blue-500"
                >
                  <path d="M8 4L12 8H10V12H6V8H4L8 4Z" />
                </svg>
                <span className="font-medium">Nhập dữ liệu</span>
              </button>
            </div>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4L12 12M4 12L12 4" />
              </svg>
              <span>
                {showResetConfirm ? "Xác nhận đặt lại?" : "Đặt lại tất cả"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
