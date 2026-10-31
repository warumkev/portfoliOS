import { describe, expect, it } from "vitest";
import {
  createInitialState,
  placeWindow,
  visibleWindows,
  windowReducer,
  type Rect,
  type WindowDefaults,
} from "../windowManager";

const defaults: Record<string, WindowDefaults> = {
  a: { defaultSize: { width: 400, height: 300 }, minSize: { width: 200, height: 150 } },
  b: { defaultSize: { width: 400, height: 300 }, minSize: { width: 200, height: 150 } },
  c: { defaultSize: { width: 2000, height: 2000 }, minSize: { width: 200, height: 150 } },
};
const ws: Rect = { x: 0, y: 28, width: 1200, height: 700 };
const reduce = (s: ReturnType<typeof createInitialState>, a: Parameters<typeof windowReducer>[1]) =>
  windowReducer(s, a, defaults);

describe("windowReducer", () => {
  it("centers the first window inside the workspace", () => {
    const s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    expect(s.windows.a.isOpen).toBe(true);
    expect(s.windows.a.position).toEqual({ x: 400, y: 228 });
    expect(s.focusedId).toBe("a");
  });

  it("cascades the second window from the first", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "open", id: "b", workspace: ws });
    expect(s.windows.b.position).toEqual({ x: 432, y: 260 });
    expect(s.windows.b.zIndex).toBeGreaterThan(s.windows.a.zIndex);
  });

  it("wraps the cascade to the origin when it would leave the workspace", () => {
    const anchor = { ...createInitialState(defaults).windows.a, position: { x: 790, y: 420 }, isOpen: true };
    expect(placeWindow({ width: 400, height: 300 }, ws, anchor)).toEqual({ x: 32, y: 60 });
  });

  it("shrinks oversized windows to the workspace", () => {
    const s = reduce(createInitialState(defaults), { type: "open", id: "c", workspace: ws });
    expect(s.windows.c.size).toEqual({ width: 1200, height: 700 });
    expect(s.windows.c.position).toEqual({ x: 0, y: 28 });
  });

  it("re-focuses an already open window instead of moving it", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "open", id: "b", workspace: ws });
    const before = s.windows.a.position;
    s = reduce(s, { type: "open", id: "a", workspace: ws });
    expect(s.windows.a.position).toEqual(before);
    expect(s.focusedId).toBe("a");
    expect(s.windows.a.zIndex).toBeGreaterThan(s.windows.b.zIndex);
  });

  it("hands focus to the next visible window on close and minimize", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "open", id: "b", workspace: ws });
    s = reduce(s, { type: "minimize", id: "b" });
    expect(s.focusedId).toBe("a");
    expect(visibleWindows(s).map((w) => w.id)).toEqual(["a"]);
    s = reduce(s, { type: "close", id: "a" });
    expect(s.focusedId).toBeNull();
  });

  it("restores a minimized window to its old position", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "move", id: "a", position: { x: 100, y: 100 }, workspace: ws });
    s = reduce(s, { type: "minimize", id: "a" });
    s = reduce(s, { type: "open", id: "a", workspace: ws });
    expect(s.windows.a.isMinimized).toBe(false);
    expect(s.windows.a.position).toEqual({ x: 100, y: 100 });
  });

  it("maximizes to the workspace and restores previous bounds", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "toggleMaximize", id: "a", workspace: ws });
    expect(s.windows.a.isMaximized).toBe(true);
    expect(s.windows.a.position).toEqual({ x: 0, y: 28 });
    expect(s.windows.a.size).toEqual({ width: 1200, height: 700 });
    // moving while maximized is ignored
    s = reduce(s, { type: "move", id: "a", position: { x: 5, y: 5 }, workspace: ws });
    expect(s.windows.a.position).toEqual({ x: 0, y: 28 });
    s = reduce(s, { type: "toggleMaximize", id: "a", workspace: ws });
    expect(s.windows.a.isMaximized).toBe(false);
    expect(s.windows.a.position).toEqual({ x: 400, y: 228 });
    expect(s.windows.a.size).toEqual({ width: 400, height: 300 });
  });

  it("clamps moves and resizes to the workspace and min size", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "move", id: "a", position: { x: -50, y: 5000 }, workspace: ws });
    expect(s.windows.a.position).toEqual({ x: 0, y: 428 });
    s = reduce(s, { type: "resize", id: "a", size: { width: 50, height: 5000 }, workspace: ws });
    expect(s.windows.a.size).toEqual({ width: 200, height: 300 });
  });

  it("clampAll pulls windows back after the viewport shrinks", () => {
    let s = reduce(createInitialState(defaults), { type: "open", id: "a", workspace: ws });
    s = reduce(s, { type: "move", id: "a", position: { x: 800, y: 400 }, workspace: ws });
    const small: Rect = { x: 0, y: 28, width: 600, height: 400 };
    s = reduce(s, { type: "clampAll", workspace: small });
    expect(s.windows.a.position).toEqual({ x: 200, y: 128 });
    expect(reduce(s, { type: "clampAll", workspace: small })).toBe(s);
  });
});
