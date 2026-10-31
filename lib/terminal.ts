import { PROFILE } from "@/config/profile";
import type { Project, Theme } from "@/lib/types";

export type LineKind = "input" | "output" | "error" | "muted" | "accent";
export interface TerminalLine {
  kind: LineKind;
  text: string;
}

export type TerminalEffect =
  | { type: "open-app"; id: string }
  | { type: "open-url"; url: string }
  | { type: "set-theme"; theme: Theme }
  | { type: "clear" }
  | { type: "exit" };

export interface TerminalResult {
  lines: TerminalLine[];
  effects: TerminalEffect[];
}

export interface TerminalContext {
  projects: Project[];
  apps: { id: string; title: string }[];
  theme: Theme;
  now: Date;
  viewport?: { width: number; height: number };
  userAgent?: string;
}

const out = (text: string, kind: LineKind = "output"): TerminalLine => ({ kind, text });

const COMMANDS: { name: string; usage: string; help: string }[] = [
  { name: "help", usage: "help", help: "List commands" },
  { name: "about", usage: "about", help: "Who is behind this" },
  { name: "skills", usage: "skills", help: "What I work with" },
  { name: "projects", usage: "projects", help: "List projects" },
  { name: "open", usage: "open <target>", help: "Open app or project" },
  { name: "contact", usage: "contact", help: "Ways to reach me" },
  { name: "theme", usage: "theme [mode]", help: "light, dark or system" },
  { name: "neofetch", usage: "neofetch", help: "System summary" },
  { name: "date", usage: "date", help: "Date and time" },
  { name: "echo", usage: "echo <text>", help: "Print text" },
  { name: "clear", usage: "clear", help: "Clear the screen" },
  { name: "exit", usage: "exit", help: "Close the terminal" },
];

export const COMMAND_NAMES = COMMANDS.map((c) => c.name);

/** Suggests completions for the current input (command names, app ids, project slugs). */
export function completeInput(input: string, ctx: TerminalContext): string[] {
  const parts = input.trimStart().split(/\s+/);
  if (parts.length <= 1) {
    const q = parts[0] ?? "";
    return COMMAND_NAMES.filter((c) => c.startsWith(q));
  }
  if (parts[0] === "open") {
    const q = parts[1].toLowerCase();
    const targets = [
      ...ctx.apps.map((a) => a.id),
      ...ctx.projects.map((p) => p.slug),
    ];
    return targets.filter((t) => t.startsWith(q)).map((t) => `open ${t}`);
  }
  if (parts[0] === "theme") {
    return ["light", "dark", "system"]
      .filter((t) => t.startsWith(parts[1]))
      .map((t) => `theme ${t}`);
  }
  return [];
}

function neofetch(ctx: TerminalContext): TerminalLine[] {
  const uptimeMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
  const logo = [
    "┌──────────┐",
    "│ o o o    │",
    "├──────────┤",
    "│ portfoli │",
    "│       OS │",
    "│          │",
    "└──────────┘",
  ];
  const info = [
    `${PROFILE.links.github.replace("https://", "")}`,
    "-".repeat(22),
    `OS:       ${PROFILE.os.name} ${PROFILE.os.version} (${PROFILE.os.build})`,
    `Host:     ${PROFILE.name}, ${PROFILE.location}`,
    `Shell:    pfsh 2.0`,
    `Theme:    ${ctx.theme}`,
    `Uptime:   ${uptimeMin} min`,
    ctx.viewport
      ? `Display:  ${ctx.viewport.width}x${ctx.viewport.height}`
      : "Display:  unknown",
    `Projects: ${ctx.projects.length}`,
  ];
  // Narrow screens get the logo above the facts instead of beside them.
  if (ctx.viewport && ctx.viewport.width < 560) {
    return [
      ...logo.map((l) => out(l, "accent")),
      out(""),
      ...info.map((l, i) => out(l, i === 0 ? "accent" : "output")),
    ];
  }
  const rows = Math.max(logo.length, info.length);
  const lines: TerminalLine[] = [];
  for (let i = 0; i < rows; i++) {
    const left = (logo[i] ?? "").padEnd(12, " ") + "  ";
    lines.push(out(`${left}${info[i] ?? ""}`, i === 0 ? "accent" : "output"));
  }
  return lines;
}

