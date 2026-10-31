"use client";

import { createContext, useContext } from "react";
import type { Project } from "@/lib/types";

export type Platform = "desktop" | "mobile";

export interface OSApi {
  platform: Platform;
  projects: Project[];
  openApp: (id: string) => void;
  closeApp: (id: string) => void;
  /** Desktop only: wipes the drawing layer. */
  clearCanvas?: () => void;
  /** Desktop only: opens the command palette. */
  openPalette?: () => void;
}

export const OSContext = createContext<OSApi | null>(null);

export function useOS(): OSApi {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used inside an OS view");
  return ctx;
}
