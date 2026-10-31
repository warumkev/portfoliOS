"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import type { AppDefinition } from "@/config/apps";
import {
  clampPosition,
  type Point,
  type Rect,
  type Size,
  type WindowState,
} from "@/lib/windowManager";
import { cn } from "@/lib/utils";

export type ExitMode = "close" | "minimize";

interface WindowProps {
  app: AppDefinition;
  win: WindowState;
  focused: boolean;
  workspace: Rect;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (position: Point) => void;
  onResize: (size: Size) => void;
}

const TITLE_HEIGHT = 38;
const RESIZE_HANDLE = 16;

function makeVariants(id: string) {
  return {
    hidden: { opacity: 0, scale: 0.96, y: 14 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: (modes: Record<string, ExitMode> | undefined) =>
      modes?.[id] === "minimize"
        ? { opacity: 0, scale: 0.55, y: 320, transition: { duration: 0.22, ease: "easeIn" as const } }
        : { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.14 } },
  };
}

export function Window({
  app,
  win,
  focused,
  workspace,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  onResize,
}: WindowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState<"drag" | "resize" | null>(null);
  const Icon = app.icon;
  const Content = app.component;
  const variants = useMemo(() => makeVariants(app.id), [app.id]);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    onFocus();
    if (win.isMaximized) return;
    const bar = event.currentTarget;
    const start = { x: event.clientX, y: event.clientY };
    const origin = win.position;
    let last = origin;
    bar.setPointerCapture(event.pointerId);
    setInteracting("drag");
    const move = (ev: PointerEvent) => {
      last = clampPosition(
        { x: origin.x + ev.clientX - start.x, y: origin.y + ev.clientY - start.y },
        win.size,
        workspace
      );
      const el = rootRef.current;
      if (el) {
        el.style.left = `${last.x}px`;
        el.style.top = `${last.y}px`;
      }
    };
    const stop = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", stop);
      bar.removeEventListener("pointercancel", stop);
      setInteracting(null);
      onMove(last);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", stop);
    bar.addEventListener("pointercancel", stop);
  };

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || win.isMaximized) return;
    event.stopPropagation();
    onFocus();
    const handle = event.currentTarget;
    const start = { x: event.clientX, y: event.clientY };
    const origin = win.size;
    const maxWidth = workspace.x + workspace.width - win.position.x;
    const maxHeight = workspace.y + workspace.height - win.position.y;
    let last = origin;
    handle.setPointerCapture(event.pointerId);
    setInteracting("resize");
    const move = (ev: PointerEvent) => {
      last = {
        width: Math.round(
          Math.min(maxWidth, Math.max(app.window.minSize.width, origin.width + ev.clientX - start.x))
        ),
        height: Math.round(
          Math.min(maxHeight, Math.max(app.window.minSize.height, origin.height + ev.clientY - start.y))
        ),
      };
      const el = rootRef.current;
      if (el) {
        el.style.width = `${last.width}px`;
        el.style.height = `${last.height}px`;
      }
    };
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      setInteracting(null);
      onResize(last);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  };

  const light = (color: string) =>
    cn(
      "group/light flex h-3 w-3 items-center justify-center rounded-full text-black/60 transition-colors",
      focused ? color : "bg-foreground/20"
    );

  return (
    <motion.div
      ref={rootRef}
      layout={false}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.8 }}
      onPointerDown={onFocus}
      role="dialog"
      aria-label={app.title}
      data-focused={focused}
      className={cn(
        "window-surface pointer-events-auto absolute flex flex-col overflow-hidden",
        win.isMaximized ? "rounded-xl" : "rounded-[var(--radius-window)]",
        focused ? "shadow-[var(--shadow-window-active)]" : "shadow-[var(--shadow-window)]",
        interacting && "select-none"
      )}
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
        transition: interacting
          ? "none"
          : "left .24s cubic-bezier(.2,.8,.2,1), top .24s cubic-bezier(.2,.8,.2,1), width .24s cubic-bezier(.2,.8,.2,1), height .24s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <div
        onPointerDown={startDrag}
        onDoubleClick={onToggleMaximize}
        className={cn(
          "window-title relative flex shrink-0 items-center border-b border-border px-3",
          interacting === "drag" ? "cursor-grabbing" : win.isMaximized ? "cursor-default" : "cursor-grab"
        )}
        style={{ height: TITLE_HEIGHT }}
      >
        <div className="group flex items-center gap-2" onDoubleClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${app.title}`}
            className={light("bg-[#ff5f57] hover:bg-[#ff5f57]")}
          >
            <X size={8} strokeWidth={3} className="opacity-0 group-hover:opacity-100" />
          </button>
          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${app.title}`}
            className={light("bg-[#febc2e] hover:bg-[#febc2e]")}
          >
            <Minus size={8} strokeWidth={3} className="opacity-0 group-hover:opacity-100" />
          </button>
          <button
            type="button"
            onClick={onToggleMaximize}
            aria-label={win.isMaximized ? `Restore ${app.title}` : `Maximize ${app.title}`}
            className={light("bg-[#28c840] hover:bg-[#28c840]")}
          >
            <Plus size={8} strokeWidth={3} className="opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 flex items-center justify-center gap-1.5 text-[13px] font-medium",
            focused ? "text-foreground" : "text-muted"
          )}
        >
          <Icon size={14} aria-hidden="true" />
          <span className="truncate">{app.title}</span>
        </div>
      </div>

      <div className={cn("window-body relative min-h-0 flex-1", interacting && "pointer-events-none")}>
        <Content />
      </div>

      {!win.isMaximized && (
        <div
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 z-10 cursor-nwse-resize"
          style={{ width: RESIZE_HANDLE, height: RESIZE_HANDLE }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" className="h-full w-full text-muted/60" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M14 8 8 14M14 12l-2 2" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
