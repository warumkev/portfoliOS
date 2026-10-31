"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ResolvedTheme, Theme } from "@/lib/types";

export const ACCENTS = [
  { id: "blue", label: "Blue", value: "#3b82f6" },
  { id: "indigo", label: "Indigo", value: "#6366f1" },
  { id: "violet", label: "Violet", value: "#8b5cf6" },
  { id: "rose", label: "Rose", value: "#f43f5e" },
  { id: "orange", label: "Orange", value: "#f97316" },
  { id: "emerald", label: "Emerald", value: "#10b981" },
] as const;

export const DEFAULT_ACCENT = ACCENTS[0].value;

import { LEGACY_DARK_KEY, STORAGE_ACCENT, STORAGE_THEME } from "@/lib/theme-script";

interface PreferencesValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  accent: string;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: string) => void;
  toggleTheme: () => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_THEME);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    if (localStorage.getItem(LEGACY_DARK_KEY) === "true") return "dark";
  } catch {
    /* storage unavailable */
  }
  return "system";
}

function readStoredAccent(): string {
  try {
    const stored = localStorage.getItem(STORAGE_ACCENT);
    if (stored && /^#[0-9a-f]{6}$/i.test(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_ACCENT;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [accent, setAccentState] = useState<string>(DEFAULT_ACCENT);
  const [system, setSystem] = useState<ResolvedTheme>("light");

  // Hydrate from storage once on the client.
  useEffect(() => {
    setThemeState(readStoredTheme());
    setAccentState(readStoredAccent());
    setSystem(systemTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? system : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_THEME, next);
      localStorage.removeItem(LEGACY_DARK_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setAccent = useCallback((next: string) => {
    setAccentState(next);
    try {
      localStorage.setItem(STORAGE_ACCENT, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, accent, setTheme, setAccent, toggleTheme }),
    [theme, resolvedTheme, accent, setTheme, setAccent, toggleTheme]
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}
