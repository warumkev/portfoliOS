import { NextResponse } from "next/server";
import { loadProjects } from "@/lib/projects";

export const dynamic = "force-static";

/** Consumed by /safe-mode.html; the OS itself gets projects server-side. */
export function GET() {
  return NextResponse.json(loadProjects());
}
