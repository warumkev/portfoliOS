"use client";

import { APPS, type AppDefinition } from "@/config/apps";
import { formatDate, formatTime, useClock } from "@/lib/hooks";
import { AppIcon } from "@/components/os/AppIcon";

export interface OpenOrigin {
  x: number;
  y: number;
}

interface HomeScreenProps {
  onOpen: (id: string, origin: OpenOrigin) => void;
}

function HomeIcon({
  app,
  size,
  label,
  onOpen,
}: {
  app: AppDefinition;
  size: number;
  label: boolean;
  onOpen: HomeScreenProps["onOpen"];
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onOpen(app.id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
      aria-label={`Open ${app.title}`}
    >
      <AppIcon app={app} size={size} />
      {label && <span className="text-[11px] font-medium text-foreground/90">{app.title}</span>}
    </button>
  );
}

export function HomeScreen({ onOpen }: HomeScreenProps) {
  const now = useClock();
  const dockApps = APPS.filter((app) => app.mobileDock);
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col px-6"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
      }}
    >
      <div className="mt-2 text-center select-none">
        <time
          dateTime={now.toISOString()}
          className="block text-[64px] font-light leading-none tracking-tighter tabular-nums"
        >
          {formatTime(now)}
        </time>
        <p className="mt-2 text-sm font-medium text-foreground/70">{formatDate(now, "long")}</p>
      </div>

      <div className="mt-10 grid grid-cols-4 gap-x-3 gap-y-6">
        {APPS.map((app) => (
          <HomeIcon key={app.id} app={app} size={60} label onOpen={onOpen} />
        ))}
      </div>

      <nav
        aria-label="Dock"
        className="glass mt-auto flex items-center justify-around rounded-[30px] px-3 py-3"
      >
        {dockApps.map((app) => (
          <HomeIcon key={app.id} app={app} size={56} label={false} onOpen={onOpen} />
        ))}
      </nav>
    </div>
  );
}
