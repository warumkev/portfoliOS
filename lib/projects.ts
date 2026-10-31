import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Project } from "@/lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "features/projects/content");

/** Reads every project JSON file once per request on the server. */
export function loadProjects(): Project[] {
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
    const data = JSON.parse(raw) as Omit<Project, "slug">;
    return { slug: file.replace(/\.json$/, ""), ...data };
  });
}
