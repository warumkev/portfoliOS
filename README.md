# portfoliOS

An interactive portfolio that behaves like an operating system. Desktop visitors get
windows, a dock, a menu bar, a command palette and a whiteboard; phones get a lock
screen, a home screen and full-screen apps. Same six apps, same content, two surfaces.

Live: https://www.kevintamme.com · Plain HTML fallback: `/safe-mode.html`

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 with design tokens in `app/globals.css`
- Motion for animation, Lucide for icons
- Vitest for the pure logic in `lib/`

## Structure

```
app/            layout, page (server-side project loading), OG image, API routes
components/os   OS shell: desktop/ (windows, dock, menu bar, palette, canvas) and mobile/
components/apps README, Projects, Mail, Terminal, Music, Settings
config/         app registry (config/apps.tsx) and personal data (config/profile.ts)
lib/            pure logic: window manager, terminal, strokes, command search, preferences
features/       content: project JSON files (and archived notes)
```

Adding an app: create a component in `components/apps`, register it in `config/apps.tsx`.
It shows up in the dock, the home screen, the command palette and the terminal automatically.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for lib/
npm run lint
npm run build
```

