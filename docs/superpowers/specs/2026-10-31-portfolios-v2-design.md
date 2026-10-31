# portfoliOS v2 – Design-Spec

Datum: 2026-10-31
Status: umgesetzt in Branch `feat/portfolios-v2`

## 1. Ziel

Das bestehende OS-Portfolio (Desktop mit Fenstern/Dock, Mobile mit Lockscreen/Homescreen)
auf das Niveau eines glaubwürdigen, polierten Betriebssystems heben, ohne das Konzept,
die Inhalte oder die neutrale Gestaltung zu verändern. Mobile und Desktop gleichwertig.

Nicht-Ziele: CMS, Backend, Analytics, neue Inhalte (Texte bleiben), Next-16-Migration.

## 2. Befund (Ist)

| Bereich | Problem |
|---|---|
| Theme | Dark Mode wird nur angewendet, wenn das Settings-Fenster geöffnet wird; kein System-Modus; Flash beim Laden |
| Canvas | Zeichnung geht bei Resize und Theme-Wechsel verloren (Canvas wird neu gefüllt); Hintergrund hart `#fff`/`#000` statt Theme-Farbe |
| Fenster | Kein Minimieren/Maximieren, kein Fokus-Zustand, feste Startpositionen (150/100 + Kaskade), kein Hintergrund (nur Blur) |
| Desktop | Keine Menüleiste, keine Uhr, keine Tastaturkürzel, Stift-Palette schwebt beliebig |
| Mobile | Keine Statusleiste, keine Safe-Area-Behandlung, App-Vollbild ohne Titel/Schließen-Button, alle Icons identisch |
| Daten | Projekte per Client-Fetch (`Load...`-Flackern); Pages-API neben App-Router |
| Musik | Audio-Element lebt im Fenster: Fenster schließen stoppt Musik |
| Deps | `framer-motion` 11 und `motion` 12 parallel; `three`, `nodemailer`, `magicui/*`, `Inter` ungenutzt |
| Meta | `og-image.png` referenziert, existiert nicht; README ist das Template |

## 3. Architektur

```
app/
  layout.tsx            Fonts, Metadata, No-Flash-Theme-Script, Provider
  page.tsx              Server Component: lädt Projekte (fs) → <OS projects />
  opengraph-image.tsx   generiertes OG-Bild (next/og)
  api/projects          Route Handler (App Router), ersetzt pages/api
components/
  os/OS.tsx             Client: Viewport-Switch, Provider-Stack
  os/desktop/*          DesktopView, MenuBar, Window, Dock, Wallpaper, DrawingCanvas, CommandPalette
  os/mobile/*           MobileView, LockScreen, StatusBar, HomeScreen, AppSheet
  apps/*                AboutApp, ProjectsApp, ContactApp, SettingsApp, MusicApp, TerminalApp
config/apps.tsx         App-Registry: id, title, icon, tint, component, sizes
lib/
  preferences.tsx       Theme (light/dark/system), Akzentfarbe → localStorage + CSS-Variablen
  music.tsx             globaler Audio-Player (überlebt Fensterschließen)
  projects.ts           Typen + fs-Loader (server-only)
  windowManager.ts      reiner Reducer für Fensterzustand (testbar)
  terminal.ts           reiner Command-Interpreter (testbar)
  strokes.ts            Stroke-Store für den Canvas (testbar)
```

Prinzip: Zustand und Logik in reinen Modulen (`lib/`), Komponenten rendern nur.
Alle Apps werden auf Desktop und Mobile aus derselben Registry gerendert.

## 4. Desktop

- **Menüleiste** oben (28 px): Wordmark, aktiver App-Name, rechts Uhr, Now-Playing-Hinweis, Theme-Toggle, Suche (⌘K).
- **Fenster**: Titelleiste frosted (`surface/82` + Blur), Inhalt opak (sonst geistert Text überlappender
  Fenster durch), Traffic-Light-Buttons (schließen, minimieren, maximieren),
  Doppelklick auf Titel = maximieren, aktives Fenster mit stärkerem Schatten, inaktive leicht gedimmt.
  Startposition: erstes Fenster zentriert im Arbeitsbereich, weitere kaskadiert um 32 px.
  Positionen werden bei Viewport-Resize geklemmt.
- **Dock**: Icons mit Tint, Punkt für „läuft“, Klick auf minimiertes Fenster stellt es wieder her,
  Klick auf aktives Fenster minimiert es (macOS-Verhalten), Tooltip.
- **Command Palette** (⌘K / Ctrl+K): Apps öffnen, Projekte öffnen, Aktionen (Theme, Canvas leeren, Safe Mode, GitHub).
- **Zeichnen**: Canvas transparent über CSS-Wallpaper; Striche als Daten gespeichert und bei Resize/Theme
  neu gezeichnet; Palette am linken Rand (unterhalb der Fenster-Ebene, einklappbar) mit Farbvorgaben,
  drei Stärken, Radierer, Undo, Leeren.
- **Tastatur**: ⌘W/Ctrl+W schließt Fokus-Fenster, Esc schließt Palette.

## 5. Mobile

- **Lockscreen**: große Uhr, Datum, Wallpaper, Swipe-up (bleibt), Safe-Mode-Link.
- **Statusleiste**: Uhr links, Theme-Toggle rechts; liegt über Lockscreen und App-Sheets; Safe-Area-Insets via `env()`.
- **Homescreen**: Grid mit getönten App-Icons, Dock mit vier Apps unten.
- **App-Sheet**: eigener Header (Titel, „Done“), Inhalt scrollbar, Home-Indicator schließt per Swipe.

## 6. Gemeinsam

- Theme: `light | dark | system`, vor dem ersten Paint per Inline-Script gesetzt (kein Flash).
- Akzentfarbe: sechs Vorgaben in Settings, wirkt auf Fokus, Links, Terminal-Prompt, Wallpaper-Töne.
- Reduced Motion: `MotionConfig reducedMotion="user"`.
- Terminal-App: `help, about, projects, open <n>, skills, contact, theme, neofetch, clear, exit`.
- Projekte: JSON um `tags`, `year`, `status` erweitert; Server-seitig geladen.

## 7. Tests

Vitest für reine Logik: `windowManager`, `terminal`, `strokes`, `commandSearch` (30 Tests).
Verifikation: `npm run typecheck`, `npm run lint`, `npm run build`, headless Chrome-Durchlauf
(Desktop 1440×900 und 1024×700, Mobile 390×844 mit Touch-Gesten) ohne Konsolenfehler.

## 8. Entfernt

`framer-motion` (ersetzt durch `motion`), `three`, `@types/three`, `nodemailer`, `@types/nodemailer`,
`react-markdown`, `gray-matter`, `components/magicui/*`, `BlogContent` + `pages/api/notes` (Notes war
bereits deaktiviert; die Markdown-Inhalte unter `features/notes/content` bleiben erhalten),
`lib/linkPreview.ts` (ungenutzt), Font `Inter` (ungenutzt).

Nachträglich (31.10.2026): Kontaktformular samt `app/api/contact` und `resend` entfernt. Die Mail-App
zeigt stattdessen die direkten Kanäle (E-Mail, GitHub, LinkedIn); kein Server-Secret mehr nötig.
