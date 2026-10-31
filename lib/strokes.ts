/**
 * Stroke data for the desktop drawing layer. Keeping strokes as data (instead of
 * only pixels) lets the canvas re-render after resizes and theme changes and
 * makes undo trivial.
 */
export interface Stroke {
  color: string;
  size: number;
  erase: boolean;
  /** Flat list of x,y pairs in CSS pixels. */
  points: number[];
}

export interface PenSettings {
  color: string;
  size: number;
  erase: boolean;
}

export const PEN_SIZES = [3, 6, 12] as const;

export const PEN_COLORS = [
  "#1f1f1f",
  "#f5f5f5",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
] as const;

export const ERASER_SIZE = 28;

export function beginStroke(pen: PenSettings, x: number, y: number): Stroke {
  return { color: pen.color, size: pen.erase ? ERASER_SIZE : pen.size, erase: pen.erase, points: [x, y] };
}

/** Appends a point, skipping micro-moves that only add noise. */
export function extendStroke(stroke: Stroke, x: number, y: number): boolean {
  const n = stroke.points.length;
  const lastX = stroke.points[n - 2];
  const lastY = stroke.points[n - 1];
  if (Math.abs(lastX - x) < 0.5 && Math.abs(lastY - y) < 0.5) return false;
  stroke.points.push(x, y);
  return true;
}

export function undoStroke(strokes: Stroke[]): Stroke[] {
  return strokes.length ? strokes.slice(0, -1) : strokes;
}

interface Ctx2D {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  stroke(): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  lineWidth: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  globalCompositeOperation: GlobalCompositeOperation;
}

/** Draws a complete stroke with midpoint smoothing. */
export function drawStroke(ctx: Ctx2D, stroke: Stroke): void {
  const p = stroke.points;
  if (p.length < 2) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.size;
  ctx.strokeStyle = stroke.color;
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  if (p.length === 2) {
    ctx.lineTo(p[0], p[1]);
  } else {
    for (let i = 2; i < p.length; i += 2) {
      const prevX = p[i - 2];
      const prevY = p[i - 1];
      const midX = (prevX + p[i]) / 2;
      const midY = (prevY + p[i + 1]) / 2;
      ctx.quadraticCurveTo(prevX, prevY, midX, midY);
    }
    ctx.lineTo(p[p.length - 2], p[p.length - 1]);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

/** Draws only the newest segment of a stroke (used while the pointer moves). */
export function drawSegment(ctx: Ctx2D, stroke: Stroke): void {
  const p = stroke.points;
  const n = p.length;
  if (n < 4) {
    if (n === 2) drawStroke(ctx, stroke);
    return;
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.size;
  ctx.strokeStyle = stroke.color;
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.beginPath();
  if (n >= 6) {
    const startX = (p[n - 6] + p[n - 4]) / 2;
    const startY = (p[n - 5] + p[n - 3]) / 2;
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(p[n - 4], p[n - 3], (p[n - 4] + p[n - 2]) / 2, (p[n - 3] + p[n - 1]) / 2);
  } else {
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo((p[0] + p[2]) / 2, (p[1] + p[3]) / 2);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

export function renderStrokes(ctx: Ctx2D, strokes: Stroke[], width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
  for (const stroke of strokes) drawStroke(ctx, stroke);
}
