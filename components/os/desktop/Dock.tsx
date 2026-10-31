"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { APPS, type AppDefinition } from "@/config/apps";
import type { WindowState } from "@/lib/windowManager";
import { AppIcon } from "@/components/os/AppIcon";
import { cn } from "@/lib/utils";

export const DOCK_RESERVED = 100;

interface DockProps {
  windows: Record<string, WindowState>;
  focusedId: string | null;
  onClick: (id: string) => void;
}

function DockItem({
  app,
  running,
  minimized,
  onClick,
}: {
  app: AppDefinition;
  running: boolean;
  minimized: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="glass pointer-events-none absolute -top-11 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-md"
            role="tooltip"
          >
            {app.title}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.16, y: -7 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        aria-label={running ? `${app.title} (running)` : `Open ${app.title}`}
        className={cn("rounded-[14px] focus-visible:outline-accent", minimized && "opacity-70")}
      >
        <AppIcon app={app} size={46} />
      </motion.button>
      <span
        className={cn(
          "mt-1 h-1 w-1 rounded-full bg-foreground/70 transition-opacity",
          running ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />
    </div>
  );
}

export function Dock({ windows, onClick }: DockProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 flex justify-center">
      <motion.nav
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.25 }}
        className="glass pointer-events-auto flex items-end gap-1.5 rounded-[22px] px-2.5 pb-1 pt-2 shadow-lg"
        aria-label="Dock"
      >
        {APPS.map((app) => (
          <DockItem
            key={app.id}
            app={app}
            running={windows[app.id]?.isOpen ?? false}
            minimized={windows[app.id]?.isMinimized ?? false}
            onClick={() => onClick(app.id)}
          />
        ))}
      </motion.nav>
    </div>
  );
}