const sessionStart = Date.now();

export function runCommand(input: string, ctx: TerminalContext): TerminalResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [], effects: [] };
  const [cmd, ...args] = trimmed.split(/\s+/);
  const command = cmd.toLowerCase();
  const arg = args.join(" ");

  switch (command) {
    case "help":
      return {
        lines: [
          out("Available commands:", "muted"),
          ...COMMANDS.map((c) => out(`  ${c.usage.padEnd(15)} ${c.help}`)),
          out(""),
          out("Tab completes, ↑/↓ browse history.", "muted"),
        ],
        effects: [],
      };
    case "about":
    case "whoami":
      return {
        lines: [
          out(`${PROFILE.name} — ${PROFILE.role}, ${PROFILE.location}.`, "accent"),
          ...PROFILE.bio.map((p) => out(p)),
        ],
        effects: [],
      };
    case "skills":
      return {
        lines: [out(PROFILE.skills.join("  ·  "))],
        effects: [],
      };
    case "projects":
    case "ls":
      return {
        lines: [
          out(`${ctx.projects.length} projects`, "muted"),
          ...ctx.projects.map((p, i) =>
            out(`  ${String(i + 1).padStart(2)}  ${p.title.padEnd(26)} ${p.slug}`)
          ),
          out(""),
          out("open <number|slug> opens the live site or repository.", "muted"),
        ],
        effects: [],
      };
    case "open": {
      if (!arg) {
        return { lines: [out("usage: open <app|project>", "error")], effects: [] };
      }
      const key = arg.toLowerCase();
      const app = ctx.apps.find(
        (a) => a.id === key || a.title.toLowerCase() === key
      );
      if (app) {
        return { lines: [out(`Opening ${app.title}…`, "muted")], effects: [{ type: "open-app", id: app.id }] };
      }
      const index = Number.parseInt(key, 10);
      const project =
        (!Number.isNaN(index) && ctx.projects[index - 1]) ||
        ctx.projects.find(
          (p) => p.slug === key || p.title.toLowerCase() === key
        );
      if (!project) {
        return { lines: [out(`open: nothing called "${arg}"`, "error")], effects: [] };
      }
      const url = project.liveUrl ?? project.githubUrl;
      if (!url) {
        return { lines: [out(`${project.title} has no public link yet.`, "error")], effects: [] };
      }
      return {
        lines: [out(`Opening ${project.title} → ${url}`, "muted")],
        effects: [{ type: "open-url", url }],
      };
    }
    case "contact":
      return {
        lines: [
          out(`Mail:      ${PROFILE.links.email}`),
          out(`GitHub:    ${PROFILE.links.github}`),
          out(`LinkedIn:  ${PROFILE.links.linkedin}`),
          out(""),
          out("open contact opens the Mail app.", "muted"),
        ],
        effects: [],
      };
    case "theme": {
      if (!arg) {
        return { lines: [out(`theme: ${ctx.theme}`)], effects: [] };
      }
      if (arg === "light" || arg === "dark" || arg === "system") {
        return {
          lines: [out(`theme set to ${arg}`, "muted")],
          effects: [{ type: "set-theme", theme: arg }],
        };
      }
      return { lines: [out("usage: theme [light|dark|system]", "error")], effects: [] };
    }
    case "neofetch":
      return { lines: neofetch(ctx), effects: [] };
    case "date":
      return {
        lines: [out(ctx.now.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "medium" }))],
        effects: [],
      };
    case "echo":
      return { lines: [out(arg)], effects: [] };
    case "clear":
    case "cls":
      return { lines: [], effects: [{ type: "clear" }] };
    case "exit":
    case "quit":
      return { lines: [], effects: [{ type: "exit" }] };
    case "sudo":
      return { lines: [out("Nice try. This OS runs on trust, not root.", "error")], effects: [] };
    case "rm":
      return { lines: [out("Deleting a portfolio from inside the portfolio? Bold.", "error")], effects: [] };
    case "vim":
    case "vi":
    case "nano":
    case "emacs":
      return { lines: [out("Editors are over there → open about", "muted")], effects: [] };
    default:
      return {
        lines: [out(`${command}: command not found. Try "help".`, "error")],
        effects: [],
      };
  }
}
