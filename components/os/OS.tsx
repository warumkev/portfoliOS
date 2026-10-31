"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";
import { useMediaQuery } from "@/lib/hooks";
import type { Project } from "@/lib/types";
import { Wallpaper } from "./Wallpaper";

// Each surface is its own bundle; a phone never downloads the window manager.
const DesktopView = dynamic(() => import("./desktop/DesktopView"), { ssr: false });
const MobileView = dynamic(() => import("./mobile/MobileView"), { ssr: false });

export default function OS({ projects }: { projects: Project[] }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <MotionConfig reducedMotion="user">
      {isMobile === null ? (
        <div className="relative h-dvh w-screen overflow-hidden" aria-busy="true">
          <Wallpaper />
        </div>
      ) : isMobile ? (
        <MobileView projects={projects} />
      ) : (
        <DesktopView projects={projects} />
      )}
    </MotionConfig>
  );
}
