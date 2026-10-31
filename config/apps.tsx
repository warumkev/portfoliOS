import type { ComponentType } from "react";
import {
  Briefcase,
  Mail,
  Music,
  Settings,
  Terminal,
  User,
  type LucideIcon,
} from "lucide-react";
import type { WindowDefaults } from "@/lib/windowManager";
import AboutApp from "@/components/apps/AboutApp";
import ProjectsApp from "@/components/apps/ProjectsApp";
import ContactApp from "@/components/apps/ContactApp";
import TerminalApp from "@/components/apps/TerminalApp";
import MusicApp from "@/components/apps/MusicApp";
import SettingsApp from "@/components/apps/SettingsApp";

export type AppId =
  | "about"
  | "projects"
  | "contact"
  | "terminal"
  | "music"
  | "settings";

export interface AppDefinition {
  id: AppId;
  title: string;
  /** Short line for tooltips and the command palette. */
  summary: string;
  icon: LucideIcon;
  /** Icon tile background. */
  tint: string;
  component: ComponentType;
  keywords: string[];
  window: WindowDefaults;
  /** Shown in the mobile dock. */
  mobileDock?: boolean;
}

const MIN = { width: 340, height: 360 };

export const APPS: AppDefinition[] = [
  {
    id: "about",
    title: "README",
    summary: "Who I am and how I work",
    icon: User,
    tint: "#5b6cff",
    component: AboutApp,
    keywords: ["about", "me", "bio", "profile", "kevin"],
    window: { defaultSize: { width: 460, height: 660 }, minSize: MIN },
    mobileDock: true,
  },
  {
    id: "projects",
    title: "Projects",
    summary: "Apps and sites I built",
    icon: Briefcase,
    tint: "#f59e0b",
    component: ProjectsApp,
    keywords: ["portfolio", "work", "apps", "github"],
    window: { defaultSize: { width: 580, height: 680 }, minSize: MIN },
    mobileDock: true,
  },
  {
    id: "contact",
    title: "Mail",
    summary: "Ways to reach me",
    icon: Mail,
    tint: "#0ea5e9",
    component: ContactApp,
    keywords: ["contact", "email", "message", "hire"],
    window: { defaultSize: { width: 460, height: 480 }, minSize: MIN },
    mobileDock: true,
  },
  {
    id: "terminal",
    title: "Terminal",
    summary: "For people who prefer the keyboard",
    icon: Terminal,
    tint: "#27272a",
    component: TerminalApp,
    keywords: ["shell", "console", "cli", "commands"],
    window: { defaultSize: { width: 680, height: 440 }, minSize: MIN },
    mobileDock: true,
  },
  {
    id: "music",
    title: "Music",
    summary: "Lofi radio while you browse",
    icon: Music,
    tint: "#f43f5e",
    component: MusicApp,
    keywords: ["radio", "lofi", "player", "audio"],
    window: { defaultSize: { width: 380, height: 520 }, minSize: MIN },
  },
  {
    id: "settings",
    title: "Settings",
    summary: "Theme, accent and system info",
    icon: Settings,
    tint: "#71717a",
    component: SettingsApp,
    keywords: ["preferences", "theme", "dark", "light", "accent", "system"],
    window: { defaultSize: { width: 480, height: 640 }, minSize: MIN },
  },
];

export const APP_MAP: Record<AppId, AppDefinition> = Object.fromEntries(
  APPS.map((app) => [app.id, app])
) as Record<AppId, AppDefinition>;

export const WINDOW_DEFAULTS: Record<string, WindowDefaults> = Object.fromEntries(
  APPS.map((app) => [app.id, app.window])
);

export function getApp(id: string): AppDefinition | undefined {
  return APP_MAP[id as AppId];
}
