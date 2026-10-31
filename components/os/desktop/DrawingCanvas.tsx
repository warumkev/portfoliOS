"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Eraser, Pen, Trash2, Undo2 } from "lucide-react";
import { usePreferences } from "@/lib/preferences";
import {
  beginStroke,
  drawSegment,
  extendStroke,
  PEN_COLORS,
  PEN_SIZES,
  renderStrokes,
  undoStroke,
  type Stroke,
} from "@/lib/strokes";
import { cn } from "@/lib/utils";

export interface DrawingCanvasHandle {
  clear: () => void;
  undo: () => void;
}

const AUTO = "auto";
const AUTO_LIGHT = PEN_COLORS[0];
const AUTO_DARK = PEN_COLORS[1];

/**
 * Transparent canvas above the wallpaper and below the windows. Strokes are
 * kept as data so the drawing survives resizes and theme changes.
 */
export const DrawingCanvas = forwardRef<DrawingCanvasHandle>(function DrawingCanvas(_, ref) {
  const { resolvedTheme } = usePreferences();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeRef = useRef<{ stroke: Stroke; pointerId: number } | null>(null);
  const [colorChoice, setColorChoice] = useState<string>(AUTO);
  const [size, setSize] = useState<number>(PEN_SIZES[1]);
  const [erase, setErase] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const color =
    colorChoice === AUTO ? (resolvedTheme === "dark" ? AUTO_DARK : AUTO_LIGHT) : colorChoice;
  const penRef = useRef({ color, size, erase });
  penRef.current = { color, size, erase };

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }, []);

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    renderStrokes(ctx, strokesRef.current, rect.width, rect.height);
  }, [getContext]);

  // Size the backing store to the element (and DPR), then repaint.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      repaint();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [repaint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0 || activeRef.current) return;
      canvas.setPointerCapture(ev.pointerId);
      const { x, y } = point(ev);
      const stroke = beginStroke(penRef.current, x, y);
      activeRef.current = { stroke, pointerId: ev.pointerId };
      const ctx = getContext();
      if (ctx) drawSegment(ctx, stroke);
      ev.preventDefault();
    };
    const onMove = (ev: PointerEvent) => {
      const active = activeRef.current;
      if (!active || active.pointerId !== ev.pointerId) return;
      const events = typeof ev.getCoalescedEvents === "function" ? ev.getCoalescedEvents() : [ev];
      const ctx = getContext();
      for (const e of events.length ? events : [ev]) {
        const { x, y } = point(e);
        if (extendStroke(active.stroke, x, y) && ctx) drawSegment(ctx, active.stroke);
      }
      ev.preventDefault();
    };
    const onUp = (ev: PointerEvent) => {
      const active = activeRef.current;
      if (!active || active.pointerId !== ev.pointerId) return;
      activeRef.current = null;
      strokesRef.current = [...strokesRef.current, active.stroke];
      setStrokeCount(strokesRef.current.length);
      try {
        canvas.releasePointerCapture(ev.pointerId);
      } catch {
        /* already released */
      }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [getContext]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    setStrokeCount(0);
    repaint();
  }, [repaint]);

  const undo = useCallback(() => {
    strokesRef.current = undoStroke(strokesRef.current);
    setStrokeCount(strokesRef.current.length);
    repaint();
  }, [repaint]);

  useImperativeHandle(ref, () => ({ clear, undo }), [clear, undo]);

  const tool = (active: boolean) =>
    cn(
      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
      active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-foreground/10"
    );

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full touch-none"
        style={{ cursor: erase ? "cell" : "crosshair" }}
        aria-label="Drawing layer. Click and drag to doodle on the desktop."
        role="img"
      />
      <div className="absolute left-3 top-1/2 z-[5] -translate-y-1/2">
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            <motion.button
              key="collapsed"
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={() => setCollapsed(false)}
              className="glass flex h-10 w-10 items-center justify-center rounded-xl text-foreground/80 shadow-md hover:text-foreground"
              aria-label="Show drawing tools"
              title="Drawing tools"
            >
              <Pen size={16} />
            </motion.button>
          ) : (
            <motion.div
              key="palette"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="glass flex flex-col items-center gap-1 rounded-2xl p-1.5 shadow-md"
              role="toolbar"
              aria-label="Drawing tools"
            >
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-6 w-8 items-center justify-center rounded-md text-muted hover:text-foreground"
                aria-label="Hide drawing tools"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="my-0.5 h-px w-6 bg-border" />
              {PEN_COLORS.map((swatch) => {
                const active = !erase && color === swatch;
                return (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      setColorChoice(swatch);
                      setErase(false);
                    }}
                    aria-label={`Pen colour ${swatch}`}
                    aria-pressed={active}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110",
                      active && "ring-2 ring-foreground ring-offset-2 ring-offset-surface"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/15"
                      style={{ backgroundColor: swatch }}
                    />
                  </button>
                );
              })}
              <div className="my-0.5 h-px w-6 bg-border" />
              {PEN_SIZES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSize(option);
                    setErase(false);
                  }}
                  aria-label={`Pen size ${option}`}
                  aria-pressed={!erase && size === option}
                  className={tool(!erase && size === option)}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{ width: option + 3, height: option + 3 }}
                  />
                </button>
              ))}
              <div className="my-0.5 h-px w-6 bg-border" />
              <button
                type="button"
                onClick={() => setErase((e) => !e)}
                aria-label="Eraser"
                aria-pressed={erase}
                className={tool(erase)}
              >
                <Eraser size={15} />
              </button>
              <button
                type="button"
                onClick={undo}
                disabled={strokeCount === 0}
                aria-label="Undo last stroke"
                className={cn(tool(false), "disabled:opacity-35")}
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={strokeCount === 0}
                aria-label="Clear drawing"
                className={cn(tool(false), "hover:text-destructive disabled:opacity-35")}
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});
