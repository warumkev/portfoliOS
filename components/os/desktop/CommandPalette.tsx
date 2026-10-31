"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { searchCommands, type CommandItem } from "@/lib/commandSearch";
import { cn } from "@/lib/utils";

export interface PaletteItem extends CommandItem {
  icon?: ReactNode;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  items: PaletteItem[];
  onClose: () => void;
}

export function CommandPalette({ open, items, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => searchCommands(items, query) as PaletteItem[], [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const run = (item: PaletteItem) => {
    onClose();
    item.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[active];
      if (item) run(item);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  let lastGroup: string | null = null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/25 px-4 pt-[16vh] backdrop-blur-[2px]"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 520, damping: 38 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="glass w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Open an app, a project, or run an action…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
                className="h-13 w-full bg-transparent py-4 text-[15px] outline-none placeholder:text-muted/70"
              />
              <kbd className="hidden rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted sm:inline">
                esc
              </kbd>
            </div>
            <ul
              ref={listRef}
              id="palette-results"
              role="listbox"
              className="app-scroll max-h-[52vh] overflow-y-auto p-2"
            >
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">Nothing matches “{query}”.</li>
              )}
              {results.map((item, index) => {
                const showHeader = item.group !== lastGroup;
                lastGroup = item.group;
                const selected = index === active;
                return (
                  <li key={item.id} role="presentation">
                    {showHeader && (
                      <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {item.group}
                      </div>
                    )}
                    <button
                      type="button"
                      id={`palette-${item.id}`}
                      role="option"
                      aria-selected={selected}
                      data-index={index}
                      onMouseMove={() => setActive(index)}
                      onClick={() => run(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                        selected ? "bg-foreground/8" : "hover:bg-foreground/5"
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.title}</span>
                        {item.subtitle && (
                          <span className="block truncate text-xs text-muted">{item.subtitle}</span>
                        )}
                      </span>
                      {selected && <CornerDownLeft size={14} className="shrink-0 text-muted" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
