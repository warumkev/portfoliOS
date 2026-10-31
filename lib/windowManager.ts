/**
 * Pure window manager: a reducer over window state that knows nothing about React.
 * The desktop view dispatches actions; the dock and menu bar read derived selectors.
 */

export interface Point {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface Rect extends Point, Size {}

export interface WindowDefaults {
  defaultSize: Size;
  minSize: Size;
}

export interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: Point;
  size: Size;
  zIndex: number;
  /** Bounds to restore after un-maximizing. */
  restoreBounds: Rect | null;
}

export interface WindowManagerState {
  windows: Record<string, WindowState>;
  topZ: number;
  focusedId: string | null;
}

export type WindowAction =
  | { type: "open"; id: string; workspace: Rect }
  | { type: "close"; id: string }
  | { type: "closeAll" }
  | { type: "focus"; id: string }
  | { type: "minimize"; id: string }
  | { type: "toggleMaximize"; id: string; workspace: Rect }
  | { type: "move"; id: string; position: Point; workspace: Rect }
  | { type: "resize"; id: string; size: Size; workspace: Rect }
  | { type: "clampAll"; workspace: Rect };

export const CASCADE_OFFSET = 32;
const BASE_Z = 10;

export function createInitialState(
  defaults: Record<string, WindowDefaults>
): WindowManagerState {
  const windows: Record<string, WindowState> = {};
  for (const [id, def] of Object.entries(defaults)) {
    windows[id] = {
      id,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 0, y: 0 },
      size: { ...def.defaultSize },
      zIndex: BASE_Z,
      restoreBounds: null,
    };
  }
  return { windows, topZ: BASE_Z, focusedId: null };
}

/** Windows that are open and not minimized, lowest z first. */
export function visibleWindows(state: WindowManagerState): WindowState[] {
  return Object.values(state.windows)
    .filter((w) => w.isOpen && !w.isMinimized)
    .sort((a, b) => a.zIndex - b.zIndex);
}

export function topmostVisible(
  state: WindowManagerState,
  excludeId?: string
): WindowState | null {
  const visible = visibleWindows(state).filter((w) => w.id !== excludeId);
  return visible.length ? visible[visible.length - 1] : null;
}

/** Fits a window of `size` into `workspace`, shrinking it if the workspace is smaller. */
export function fitSize(size: Size, workspace: Rect, minSize: Size): Size {
  return {
    width: Math.max(
      Math.min(minSize.width, workspace.width),
      Math.min(size.width, workspace.width)
    ),
    height: Math.max(
      Math.min(minSize.height, workspace.height),
      Math.min(size.height, workspace.height)
    ),
  };
}

/** Keeps the whole window inside the workspace. */
export function clampPosition(
  position: Point,
  size: Size,
  workspace: Rect
): Point {
  const maxX = workspace.x + Math.max(0, workspace.width - size.width);
  const maxY = workspace.y + Math.max(0, workspace.height - size.height);
  return {
    x: Math.round(Math.min(Math.max(position.x, workspace.x), maxX)),
    y: Math.round(Math.min(Math.max(position.y, workspace.y), maxY)),
  };
}

/**
 * First window is centered. Each further window cascades from the topmost
 * visible one; when the cascade would leave the workspace it wraps to the origin.
 */
export function placeWindow(
  size: Size,
  workspace: Rect,
  anchor: WindowState | null
): Point {
  if (!anchor) {
    return clampPosition(
      {
        x: workspace.x + (workspace.width - size.width) / 2,
        y: workspace.y + (workspace.height - size.height) / 2,
      },
      size,
      workspace
    );
  }
  const candidate = {
    x: anchor.position.x + CASCADE_OFFSET,
    y: anchor.position.y + CASCADE_OFFSET,
  };
  const clamped = clampPosition(candidate, size, workspace);
  const wrapped =
    clamped.x !== candidate.x || clamped.y !== candidate.y
      ? clampPosition(
          { x: workspace.x + CASCADE_OFFSET, y: workspace.y + CASCADE_OFFSET },
          size,
          workspace
        )
      : clamped;
  return wrapped;
}

