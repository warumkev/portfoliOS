import type { AppDefinition } from "@/config/apps";
import { cn } from "@/lib/utils";

/** Rounded icon tile shared by the dock, the home screen and the palette. */
export function AppIcon({
  app,
  size = 48,
  className,
}: {
  app: AppDefinition;
  size?: number;
  className?: string;
}) {
  const Icon = app.icon;
  const glyph = Math.round(size * 0.5);
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.2)]",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        background: `linear-gradient(160deg, color-mix(in oklab, ${app.tint} 82%, white) 0%, ${app.tint} 55%, color-mix(in oklab, ${app.tint} 80%, black) 100%)`,
      }}
      aria-hidden="true"
    >
      <Icon size={glyph} strokeWidth={2} />
    </span>
  );
}
