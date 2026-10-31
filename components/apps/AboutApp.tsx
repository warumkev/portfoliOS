"use client";

import Image from "next/image";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { PROFILE } from "@/config/profile";
import { GitHubIcon, LinkedInIcon } from "@/lib/brand-icons";
import { useOS } from "@/lib/os-context";

export default function AboutApp() {
  const { openApp } = useOS();
  return (
    <div className="app-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-xl px-6 py-7 sm:px-8">
        <header className="flex items-start gap-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
            <Image
              src="/profile-image.png"
              alt={`Portrait of ${PROFILE.name}`}
              fill
              sizes="80px"
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0 pt-1">
            <h1 className="text-2xl font-semibold tracking-tight">{PROFILE.name}</h1>
            <p className="text-muted">{PROFILE.role}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin size={14} aria-hidden="true" />
              {PROFILE.location}
            </p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={PROFILE.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href={PROFILE.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <LinkedInIcon className="h-4 w-4" />
            LinkedIn
          </a>
          <button type="button" onClick={() => openApp("contact")} className="btn-primary">
            <Mail size={16} aria-hidden="true" />
            Say hi
          </button>
        </div>

        <section className="mt-8 space-y-4 text-[15px] leading-relaxed text-foreground/85">
          {PROFILE.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            What I work with
          </h2>
          <ul className="flex flex-wrap gap-2">
            {PROFILE.skills.map((skill) => (
              <li key={skill} className="chip">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t border-border pt-4 text-xs text-muted">
          Prefer plain HTML?{" "}
          <a href="/safe-mode.html" className="inline-flex items-center gap-0.5 text-foreground underline-offset-2 hover:underline">
            Open safe mode
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </div>
  );
}
