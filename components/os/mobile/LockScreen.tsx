"use client";

import { motion } from "motion/react";
import { ChevronUp } from "lucide-react";
import { PROFILE } from "@/config/profile";
import { formatDate, formatTime, useClock } from "@/lib/hooks";
import { Wallpaper } from "@/components/os/Wallpaper";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const now = useClock();
  return (
    <motion.div
      key="lock"
      className="absolute inset-0 z-50 flex flex-col items-center justify-between select-none"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 4.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)",
      }}
      initial={{ y: 0, opacity: 1 }}
      exit={{ y: "-100%", opacity: 0.6, transition: { type: "spring", stiffness: 160, damping: 24 } }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.25, bottom: 0.05 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -70 || info.velocity.y < -500) onUnlock();
      }}
      role="dialog"
      aria-label="Lock screen"
    >
      <Wallpaper />
      <div className="relative z-10 text-center">
        <p className="text-sm font-medium text-foreground/70">{formatDate(now, "long")}</p>
        <time
          dateTime={now.toISOString()}
          className="mt-1 block text-[84px] font-light leading-none tracking-tighter tabular-nums"
        >
          {formatTime(now)}
        </time>
        <p className="mt-6 text-sm text-foreground/70">
          {PROFILE.os.name} · a portfolio by {PROFILE.name}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onUnlock}
          className="flex flex-col items-center gap-1 text-sm font-medium text-foreground/80"
          aria-label="Unlock"
        >
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <ChevronUp size={20} />
          </motion.span>
          Swipe up to open
        </button>
        <span className="h-1.5 w-32 rounded-full bg-foreground/80" aria-hidden="true" />
        <a href="/safe-mode.html" className="mt-2 text-xs text-foreground/50 underline-offset-2 hover:underline">
          Safe mode
        </a>
      </div>
    </motion.div>
  );
}
