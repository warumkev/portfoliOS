"use client";

import { motion } from "motion/react";
import type { AppDefinition } from "@/config/apps";
import { AppIcon } from "@/components/os/AppIcon";
import type { OpenOrigin } from "./HomeScreen";

interface AppSheetProps {
  app: AppDefinition;
  origin: OpenOrigin;
  onClose: () => void;
}

export function AppSheet({ app, origin, onClose }: AppSheetProps) {
  const Content = app.component;
  return (
    <motion.section
      key={app.id}
      initial={{ opacity: 0, scale: 0.3, borderRadius: 32 }}
      animate={{ opacity: 1, scale: 1, borderRadius: 0 }}
      exit={{ opacity: 0, scale: 0.3, borderRadius: 32, transition: { duration: 0.22, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
      style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={app.title}
    >
      <header
        className="glass flex shrink-0 items-center justify-between rounded-none border-x-0 border-t-0 px-4"
        style={{
          // status bar (2.75rem) sits above the sheet, like on a phone
          paddingTop: "calc(env(safe-area-inset-top) + 2.75rem)",
          height: "calc(6rem + env(safe-area-inset-top))",
        }}
      >
        <div className="flex items-center gap-2.5">
          <AppIcon app={app} size={26} />
          <span className="font-semibold">{app.title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm font-semibold text-accent active:bg-foreground/10"
        >
          Done
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <Content />
      </div>

      <motion.div
        className="flex shrink-0 items-center justify-center pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)", touchAction: "none" }}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0.05 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < -40 || info.velocity.y < -400) onClose();
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="h-1.5 w-32 rounded-full bg-foreground/80"
          aria-label="Back to home screen"
        />
      </motion.div>
    </motion.section>
  );
}
