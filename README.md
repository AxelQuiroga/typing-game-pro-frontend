# Code Typist Arcade — Frontend

A cyberpunk-themed typing game where programming words fall from the sky and you must type them before they hit the ground.

Built with **React 19 + TypeScript + Vite + Tailwind CSS v4**.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start typing.

> **Note:** The backend must be running on `http://localhost:3001` for score submission to work. Without it, the game runs in offline mode.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |

## Project Structure

```
src/
├── game/                    # Core game logic (framework-agnostic)
│   ├── types.ts             # Strict TypeScript interfaces
│   ├── constants.ts         # Game tuning + word bank
│   ├── wordPool.ts          # Word selection by difficulty
│   └── useGameEngine.ts     # Game loop, physics, scoring, combos
├── components/              # UI layer
│   ├── GameCanvas.tsx        # HTML5 Canvas renderer (60fps)
│   ├── GameHUD.tsx           # Score, lives, combo, active word
│   ├── StartScreen.tsx       # Nickname entry + instructions
│   └── GameOverScreen.tsx    # Stats + score submission + replay
├── services/
│   └── api.ts               # HTTP layer (isolated from game logic)
├── App.tsx                  # Phase orchestrator (start → play → gameover)
├── main.tsx                 # Entry point
└── index.css                # Tailwind + Cyberpunk theme
```

## Tech Stack

- **React 19** — UI library
- **TypeScript 7** — strict mode, no `any`
- **Vite 8** — build tool
- **Tailwind CSS 4** — utility-first styling
- **HTML5 Canvas** — game rendering at 60fps

## Architecture Decisions

- **`game/` is framework-agnostic** — The game engine uses React hooks but the core logic (types, constants, word pool) has zero React imports. Could be ported to Vue, Svelte, or vanilla JS.
- **Refs for game loop, not useState** — Words mutate in `useRef` at 60fps. `setState` only triggers for HUD updates. This avoids re-render cascades.
- **StrictMode intentionally omitted** — It causes double-renders that break `requestAnimationFrame` game loops.
- **API layer isolated** — All HTTP concerns live in `services/api.ts`. Swap the backend without touching game logic.

## Game Rules

1. Programming words fall from the top of the screen
2. Type the **first letter** of a word to target it
3. Complete the word before it reaches the danger zone
4. Build combos by completing words consecutively without missing
5. 3 lives — lose one for each word that reaches the bottom
6. Level up every 8 words cleared (speed increases)
