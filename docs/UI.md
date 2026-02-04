# UI

The UI follows a “Claude‑Minimal” engineer-chic aesthetic: light backgrounds, terracotta accent, compact layouts, and a focus on useful information density.

## Entry Point

- `src/app/page.tsx` renders the top-level layout and the `ThroughputDashboard` component.

## Main Component

- `src/components/throughput-dashboard.tsx`
  - Owns all UI state and interactions.
  - Tabs: Config, Visualizer, Terminal.
  - Calls parser and explainer endpoints.
  - Runs simulation locally.

## Views

### Config

- CSV Textarea with a prefilled example.
- Parse button triggers `POST /api/parse-workflow`.
- Stacker table shows 12 stackers and toggles their active plates.
- Staubli arm switch enables/disables simulation.

### Visualizer

- Horizontal CSS Grid bars for sequential vs pipelined makespans.
- Displays optimal stagger and per-plate duration.

### Terminal

- Monospace window showing the 3-sentence summary.
- Raw JSON output of `tasks` and `simulation` for debugging and inspection.
- Warns if collisions exist.

## Styling

- Tailwind utilities.
- Colors defined in `tailwind.config.ts`.
- Fonts loaded via `next/font/google` in `src/app/layout.tsx`:
  - IBM Plex Sans (body)
  - Space Grotesk (headings)

## UI Primitives

Under `src/components/ui`:

- `button.tsx` — Primary/ghost/outline variants.
- `card.tsx` — Card container with header/content.
- `tabs.tsx` — Simple local state tabs.
- `input.tsx` / `textarea.tsx` — Text inputs.
- `switch.tsx` — Toggle switch.
- `table.tsx` — Table wrappers.

These are intentionally lightweight, no external UI dependency required.
