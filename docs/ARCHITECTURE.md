# Architecture

This document describes the runtime architecture of the application, including the main modules and their responsibilities.

## High-Level Data Flow

1. User provides CSV in the Config view.
2. Frontend calls `POST /api/parse-workflow` to parse and validate CSV.
3. Parsed `LabWorkflowManifest` is stored in client state.
4. Frontend runs deterministic simulation locally using `calculateOptimalPipelining`.
5. Frontend calls `POST /api/explain` to produce a lead-scientist summary.
6. UI renders visual comparisons and raw output.

## Module Responsibilities

### Frontend

- `src/components/throughput-dashboard.tsx`
  - Orchestrates parsing, simulation, and API calls.
  - Holds UI state for stackers, arm status, parsed manifest, and simulation results.
  - Renders the three primary views (Config, Visualizer, Terminal).

- `src/components/ui/*`
  - Lightweight UI primitives inspired by Shadcn style.
  - Button, card, tabs, input, textarea, switch, table.
  - All components are dependency-light and use Tailwind for styling.

### Backend (Next.js App Router)

- `src/app/api/parse-workflow/route.ts`
  - Receives CSV payload and invokes the deterministic parser.
  - Returns JSON with `manifest` and `warnings`.
  - Returns 400 with error details on failures.

- `src/app/api/explain/route.ts`
  - Receives simulation result fields and tasks.
  - Returns a deterministic 3-sentence summary.

### Core Library

- `src/lib/parser.ts`
  - Converts CSV rows into `LabWorkflowManifest`.
  - Uses `parseTimeToSeconds` to compute `duration_sec`.
  - Normalizes task type based on input string.

- `src/lib/simulation.ts`
  - Builds a single-plate timeline with start/end offsets.
  - Generates MOVE intervals for all plates.
  - Detects collisions by scanning sorted intervals.
  - Returns the smallest stagger with zero collisions.

- `src/lib/explainer.ts`
  - Creates the deterministic lead scientist summary.
  - Selects the longest Instrument Function as bottleneck.

## Styling System

- Tailwind is configured in `tailwind.config.ts`.
- The theme uses a light “engineer-chic” palette:
  - Background: `paper` (#F9F9F9)
  - Text: `ink` (#111111)
  - Accent: `terracotta` (#D97757)
- Fonts via Next.js: IBM Plex Sans and Space Grotesk.
