"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { PROFILE } from "@/config/profile";
import { GitHubIcon, LinkedInIcon } from "@/lib/brand-icons";

type Channel = {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  external: boolean;
};

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "");

const CHANNELS: Channel[] = [
  {
    label: "E-mail",
    value: PROFILE.links.email,
    href: `mailto:${PROFILE.links.email}`,
    icon: <Mail size={18} aria-hidden="true" />,
    external: false,
  },
  {
    label: "GitHub",
    value: stripProtocol(PROFILE.links.github),
    href: PROFILE.links.github,
    icon: <GitHubIcon className="h-[18px] w-[18px]" aria-hidden="true" />,
    external: true,
  },
  {
    label: "LinkedIn",
    value: stripProtocol(PROFILE.links.linkedin),
    href: PROFILE.links.linkedin,
    icon: <LinkedInIcon className="h-[18px] w-[18px]" aria-hidden="true" />,
    external: true,
  },
];

export default function ContactApp() {
  return (
    <div className="app-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-xl px-6 py-7 sm:px-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Get in touch</h1>
          <p className="mt-1 text-muted">Pick whichever channel suits you. E-mail reaches me directly.</p>
        </header>

        <ul className="mt-6 space-y-2">
          {CHANNELS.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
                  {channel.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{channel.label}</span>
                  <span className="block truncate text-xs text-muted">{channel.value}</span>
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} aria-hidden="true" />
          Based in {PROFILE.location}
        </p>
      </div>
    </div>
  );
}