function raise(
  state: WindowManagerState,
  id: string
): { windows: Record<string, WindowState>; topZ: number } {
  const win = state.windows[id];
  if (win.zIndex === state.topZ && state.focusedId === id) {
    return { windows: state.windows, topZ: state.topZ };
  }
  const topZ = state.topZ + 1;
  return {
    windows: { ...state.windows, [id]: { ...win, zIndex: topZ } },
    topZ,
  };
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
  defaults: Record<string, WindowDefaults>
): WindowManagerState {
  switch (action.type) {
    case "open": {
      const win = state.windows[action.id];
      if (!win) return state;
      const def = defaults[action.id];
      if (win.isOpen && !win.isMinimized) {
        const raised = raise(state, action.id);
        return { ...state, ...raised, focusedId: action.id };
      }
      const anchor = topmostVisible(state, action.id);
      const size = win.isOpen
        ? win.size
        : fitSize(def.defaultSize, action.workspace, def.minSize);
      const position = win.isOpen
        ? clampPosition(win.position, size, action.workspace)
        : placeWindow(size, action.workspace, anchor);
      const topZ = state.topZ + 1;
      return {
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            isOpen: true,
            isMinimized: false,
            position,
            size,
            zIndex: topZ,
          },
        },
        topZ,
        focusedId: action.id,
      };
    }
    case "close": {
      const win = state.windows[action.id];
      if (!win || !win.isOpen) return state;
      const next: WindowManagerState = {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            restoreBounds: null,
          },
        },
      };
      const top = topmostVisible(next);
      return { ...next, focusedId: top ? top.id : null };
    }
    case "closeAll": {
      const windows: Record<string, WindowState> = {};
      for (const [id, win] of Object.entries(state.windows)) {
        windows[id] = {
          ...win,
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          restoreBounds: null,
        };
      }
      return { ...state, windows, focusedId: null };
    }
    case "focus": {
      const win = state.windows[action.id];
      if (!win || !win.isOpen || win.isMinimized) return state;
      const raised = raise(state, action.id);
      return { ...state, ...raised, focusedId: action.id };
    }
    case "minimize": {
      const win = state.windows[action.id];
      if (!win || !win.isOpen || win.isMinimized) return state;
      const next: WindowManagerState = {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isMinimized: true },
        },
      };
      const top = topmostVisible(next);
      return { ...next, focusedId: top ? top.id : null };
    }
    case "toggleMaximize": {
      const win = state.windows[action.id];
      if (!win || !win.isOpen) return state;
      const raised = raise(state, action.id);
      const current = raised.windows[action.id];
      if (win.isMaximized) {
        const bounds = win.restoreBounds ?? {
          ...win.position,
          ...defaults[action.id].defaultSize,
        };
        const size = fitSize(
          { width: bounds.width, height: bounds.height },
          action.workspace,
          defaults[action.id].minSize
        );
        return {
          ...state,
          ...raised,
          windows: {
            ...raised.windows,
            [action.id]: {
              ...current,
              isMaximized: false,
              restoreBounds: null,
              size,
              position: clampPosition(bounds, size, action.workspace),
            },
          },
          focusedId: action.id,
        };
      }
      return {
        ...state,
        ...raised,
        windows: {
          ...raised.windows,
          [action.id]: {
            ...current,
            isMaximized: true,
            restoreBounds: { ...win.position, ...win.size },
            position: { x: action.workspace.x, y: action.workspace.y },
            size: {
              width: action.workspace.width,
              height: action.workspace.height,
            },
          },
        },
        focusedId: action.id,
      };
    }
    case "move": {
      const win = state.windows[action.id];
      if (!win || win.isMaximized) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            position: clampPosition(action.position, win.size, action.workspace),
          },
        },
      };
    }
    case "resize": {
      const win = state.windows[action.id];
      if (!win || win.isMaximized) return state;
      const minSize = defaults[action.id].minSize;
      const maxWidth = action.workspace.x + action.workspace.width - win.position.x;
      const maxHeight =
        action.workspace.y + action.workspace.height - win.position.y;
      const size = {
        width: Math.round(
          Math.max(minSize.width, Math.min(action.size.width, maxWidth))
        ),
        height: Math.round(
          Math.max(minSize.height, Math.min(action.size.height, maxHeight))
        ),
      };
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, size } },
      };
    }
    case "clampAll": {
      let changed = false;
      const windows: Record<string, WindowState> = {};
      for (const [id, win] of Object.entries(state.windows)) {
        if (!win.isOpen) {
          windows[id] = win;
          continue;
        }
        if (win.isMaximized) {
          windows[id] = {
            ...win,
            position: { x: action.workspace.x, y: action.workspace.y },
            size: {
              width: action.workspace.width,
              height: action.workspace.height,
            },
          };
          changed = true;
          continue;
        }
        const size = fitSize(win.size, action.workspace, defaults[id].minSize);
        const position = clampPosition(win.position, size, action.workspace);
        if (
          size.width !== win.size.width ||
          size.height !== win.size.height ||
          position.x !== win.position.x ||
          position.y !== win.position.y
        ) {
          changed = true;
          windows[id] = { ...win, size, position };
        } else {
          windows[id] = win;
        }
      }
      return changed ? { ...state, windows } : state;
    }
    default:
      return state;
  }
}
