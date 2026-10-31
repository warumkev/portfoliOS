"use client";

import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { STATION, useMusic } from "@/lib/music";
import { useOS } from "@/lib/os-context";
import { cn } from "@/lib/utils";

export default function MusicApp() {
  const { state, isPlaying, volume, toggle, setVolume } = useMusic();
  const { platform } = useOS();

  return (
    <div className="app-scroll h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center px-6 py-8 text-center">
        <div
          className={cn(
            "relative flex h-44 w-44 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/80 via-accent to-accent/60 text-white shadow-xl transition-transform duration-500",
            isPlaying ? "scale-100" : "scale-95"
          )}
        >
          <Music size={64} strokeWidth={1.5} aria-hidden="true" />
          {isPlaying && (
            <span className="absolute bottom-4 right-4 flex h-5 items-end gap-0.5" aria-hidden="true">
              <span className="eq-bar h-full w-1 rounded-full bg-white/90" />
              <span className="eq-bar h-full w-1 rounded-full bg-white/90" />
              <span className="eq-bar h-full w-1 rounded-full bg-white/90" />
            </span>
          )}
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight">{STATION.title}</h1>
        <p className="text-sm text-muted">
          by{" "}
          <a
            href={STATION.artistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {STATION.artist}
          </a>
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Radio size={12} aria-hidden="true" />
          {state === "loading"
            ? "Connecting…"
            : state === "error"
              ? "Stream unavailable right now"
              : isPlaying
                ? "Live radio"
                : "Paused"}
        </p>

        <button
          type="button"
          onClick={toggle}
          disabled={state === "loading"}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        {platform === "desktop" && (
          <div className="mt-8 flex w-full items-center gap-3">
            <VolumeX size={18} className="text-muted" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[var(--accent)]"
            />
            <Volume2 size={18} className="text-muted" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
