"use client";

import { Moon, Search, Sun } from "lucide-react";
import { formatDate, formatTime, useClock } from "@/lib/hooks";
import { STATION, useMusic } from "@/lib/music";
import { usePreferences } from "@/lib/preferences";
import { PROFILE } from "@/config/profile";

export const MENUBAR_HEIGHT = 28;

interface MenuBarProps {
  activeTitle: string | null;
  onOpenPalette: () => void;
  onOpenMusic: () => void;
}

export function MenuBar({ activeTitle, onOpenPalette, onOpenMusic }: MenuBarProps) {
  const now = useClock();
  const { resolvedTheme, toggleTheme } = usePreferences();
  const { isPlaying } = useMusic();

  return (
    <header
      className="glass absolute inset-x-0 top-0 z-40 flex items-center justify-between rounded-none border-x-0 border-t-0 px-3 text-[13px] select-none"
      style={{ height: MENUBAR_HEIGHT }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-semibold tracking-tight">{PROFILE.os.name}</span>
        {activeTitle && <span className="truncate font-medium text-foreground/80">{activeTitle}</span>}
      </div>
      <div className="flex items-center gap-1">
        {isPlaying && (
          <button
            type="button"
            onClick={onOpenMusic}
            className="mr-1 flex h-6 items-center gap-1.5 rounded-md px-1.5 text-muted hover:bg-foreground/8 hover:text-foreground"
            aria-label={`Now playing: ${STATION.title}. Open Music`}
          >
            <span className="flex h-3 items-end gap-px" aria-hidden="true">
              <span className="eq-bar h-full w-0.5 rounded-full bg-accent" />
              <span className="eq-bar h-full w-0.5 rounded-full bg-accent" />
              <span className="eq-bar h-full w-0.5 rounded-full bg-accent" />
            </span>
            <span className="hidden sm:inline">{STATION.title}</span>
          </button>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/80 hover:bg-foreground/8"
          aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex h-6 items-center gap-1.5 rounded-md px-1.5 text-foreground/80 hover:bg-foreground/8"
          aria-label="Open command palette"
          title="Search (⌘K)"
        >
          <Search size={14} />
          <kbd className="hidden rounded border border-border bg-surface-2 px-1 font-sans text-[10px] text-muted sm:inline">
            ⌘K
          </kbd>
        </button>
        <time dateTime={now.toISOString()} className="ml-1 tabular-nums text-foreground/90">
          <span className="hidden md:inline">{formatDate(now)} </span>
          {formatTime(now)}
        </time>
      </div>
    </header>
  );
}
