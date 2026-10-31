"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { getApp } from "@/config/apps";
import { OSContext, type OSApi } from "@/lib/os-context";
import type { Project } from "@/lib/types";
import { Wallpaper } from "@/components/os/Wallpaper";
import { AppSheet } from "./AppSheet";
import { HomeScreen, type OpenOrigin } from "./HomeScreen";
import { LockScreen } from "./LockScreen";
import { StatusBar } from "./StatusBar";

export default function MobileView({ projects }: { projects: Project[] }) {
  const [locked, setLocked] = useState(true);
  const [open, setOpen] = useState<{ id: string; origin: OpenOrigin } | null>(null);

  // No rubber-banding or pull-to-refresh behind the OS surface.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
    };
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    return () => {
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.overflow = prev.bodyOverflow;
    };
  }, []);

  const openApp = useCallback((id: string) => {
    if (!getApp(id)) return;
    setOpen({
      id,
      origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }, []);

  const closeApp = useCallback((id: string) => {
    setOpen((current) => (current?.id === id ? null : current));
  }, []);

  const api = useMemo<OSApi>(
    () => ({ platform: "mobile", projects, openApp, closeApp }),
    [projects, openApp, closeApp]
  );

  const app = open ? getApp(open.id) : undefined;

  return (
    <OSContext.Provider value={api}>
      <div className="relative h-dvh w-full overflow-hidden" aria-label="Home">
        <Wallpaper />
        <StatusBar />
        <HomeScreen onOpen={(id, origin) => setOpen({ id, origin })} />
        <AnimatePresence>
          {open && app && (
            <AppSheet key={open.id} app={app} origin={open.origin} onClose={() => setOpen(null)} />
          )}
        </AnimatePresence>
        <AnimatePresence>{locked && <LockScreen onUnlock={() => setLocked(false)} />}</AnimatePresence>
      </div>
    </OSContext.Provider>
  );
}
