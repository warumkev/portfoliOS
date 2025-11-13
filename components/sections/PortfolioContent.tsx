import React, { useState, useEffect } from "react";

// Define the structure of a project JSON object
export type ProjectJson = {
  title: string;
  description: string;
  liveUrl: string;
  githubUrl: string;
};

const PortfolioContent = () => {
  const [projects, setProjects] = useState<ProjectJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to load projects");
        const data = await res.json();
        setProjects(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="p-6 md:p-8 h-full flex flex-col min-w-[220px] min-h-0 w-full">
      <div className="flex flex-col items-start gap-6 mb-6">
        <div className="flex-1 text-left">
          <a className="font-medium mb-1">Projects.</a>
          <p className="text-muted">What I&apos;ve been working on.</p>
        </div>
        <div className="flex-1 text-left">
          <p className="text-muted">
            This isn&apos;t a &quot;portfolio&quot; in the traditional sense.
            <br />
            This is my arsenal.
            <br />
            <br />
            Every app here was built out of personal necessity. Each one is a
            lean, free alternative to some bloated, overpriced, or
            privacy-invading tool that at some point annoyed me.
            <br />
            <br />
            No sign-ups. No creepy tracking. No feature-creep. Just code that
            solves a problem and then gets out of your way. Feel free to use
            them.
          </p>
        </div>
      </div>

      <div className="px-3 mb-4 flex justify-end">
        <a
          href="https://github.com/warumkev"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-secondary text-muted rounded font-medium hover:bg-muted hover:text-secondary transition"
        >
          Visit my GitHub
        </a>
      </div>

      {loading && <div className="text-left text-muted">Load...</div>}
      {error && (
        <div className="text-destructive">
          Error when loading projects.
        </div>
      )}
      <ul className="flex flex-col gap-4 w-full">
        {projects.map((p) => (
          <li
            key={p.title}
            className="w-full rounded-xl shadow border border-border p-4 flex flex-col md:flex-row items-start md:items-center gap-4 transition bg-secondary hover:bg-background/25"
            role="button"
            aria-label={`Projekt öffnen: ${p.title}`}
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              window.open(p.liveUrl, "_blank")
            }
          >
            <div className="flex-1">
              <h3 className="font-medium text-primary mb-1">{p.title}</h3>
              <p className="text-muted mb-2">{p.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-primary text-secondary rounded hover:bg-muted hover:text-secondary transition"
              >
                Live
              </a>
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-secondary text-primary rounded hover:bg-muted hover:text-secondary transition"
                >
                  GitHub
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioContent;
