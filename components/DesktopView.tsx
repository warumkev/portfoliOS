"use client";
import React, { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X, CornerDownRight, Pen, Trash2, Circle } from "lucide-react";
import { APP_CONFIG, AppConfig } from "@/config/apps";

// (Splash/login removed) The desktop loads immediately.

// --- Type Definitions ---
interface WindowPosition {
  x: number;
  y: number;
}
interface WindowSize {
  width: number;
  height: number;
}

interface WindowState {
  id: string;
  isOpen: boolean;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
}

// --- Window Component ---
interface WindowProps {
  winState: WindowState;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onDrag: (id: string, newPosition: WindowPosition) => void;
  onResize: (id: string, newSize: WindowSize) => void;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
}

const Window: React.FC<WindowProps> = ({
  winState,
  onClose,
  onFocus,
  onDrag,
  onResize,
  constraintsRef,
}) => {
  const config = APP_CONFIG[winState.id];
  const resizeRef = React.useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const handleResize = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onFocus(winState.id);
      const resizeStart = {
        x: event.clientX,
        y: event.clientY,
        w: winState.size.width,
        h: winState.size.height,
      };
      const minSize = config?.minSize || { width: 320, height: 240 };

      const onPointerMove = (moveEvent: PointerEvent) => {
        const dw = moveEvent.clientX - resizeStart.x;
        const dh = moveEvent.clientY - resizeStart.y;
        onResize(winState.id, {
          width: Math.max(minSize.width, resizeStart.w + dw),
          height: Math.max(minSize.height, resizeStart.h + dh),
        });
      };
      const onPointerUp = () => {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      };
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    },
    [winState.id, winState.size, onFocus, onResize, config]
  );

  // Accessibility: Focus management for dialog
  useEffect(() => {
    if (winState.isOpen && windowRef.current) {
      windowRef.current.focus();
    }
  }, [winState.isOpen]);

  if (!config) return null;

  return (
    <motion.div
      ref={windowRef}
      key={winState.id}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragStart={() => onFocus(winState.id)}
      onDrag={(e, info) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const width = winState.size.width;
        const height = winState.size.height;
        let x = winState.position.x + info.delta.x;
        let y = winState.position.y + info.delta.y;
        x = Math.max(0, Math.min(x, viewportWidth - width));
        y = Math.max(0, Math.min(y, viewportHeight - height));
        onDrag(winState.id, { x, y });
      }}
      className="absolute backdrop-blur-xl border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden"
      style={{
        x: winState.position.x,
        y: winState.position.y,
        width: winState.size.width,
        height: winState.size.height,
        zIndex: winState.zIndex,
      }}
      onPointerDown={() => onFocus(winState.id)}
      aria-labelledby={`window-title-${winState.id}`}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        className={`flex items-center justify-between h-10 px-3 rounded-t-lg border-border cursor-grab flex-shrink-0`}
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{config.icon}</span>
          <span
            id={`window-title-${winState.id}`}
            className="text-primary font-medium"
          >
            {config.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Close button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose(winState.id);
            }}
            className="p-1 rounded-full hover:bg-destructive text-primary hover:text-secondary transition-colors duration-150"
            aria-label={`Fenster "${config.title}" schließen`}
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>
      {/* Inner padded content so every window has spacing on all sides */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 md:p-6">
        <div className="flex-grow overflow-y-auto min-h-0">
          {config.content}
        </div>
        <div
          ref={resizeRef}
          className="absolute bottom-4 right-4 w-4 h-4 cursor-se-resize text-muted z-10"
          onPointerDown={handleResize}
          style={{ display: "block" }}
          role="slider"
          aria-label="Fenstergröße ändern"
          aria-valuenow={winState.size.width}
          tabIndex={0}
        >
          <CornerDownRight size={16} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Dock Icon Component ---
const DockIcon: React.FC<{
  id: string;
  config: AppConfig;
  onClick: (id: string) => void;
  isActive: boolean;
}> = ({ id, config, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center gap-1 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-10 px-2 py-1 text-xs bg-background text-primary rounded-md pointer-events-none whitespace-nowrap"
          >
            {config.title}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1, y: -8 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClick(id)}
        className="backdrop-blur-lg p-3 bg-background rounded-xl border border-border transition-colors"
        aria-label={`Öffne ${config.title}`}
      >
        <span className="text-primary">{config.icon}</span>
      </motion.button>
      <motion.div
        animate={{ scale: isActive ? 1 : 0 }}
        className="w-1.5 h-1.5 rounded-full bg-primary"
        aria-hidden="true"
      />
    </div>
  );
};

