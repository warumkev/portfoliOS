"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowUpRight, Eraser, Laptop, LifeBuoy, Mail, Moon, Sun, XCircle } from "lucide-react";
import { APPS, getApp, WINDOW_DEFAULTS } from "@/config/apps";
import { PROFILE } from "@/config/profile";
import { GitHubIcon, LinkedInIcon } from "@/lib/brand-icons";
import { useViewport } from "@/lib/hooks";
import { OSContext, type OSApi } from "@/lib/os-context";
import { usePreferences } from "@/lib/preferences";
import type { Project } from "@/lib/types";
import {
  createInitialState,
  windowReducer,
  type Rect,
  type WindowAction,
  type WindowManagerState,
} from "@/lib/windowManager";
import { AppIcon } from "@/components/os/AppIcon";
import { Wallpaper } from "@/components/os/Wallpaper";
import { CommandPalette, type PaletteItem } from "./CommandPalette";
import { Dock, DOCK_RESERVED } from "./Dock";
import { DrawingCanvas, type DrawingCanvasHandle } from "./DrawingCanvas";
import { MenuBar, MENUBAR_HEIGHT } from "./MenuBar";
import { Window, type ExitMode } from "./Window";

const WORKSPACE_MARGIN = 8;

function reducer(state: WindowManagerState, action: WindowAction): WindowManagerState {
  return windowReducer(state, action, WINDOW_DEFAULTS);
}

