"use client";

import { Check, Laptop, Moon, Sun, Eraser, ExternalLink } from "lucide-react";
import { PROFILE } from "@/config/profile";
import { useClock, useViewport, formatTime } from "@/lib/hooks";
import { useOS } from "@/lib/os-context";
import { ACCENTS, usePreferences } from "@/lib/preferences";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Laptop },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 first:mt-0">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <div className="divide-y divide-border rounded-xl border border-border bg-surface-2/60">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <span className="text-foreground/85">{label}</span>
      <span className="truncate text-right text-muted">{children}</span>
    </div>
  );
}

export default function SettingsApp() {
  const { theme, resolvedTheme, accent, setTheme, setAccent } = usePreferences();
  const { platform, clearCanvas } = useOS();
  const viewport = useViewport();
  const now = useClock(true);
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio;
  const language = typeof navigator === "undefined" ? "-" : navigator.language;

  return (
    <div className="app-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-xl px-6 py-7 sm:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted">Make it yours. Preferences stay in this browser.</p>
        </header>

        <Section title="Appearance">
          <div className="px-4 py-3">
            <div className="mb-2 text-sm text-foreground/85">Theme</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface p-1">
              {THEMES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  aria-pressed={theme === id}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm transition-colors",
                    theme === id
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Currently showing the {resolvedTheme} theme.
            </p>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2 text-sm text-foreground/85">Accent</div>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((option) => {
                const active = option.value === accent;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAccent(option.value)}
                    aria-label={option.label}
                    aria-pressed={active}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110",
                      active && "ring-2 ring-foreground ring-offset-2 ring-offset-surface-2"
                    )}
                    style={{ backgroundColor: option.value }}
                  >
                    {active && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {platform === "desktop" && (
          <Section title="Desktop">
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <div className="text-foreground/85">Drawing layer</div>
                <div className="text-xs text-muted">The desktop is a whiteboard. Draw anywhere.</div>
              </div>
              <button type="button" onClick={clearCanvas} className="btn-secondary h-8 shrink-0 px-3 text-xs">
                <Eraser size={14} aria-hidden="true" />
                Clear
              </button>
            </div>
          </Section>
        )}

        <Section title="About this OS">
          <Row label="Name">{PROFILE.os.name}</Row>
          <Row label="Version">
            {PROFILE.os.version} (build {PROFILE.os.build})
          </Row>
          <Row label="Status">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Online
            </span>
          </Row>
          <Row label="Author">{PROFILE.name}</Row>
        </Section>

        <Section title="System">
          <Row label="Time">{formatTime(now, true)}</Row>
          <Row label="Viewport">
            {viewport.width} × {viewport.height} @ {dpr}x
          </Row>
          <Row label="Language">{language}</Row>
          <Row label="Platform">{platform}</Row>
        </Section>

        <p className="mt-6 text-xs text-muted">
          Something broken?{" "}
          <a href="/safe-mode.html" className="inline-flex items-center gap-0.5 text-foreground underline-offset-2 hover:underline">
            Safe mode
            <ExternalLink size={11} aria-hidden="true" />
          </a>{" "}
          shows everything as plain HTML.
        </p>
      </div>
    </div>
  );
}