const generateInitialWindows = (): Record<string, WindowState> => {
  const initialWindows: Record<string, WindowState> = {};
  Object.entries(APP_CONFIG).forEach(([id, config], index) => {
    initialWindows[id] = {
      id,
      isOpen: id === "about",
      position: { x: 150 + index * 50, y: 100 + index * 40 },
      zIndex: id === "about" ? 11 : 10,
      size: config.defaultSize,
    };
  });
  return initialWindows;
};

// --- Main Desktop Component ---
export default function DesktopView() {
  const [windows, setWindows] = useState<Record<string, WindowState>>(
    generateInitialWindows
  );
  const [highestZIndex, setHighestZIndex] = useState(11);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingState = useRef<{
    drawing: boolean;
    lastX: number;
    lastY: number;
    pointerId: number | null;
  }>({
    drawing: false,
    lastX: 0,
    lastY: 0,
    pointerId: null,
  });
  // pen settings (refs used inside canvas handlers for latest values)
  const penColorRef = useRef<string>("#a9a9a9");
  const penSizeRef = useRef<number>(2);
  const [penColor, setPenColor] = useState<string>("#a9a9a9");
  const [penSize, setPenSize] = useState<number>(2);

  useEffect(() => {
    // Prevent scrolling on desktop view
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Setup background scribble canvas (black pen on white)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      // Set background color based on theme
      const isDarkMode = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDarkMode ? "#000000" : "#ffffff"; // Black for dark mode, white for light mode
      ctx.fillRect(0, 0, w, h);

      // Set default drawing style
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = penSizeRef.current;
      ctx.strokeStyle = penColorRef.current;
    };

    resize();
    window.addEventListener("resize", resize);

    const getPos = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };

    const onPointerDown = (ev: PointerEvent) => {
      // Only left/mouse or touch/pen
      if (ev.button && ev.button !== 0) return;
      canvas.setPointerCapture?.(ev.pointerId);
      drawingState.current.drawing = true;
      drawingState.current.pointerId = ev.pointerId;
      const pos = getPos(ev);
      drawingState.current.lastX = pos.x;
      drawingState.current.lastY = pos.y;
      // apply current pen settings
      ctx.lineWidth = penSizeRef.current;
      ctx.strokeStyle = penColorRef.current;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      // initialize previous point for smoothing
      // store last drawn point in case move events are sparse
      drawingState.current.lastX = pos.x;
      drawingState.current.lastY = pos.y;
      ev.preventDefault();
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (
        !drawingState.current.drawing ||
        drawingState.current.pointerId !== ev.pointerId
      )
        return;
      const pos = getPos(ev);
      // ensure current pen settings in case they changed mid-draw
      ctx.lineWidth = penSizeRef.current;
      ctx.strokeStyle = penColorRef.current;
      // midpoint smoothing using quadratic curve
      const lastX = drawingState.current.lastX;
      const lastY = drawingState.current.lastY;
      const midX = (lastX + pos.x) / 2;
      const midY = (lastY + pos.y) / 2;
      ctx.quadraticCurveTo(lastX, lastY, midX, midY);
      ctx.stroke();
      // update last point to current for next segment
      drawingState.current.lastX = pos.x;
      drawingState.current.lastY = pos.y;
      ev.preventDefault();
    };

    const endDrawing = (ev: PointerEvent) => {
      if (
        !drawingState.current.drawing ||
        drawingState.current.pointerId !== ev.pointerId
      )
        return;
      drawingState.current.drawing = false;
      drawingState.current.pointerId = null;
      // finalize path
      try {
        ctx.stroke();
        ctx.closePath();
      } catch (error) {
        console.warn("Error finalizing drawing path:", error);
      }
      try {
        canvas.releasePointerCapture?.(ev.pointerId);
      } catch (error) {
        console.warn("Error releasing pointer capture:", error);
      }
      ev.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrawing);
    window.addEventListener("pointercancel", endDrawing);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      resize();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrawing);
      window.removeEventListener("pointercancel", endDrawing);
      observer.disconnect();
    };
  }, []);

  const openWindow = (id: string) => {
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;
      if (win.isOpen) {
        // If already open, close it
        return { ...prev, [id]: { ...win, isOpen: false } };
      } else {
        // If closed, open and bring to front
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);
        return { ...prev, [id]: { ...win, isOpen: true, zIndex: newZIndex } };
      }
    });
  };

  const closeWindow = (id: string) =>
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));

  const focusWindow = (id: string) => {
    if (windows[id].zIndex < highestZIndex) {
      const newZIndex = highestZIndex + 1;
      setHighestZIndex(newZIndex);
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], zIndex: newZIndex },
      }));
    }
  };

  const handleDrag = (id: string, newPosition: WindowPosition) => {
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const clampedX = Math.max(
        0,
        Math.min(newPosition.x, viewportWidth - win.size.width)
      );
      const clampedY = Math.max(
        0,
        Math.min(newPosition.y, viewportHeight - win.size.height)
      );
      return {
        ...prev,
        [id]: { ...win, position: { x: clampedX, y: clampedY } },
      };
    });
  };

  const resizeWindow = (id: string, newSize: WindowSize) =>
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;
      const config = APP_CONFIG[id];
      const minSize = config?.minSize || { width: 320, height: 240 };
      // Clamp size so window stays in viewport and respects minSize
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = Math.max(minSize.width, viewportWidth - win.position.x);
      const maxHeight = Math.max(
        minSize.height,
        viewportHeight - win.position.y
      );
      const clampedWidth = Math.max(
        minSize.width,
        Math.min(newSize.width, maxWidth)
      );
      const clampedHeight = Math.max(
        minSize.height,
        Math.min(newSize.height, maxHeight)
      );
      return {
        ...prev,
        [id]: { ...win, size: { width: clampedWidth, height: clampedHeight } },
      };
    });

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.resetTransform?.();
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    // Set background color based on theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    ctx.fillStyle = isDarkMode ? "#000000" : "#ffffff"; // Black for dark mode, white for light mode
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  return (
    <main
      ref={constraintsRef}
      className="h-[100dvh] w-screen overflow-hidden text-primary font-sans relative select-none"
    >
      {/* Background scribble canvas (below windows) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 touch-none"
        aria-hidden="true"
      />

      {/* Floating pen toolbar (draggable, single row, less transparent) */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.12}
        dragMomentum={false}
        whileDrag={{ scale: 0.995 }}
        className="absolute right-4 top-8 z-40"
      >
        <div className="flex items-center gap-2 p-2 bg-background backdrop-blur-sm border border-border rounded-lg shadow-md">
          {/* Color swatch button */}
          <button
            className="w-9 h-9 rounded-md flex items-center justify-center border border-border relative overflow-hidden"
            aria-label="Pick pen color"
            title="Pen color"
            style={{ backgroundColor: penColor }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Pen size={14} className="text-secondary" />
            <input
              type="color"
              value={penColor}
              onChange={(e) => {
                setPenColor(e.target.value);
                penColorRef.current = e.target.value;
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Pen color"
            />
          </button>

          {/* Size button: cycles through presets */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const presets = [4, 8, 12, 20, 40];
              const idx = presets.indexOf(penSizeRef.current);
              const next = presets[(idx + 1) % presets.length];
              setPenSize(next);
              penSizeRef.current = next;
            }}
            className="w-9 h-9 text-primary rounded-md flex items-center justify-center border border-border"
            aria-label="Cycle pen size"
            title={`Pen size: ${penSize}px`}
          >
            <Circle
              size={12}
              style={{ width: penSize, height: penSize, color: penColor }}
            />
          </button>

          {/* Clear button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearCanvas();
            }}
            className="w-9 h-9 rounded-md flex items-center justify-center border border-border bg-destructive/50 text-primary"
            aria-label="Clear canvas"
            title="Clear canvas"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
      {/* Windows */}
      {Object.values(windows).map((winState) => {
        if (winState.isOpen) {
          return (
            <Window
              key={winState.id}
              winState={winState}
              onClose={closeWindow}
              onFocus={focusWindow}
              onDrag={handleDrag}
              onResize={resizeWindow}
              constraintsRef={constraintsRef}
            />
          );
        }
        return null;
      })}
      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.5,
          }}
          className="flex bg-background items-end gap-3 p-3 backdrop-blur-lg border border-border rounded-2xl"
        >
          {Object.entries(APP_CONFIG).map(([id, config]) => (
            <DockIcon
              key={id}
              id={id}
              config={config}
              onClick={openWindow}
              isActive={windows[id]?.isOpen ?? false}
            />
          ))}
        </motion.div>
      </div>
    </main>
  );
}
