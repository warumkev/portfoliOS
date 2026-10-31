"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { APPS } from "@/config/apps";
import { PROFILE } from "@/config/profile";
import { useViewport } from "@/lib/hooks";
import { useOS } from "@/lib/os-context";
import { usePreferences } from "@/lib/preferences";
import { completeInput, runCommand, type TerminalLine } from "@/lib/terminal";
import { cn } from "@/lib/utils";

const PROMPT = "kevin@portfolios ~ %";

const LINE_STYLES: Record<TerminalLine["kind"], string> = {
  input: "text-foreground",
  output: "text-foreground/90",
  error: "text-destructive",
  muted: "text-muted",
  accent: "text-accent",
};

function welcome(): TerminalLine[] {
  return [
    { kind: "accent", text: `${PROFILE.os.name} ${PROFILE.os.version} · pfsh` },
    { kind: "muted", text: 'Type "help" to see what this thing can do.' },
    { kind: "output", text: "" },
  ];
}

export default function TerminalApp() {
  const { projects, openApp, closeApp } = useOS();
  const { theme, setTheme } = usePreferences();
  const viewport = useViewport();
  const [lines, setLines] = useState<TerminalLine[]>(welcome);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const context = useCallback(
    () => ({
      projects,
      apps: APPS.map((a) => ({ id: a.id, title: a.title })),
      theme,
      now: new Date(),
      viewport,
    }),
    [projects, theme, viewport]
  );

  const submit = () => {
    const command = input;
    const result = runCommand(command, context());
    let cleared = false;
    for (const effect of result.effects) {
      switch (effect.type) {
        case "open-app":
          openApp(effect.id);
          break;
        case "open-url":
          window.open(effect.url, "_blank", "noopener,noreferrer");
          break;
        case "set-theme":
          setTheme(effect.theme);
          break;
        case "clear":
          cleared = true;
          break;
        case "exit":
          closeApp("terminal");
          break;
      }
    }
    setLines((prev) =>
      cleared
        ? []
        : [...prev, { kind: "input", text: command }, ...result.lines]
    );
    if (command.trim()) setHistory((prev) => [...prev, command]);
    setHistoryIndex(null);
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Tab") {
      event.preventDefault();
      const options = completeInput(input, context());
      if (options.length === 1) {
        setInput(options[0] + (options[0].includes(" ") ? "" : " "));
      } else if (options.length > 1) {
        setLines((prev) => [
          ...prev,
          { kind: "input", text: input },
          { kind: "muted", text: options.join("   ") },
        ]);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="app-scroll h-full cursor-text overflow-y-auto bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] px-4 py-3 font-mono text-[12px] leading-5 sm:text-[13px] sm:leading-6"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <div role="log" aria-live="polite">
        {lines.map((line, index) => (
          <div key={index} className={cn("whitespace-pre-wrap break-words", LINE_STYLES[line.kind])}>
            {line.kind === "input" ? (
              <>
                <span className="text-accent">{PROMPT}</span> {line.text}
              </>
            ) : (
              line.text || " "
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="terminal-input" className="shrink-0 text-accent">
          {PROMPT}
        </label>
        <input
          ref={inputRef}
          id="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          aria-label="Terminal command"
          className="min-w-0 flex-1 bg-transparent text-foreground caret-accent outline-none"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
