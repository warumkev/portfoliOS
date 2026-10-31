import { describe, expect, it } from "vitest";
import { beginStroke, drawStroke, extendStroke, undoStroke, ERASER_SIZE } from "../strokes";

describe("strokes", () => {
  it("begins a stroke with pen settings", () => {
    const s = beginStroke({ color: "#f00", size: 6, erase: false }, 1, 2);
    expect(s).toEqual({ color: "#f00", size: 6, erase: false, points: [1, 2] });
  });

  it("uses the eraser width when erasing", () => {
    const s = beginStroke({ color: "#f00", size: 6, erase: true }, 0, 0);
    expect(s.size).toBe(ERASER_SIZE);
    expect(s.erase).toBe(true);
  });

  it("drops micro-moves but keeps real ones", () => {
    const s = beginStroke({ color: "#000", size: 3, erase: false }, 10, 10);
    expect(extendStroke(s, 10.2, 10.1)).toBe(false);
    expect(extendStroke(s, 14, 10)).toBe(true);
    expect(s.points).toEqual([10, 10, 14, 10]);
  });

  it("undo removes only the last stroke", () => {
    const a = beginStroke({ color: "#000", size: 3, erase: false }, 0, 0);
    const b = beginStroke({ color: "#000", size: 3, erase: false }, 1, 1);
    expect(undoStroke([a, b])).toEqual([a]);
    expect(undoStroke([])).toEqual([]);
  });

  it("draws with destination-out for erase strokes and resets afterwards", () => {
    const calls: string[] = [];
    const ctx = {
      lineWidth: 0,
      strokeStyle: "",
      lineCap: "butt" as CanvasLineCap,
      lineJoin: "miter" as CanvasLineJoin,
      globalCompositeOperation: "source-over" as GlobalCompositeOperation,
      beginPath: () => calls.push("begin"),
      moveTo: () => calls.push("move"),
      lineTo: () => calls.push("line"),
      quadraticCurveTo: () => calls.push("quad"),
      stroke: () => calls.push(`stroke:${ctx.globalCompositeOperation}`),
      clearRect: () => calls.push("clear"),
    };
    const s = beginStroke({ color: "#000", size: 3, erase: true }, 0, 0);
    extendStroke(s, 5, 5);
    extendStroke(s, 10, 0);
    drawStroke(ctx, s);
    expect(calls).toEqual(["begin", "move", "quad", "quad", "line", "stroke:destination-out"]);
    expect(ctx.globalCompositeOperation).toBe("source-over");
  });
});
