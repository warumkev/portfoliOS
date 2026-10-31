"use client";

import { BatteryFull, Moon, Sun, Wifi } from "lucide-react";
import { formatTime, useClock } from "@/lib/hooks";
import { usePreferences } from "@/lib/preferences";

export function StatusBar() {
  const now = useClock();
  const { resolvedTheme, toggleTheme } = usePreferences();
  return (
    <div
      className="absolute inset-x-0 top-0 z-[60] flex items-center justify-between px-6 text-sm font-semibold select-none"
      style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(2.75rem + env(safe-area-inset-top))" }}
    >
      <time dateTime={now.toISOString()} className="tabular-nums">
        {formatTime(now)}
      </time>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/80 active:bg-foreground/10"
        >
          {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Wifi size={16} aria-hidden="true" />
        <BatteryFull size={18} aria-hidden="true" />
      </div>
    </div>
  );
}
