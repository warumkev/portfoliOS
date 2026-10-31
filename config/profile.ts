/**
 * Single source of truth for personal data shown across apps
 * (About, Terminal, Command Palette, OG image).
 */
export const PROFILE = {
  name: "Kevin Tamme",
  role: "Software Developer",
  location: "Frankfurt am Main",
  tagline: "Fast, private, free. Tools built out of necessity.",
  bio: [
    "We oftentimes get annoyed by enterprise bloatware, subscription models for basic features, and apps that seem to want my data more than anything else.",
    "My philosophy is that powerful tech shouldn't be expensive, and it definitely shouldn't be built to sell you out.",
    "So I build apps and tools that are fast, reliable, and respect your privacy - all while being free.",
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "TailwindCSS",
    "Swift",
    "Python",
    "Git",
    "Google Cloud",
    "Figma",
    "Adobe CC",
    "GenAI",
  ],
  links: {
    github: "https://github.com/warumkev",
    linkedin: "https://linkedin.com/in/kevin-tamme",
    email: "kevintamme@icloud.com",
    site: "https://www.kevintamme.com",
  },
  os: {
    name: "portfoliOS",
    version: "2.0",
    build: "2610.31",
  },
} as const;
