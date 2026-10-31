export interface Project {
  slug: string;
  title: string;
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  tags?: string[];
  kind?: "app" | "web";
}

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
