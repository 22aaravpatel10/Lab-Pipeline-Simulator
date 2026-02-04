# Overview

Throughput Architect is a minimalist Next.js application that models laboratory throughput by simulating pipelined plate schedules. It accepts a deterministic CSV workflow, calculates plate durations, and searches for the smallest stagger offset that eliminates MOVE Function collisions across a 156-plate run.

## Goals

- Provide a deterministic CSV-to-JSON parser (LLM-as-a-compiler analogy, but implemented as strict TypeScript logic).
- Simulate lab throughput without stochastic elements or AI inference.
- Visualize sequential vs pipelined makespans in a compact engineer-focused UI.
- Deliver a short, executive summary for a lead scientist.

## Phases Implemented

1. Deterministic Parser
   - Inputs: CSV with fixed columns.
   - Outputs: typed `LabWorkflowManifest` JSON.

2. Simulation Engine
   - Inputs: parsed tasks, plate count, stagger step.
   - Outputs: optimal stagger, makespans, collisions.

3. Claude-Minimal UI
   - Config tab: CSV entry + stacker toggles.
   - Visualizer tab: sequential vs pipelined timeline.
   - Terminal tab: raw JSON + lead scientist summary.

4. Explainer Loop
   - Deterministic text generation based on simulation results.

## Key Assumptions

- Each plate executes the same task sequence in the order provided by the CSV.
- CSV timestamps are used only to derive task durations; actual schedule is simulated deterministically with those durations.
- MOVE Function tasks are globally exclusive across all plates.
- Instrument Functions can overlap without constraint.
- When the Staubli arm is toggled off, simulation is suspended.

## Repository Map

- `src/app` — Next.js app routes, API endpoints, layout, and page.
- `src/components` — UI and feature components.
- `src/lib` — Core parsing, simulation, and utility logic.
- `docs` — Detailed documentation.
