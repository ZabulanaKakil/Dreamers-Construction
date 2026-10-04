"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type ThemeFamily = "current" | "army" | "logo";
export type ColorModePreference = "light" | "dark" | "system";

export type ResolvedColorMode = "light" | "dark";

const STORAGE_THEME = "dc-theme-family";
const STORAGE_MODE = "dc-color-mode";

const DEFAULT_THEME: ThemeFamily = "army";
const DEFAULT_MODE: ColorModePreference = "system";

interface ThemeContextValue {
  themeFamily: ThemeFamily;
  colorModePreference: ColorModePreference;
  resolvedColorMode: ResolvedColorMode;
  setThemeFamily: (family: ThemeFamily) => void;
  setColorModePreference: (mode: ColorModePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeFamily {
  const stored = localStorage.getItem(STORAGE_THEME) as ThemeFamily | null;
  return stored && ["current", "army", "logo"].includes(stored)
    ? stored
    : DEFAULT_THEME;
}

function readStoredMode(): ColorModePreference {
  const stored = localStorage.getItem(STORAGE_MODE) as ColorModePreference | null;
  return stored && ["light", "dark", "system"].includes(stored)
    ? stored
    : DEFAULT_MODE;
}

function subscribeToThemeStore(onStoreChange: () => void) {
  window.addEventListener("dc-theme-change", onStoreChange);
  return () => window.removeEventListener("dc-theme-change", onStoreChange);
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function applyTheme(family: ThemeFamily, mode: ResolvedColorMode) {
  document.documentElement.dataset.themeFamily = family;
  document.documentElement.dataset.colorMode = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeFamily = useSyncExternalStore(
    subscribeToThemeStore,
    readStoredTheme,
    () => DEFAULT_THEME,
  );

  const colorModePreference = useSyncExternalStore(
    subscribeToThemeStore,
    readStoredMode,
    () => DEFAULT_MODE,
  );

  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );

  const resolvedColorMode: ResolvedColorMode =
    colorModePreference === "system"
      ? systemDark
        ? "dark"
        : "light"
      : colorModePreference;

  useEffect(() => {
    applyTheme(themeFamily, resolvedColorMode);
  }, [themeFamily, resolvedColorMode]);

  const setThemeFamily = useCallback((family: ThemeFamily) => {
    localStorage.setItem(STORAGE_THEME, family);
    window.dispatchEvent(new Event("dc-theme-change"));
  }, []);

  const setColorModePreference = useCallback((mode: ColorModePreference) => {
    localStorage.setItem(STORAGE_MODE, mode);
    window.dispatchEvent(new Event("dc-theme-change"));
  }, []);

  const value = useMemo(
    () => ({
      themeFamily,
      colorModePreference,
      resolvedColorMode,
      setThemeFamily,
      setColorModePreference,
    }),
    [
      themeFamily,
      colorModePreference,
      resolvedColorMode,
      setThemeFamily,
      setColorModePreference,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
