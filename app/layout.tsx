import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PROFILE } from "@/config/profile";
import { MusicProvider } from "@/lib/music";
import { PreferencesProvider } from "@/lib/preferences";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.links.site),
  title: {
    default: "Portfolio | Kevin Tamme - Frontend Entwickler Frankfurt, React, UI/UX, TypeScript",
    template: "%s | Kevin Tamme - Frontend Entwickler Frankfurt",
  },
  description:
    "Portfolio von Kevin Tamme, Frontend Entwickler aus Frankfurt am Main. Spezialisiert auf React, Next.js, TypeScript und UI/UX Design. Entdecken Sie Projekte, Blog, Learnings und Kontaktmöglichkeiten.",
  keywords: [
    "Frontend Entwickler Frankfurt",
    "React Entwickler",
    "Next.js Portfolio",
    "TypeScript Projekte",
    "UI/UX Design",
    "Webentwicklung",
    "Kevin Tamme",
    "Portfolio",
    "Projekte",
    "Kontakt",
    "Web Developer Germany",
    "Modern Web Design",
  ],
  authors: [{ name: PROFILE.name }],
  creator: PROFILE.name,
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: PROFILE.links.site,
    title: "PortfoliOS | Kevin Tamme - Frontend-Entwickler",
    description: "Ein interaktives Portfolio im Stil eines Betriebssystems.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfoliOS | Kevin Tamme - Frontend-Entwickler",
    description: "Ein interaktives Portfolio im Stil eines Betriebssystems.",
    creator: "@warumkev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2f4" },
    { media: "(prefers-color-scheme: dark)", color: "#17181c" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full`}>
        <PreferencesProvider>
          <MusicProvider>{children}</MusicProvider>
        </PreferencesProvider>
        <noscript>
          <div className="fixed inset-x-0 bottom-0 z-[200] bg-surface p-4 text-center text-sm">
            This portfolio needs JavaScript.{" "}
            <a href="/safe-mode.html" className="underline">
              Open the plain HTML version
            </a>
            .
          </div>
        </noscript>
      </body>
    </html>
  );
}
