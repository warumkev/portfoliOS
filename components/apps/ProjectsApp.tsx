"use client";

import { ArrowUpRight, Globe, Smartphone } from "lucide-react";
import { PROFILE } from "@/config/profile";
import { GitHubIcon } from "@/lib/brand-icons";
import { useOS } from "@/lib/os-context";
import type { Project } from "@/lib/types";

function ProjectCard({ project }: { project: Project }) {
  const Kind = project.kind === "app" ? Smartphone : Globe;
  return (
    <li className="group rounded-xl border border-border bg-surface-2/60 p-4 transition-colors hover:bg-surface-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            <Kind size={15} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="truncate">{project.title}</span>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{project.description}</p>
        </div>
      </div>
      {project.tags?.length ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag} className="chip bg-surface">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      {(project.liveUrl || project.githubUrl) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary h-8 px-3 text-xs"
            >
              Live site
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-8 px-3 text-xs"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              Source
            </a>
          )}
        </div>
      )}
    </li>
  );
}

export default function ProjectsApp() {
  const { projects } = useOS();
  return (
    <div className="app-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-7 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-muted">What I&apos;ve been working on.</p>
          </div>
          <a
            href={PROFILE.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary shrink-0"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </header>

        <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-foreground/85">
          <p>
            This isn&apos;t a &quot;portfolio&quot; in the traditional sense. This is my arsenal.
          </p>
          <p>
            Every app here was built out of personal necessity. Each one is a lean, free
            alternative to some bloated, overpriced, or privacy-invading tool that at some
            point annoyed me.
          </p>
          <p>
            No sign-ups. No creepy tracking. No feature-creep. Just code that solves a
            problem and then gets out of your way. Feel free to use them.
          </p>
        </div>

        <ul className="mt-8 grid gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ul>
      </div>
    </div>
  );
}