export default function DesktopView({ projects }: { projects: Project[] }) {
  const [state, dispatch] = useReducer(reducer, WINDOW_DEFAULTS, createInitialState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const viewport = useViewport();
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const exitModes = useRef<Record<string, ExitMode>>({});
  const { resolvedTheme, setTheme, toggleTheme } = usePreferences();

  const workspace = useMemo<Rect>(
    () => ({
      x: WORKSPACE_MARGIN,
      y: MENUBAR_HEIGHT + WORKSPACE_MARGIN,
      width: Math.max(320, viewport.width - WORKSPACE_MARGIN * 2),
      height: Math.max(320, viewport.height - MENUBAR_HEIGHT - WORKSPACE_MARGIN - DOCK_RESERVED),
    }),
    [viewport.width, viewport.height]
  );

  const openApp = useCallback(
    (id: string) => {
      if (!getApp(id)) return;
      dispatch({ type: "open", id, workspace });
    },
    [workspace]
  );

  const closeApp = useCallback((id: string) => {
    exitModes.current[id] = "close";
    dispatch({ type: "close", id });
  }, []);

  const minimizeApp = useCallback((id: string) => {
    exitModes.current[id] = "minimize";
    dispatch({ type: "minimize", id });
  }, []);

  const clearCanvas = useCallback(() => canvasRef.current?.clear(), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);

  // Boot: open the README once the desktop has settled.
  useEffect(() => {
    const timer = setTimeout(() => openApp("about"), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "clampAll", workspace });
  }, [workspace]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onDockClick = (id: string) => {
    const win = state.windows[id];
    if (!win.isOpen || win.isMinimized) openApp(id);
    else if (state.focusedId === id) minimizeApp(id);
    else dispatch({ type: "focus", id });
  };

  const api = useMemo<OSApi>(
    () => ({ platform: "desktop", projects, openApp, closeApp, clearCanvas, openPalette }),
    [projects, openApp, closeApp, clearCanvas, openPalette]
  );

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
    return [
      ...APPS.map<PaletteItem>((app) => ({
        id: `app:${app.id}`,
        title: app.title,
        subtitle: app.summary,
        keywords: app.keywords,
        group: "Apps",
        icon: <AppIcon app={app} size={22} />,
        run: () => openApp(app.id),
      })),
      ...projects
        .filter((p) => p.liveUrl || p.githubUrl)
        .map<PaletteItem>((p) => ({
          id: `project:${p.slug}`,
          title: p.title,
          subtitle: (p.liveUrl ?? p.githubUrl ?? "").replace(/^https?:\/\//, ""),
          keywords: p.tags,
          group: "Projects",
          icon: <ArrowUpRight size={16} />,
          run: () => open((p.liveUrl ?? p.githubUrl) as string),
        })),
      {
        id: "action:theme",
        title: resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        keywords: ["theme", "dark", "light", "appearance"],
        group: "Actions",
        icon: resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
        run: toggleTheme,
      },
      {
        id: "action:system-theme",
        title: "Follow system theme",
        keywords: ["theme", "auto", "system"],
        group: "Actions",
        icon: <Laptop size={16} />,
        run: () => setTheme("system"),
      },
      {
        id: "action:clear",
        title: "Clear drawing",
        subtitle: "Wipe the desktop whiteboard",
        keywords: ["canvas", "erase", "doodle"],
        group: "Actions",
        icon: <Eraser size={16} />,
        run: clearCanvas,
      },
      {
        id: "action:close-all",
        title: "Close all windows",
        keywords: ["windows", "quit"],
        group: "Actions",
        icon: <XCircle size={16} />,
        run: () => {
          for (const id of Object.keys(state.windows)) exitModes.current[id] = "close";
          dispatch({ type: "closeAll" });
        },
      },
      {
        id: "action:github",
        title: "GitHub profile",
        subtitle: PROFILE.links.github.replace(/^https?:\/\//, ""),
        keywords: ["code", "repos"],
        group: "Actions",
        icon: <GitHubIcon className="h-4 w-4" />,
        run: () => open(PROFILE.links.github),
      },
      {
        id: "action:linkedin",
        title: "LinkedIn",
        subtitle: PROFILE.links.linkedin.replace(/^https?:\/\//, ""),
        group: "Actions",
        icon: <LinkedInIcon className="h-4 w-4" />,
        run: () => open(PROFILE.links.linkedin),
      },
      {
        id: "action:email",
        title: "Send an e-mail",
        subtitle: PROFILE.links.email,
        keywords: ["mail", "contact"],
        group: "Actions",
        icon: <Mail size={16} />,
        run: () => {
          window.location.href = `mailto:${PROFILE.links.email}`;
        },
      },
      {
        id: "action:safe-mode",
        title: "Open safe mode",
        subtitle: "Plain HTML version of this site",
        keywords: ["accessibility", "fallback", "html"],
        group: "Actions",
        icon: <LifeBuoy size={16} />,
        run: () => {
          window.location.href = "/safe-mode.html";
        },
      },
    ];
  }, [projects, resolvedTheme, toggleTheme, setTheme, clearCanvas, openApp, state.windows]);

  const focusedApp = state.focusedId ? getApp(state.focusedId) : undefined;

  return (
    <OSContext.Provider value={api}>
      <main className="relative h-dvh w-screen overflow-hidden" aria-label="Desktop">
        <Wallpaper />
        <DrawingCanvas ref={canvasRef} />

        <div className="pointer-events-none absolute inset-0 z-10">
          <AnimatePresence custom={exitModes.current}>
            {Object.values(state.windows)
              .filter((win) => win.isOpen && !win.isMinimized)
              .map((win) => {
                const app = getApp(win.id);
                if (!app) return null;
                return (
                  <Window
                    key={win.id}
                    app={app}
                    win={win}
                    focused={state.focusedId === win.id}
                    workspace={workspace}
                    onFocus={() => dispatch({ type: "focus", id: win.id })}
                    onClose={() => closeApp(win.id)}
                    onMinimize={() => minimizeApp(win.id)}
                    onToggleMaximize={() => dispatch({ type: "toggleMaximize", id: win.id, workspace })}
                    onMove={(position) => dispatch({ type: "move", id: win.id, position, workspace })}
                    onResize={(size) => dispatch({ type: "resize", id: win.id, size, workspace })}
                  />
                );
              })}
          </AnimatePresence>
        </div>

        <MenuBar
          activeTitle={focusedApp?.title ?? null}
          onOpenPalette={openPalette}
          onOpenMusic={() => openApp("music")}
        />
        <Dock windows={state.windows} focusedId={state.focusedId} onClick={onDockClick} />
        <CommandPalette open={paletteOpen} items={paletteItems} onClose={() => setPaletteOpen(false)} />
      </main>
    </OSContext.Provider>
  );
}
