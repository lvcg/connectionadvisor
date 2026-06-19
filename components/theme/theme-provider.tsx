"use client";

import { useEffect } from "react";

function readSavedDarkMode() {
  try {
    const settings = window.localStorage.getItem("homey-settings");
    if (!settings) return false;
    const parsed = JSON.parse(settings) as { darkMode?: boolean };
    return Boolean(parsed.darkMode);
  } catch {
    return false;
  }
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(readSavedDarkMode());

    const handleThemeChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ darkMode?: boolean }>).detail;
      applyTheme(Boolean(detail?.darkMode));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "homey-settings") {
        applyTheme(readSavedDarkMode());
      }
    };

    window.addEventListener("homey-theme-changed", handleThemeChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("homey-theme-changed", handleThemeChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return children;
}
