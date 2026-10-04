"use client";

import { useState } from "react";
import {
  useTheme,
  type ColorModePreference,
  type ThemeFamily,
} from "./ThemeProvider";

const themeFamilies: { id: ThemeFamily; label: string }[] = [
  { id: "army", label: "Army" },
  { id: "current", label: "Luxury" },
  { id: "logo", label: "Logo" },
];

const colorModes: { id: ColorModePreference; label: string }[] = [
  { id: "system", label: "Auto" },
  { id: "light", label: "Day" },
  { id: "dark", label: "Night" },
];

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { themeFamily, colorModePreference, setThemeFamily, setColorModePreference } =
    useTheme();
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          aria-label="Theme settings"
          aria-expanded={open}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="Close theme menu"
              onClick={() => setOpen(false)}
            />
            <ThemePanel
              className="absolute right-0 top-full z-50 mt-2 w-56"
              themeFamily={themeFamily}
              colorModePreference={colorModePreference}
              onThemeChange={setThemeFamily}
              onModeChange={setColorModePreference}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <ThemePanel
      themeFamily={themeFamily}
      colorModePreference={colorModePreference}
      onThemeChange={setThemeFamily}
      onModeChange={setColorModePreference}
    />
  );
}

function ThemePanel({
  className = "",
  themeFamily,
  colorModePreference,
  onThemeChange,
  onModeChange,
}: {
  className?: string;
  themeFamily: ThemeFamily;
  colorModePreference: ColorModePreference;
  onThemeChange: (family: ThemeFamily) => void;
  onModeChange: (mode: ColorModePreference) => void;
}) {
  return (
    <div className={`ui-panel-elevated p-4 shadow-lg ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Theme</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {themeFamilies.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onThemeChange(t.id)}
            className={`px-2.5 py-1 text-xs transition-colors ${
              themeFamily === t.id
                ? "bg-accent text-background"
                : "border border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent">
        Day / Night
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {colorModes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onModeChange(m.id)}
            className={`px-2.5 py-1 text-xs transition-colors ${
              colorModePreference === m.id
                ? "bg-accent text-background"
                : "border border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
