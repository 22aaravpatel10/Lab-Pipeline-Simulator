# Simulation Engine

The simulation engine deterministically finds the smallest stagger offset between plates that yields zero MOVE collisions across the full run.

## Source File

- `src/lib/simulation.ts`

## Inputs

- `tasks: LabWorkflowTask[]` — A single-plate workflow.
- `config.plates: number` — Total plates in the run. Default UI uses 12 stackers × 13 plates = 156.
- `config.staggerStepSec: number` — Increment used when searching for a valid stagger (UI default: 10 seconds).

## Key Concepts

### Single-Plate Timeline

The CSV-derived tasks are executed sequentially for a single plate. The engine derives `start_sec` and `end_sec` for each task by cumulatively summing durations.

### MOVE Intervals

Only MOVE tasks are globally exclusive. The engine builds a list of all MOVE intervals for all plates, offset by `plate * stagger`.

### Collision Definition

A collision occurs if any MOVE interval overlaps another MOVE interval at any time. The algorithm checks for overlap by sorting intervals and scanning in order:

- If `current.start < active.end`, there is a collision.

### Makespans

- Sequential makespan = `plateDurationSec * plates`.
- Pipelined makespan = `plateDurationSec + stagger * (plates - 1)`.

## Algorithm Steps

1. Build per-plate timeline from tasks.
2. Compute `plateDurationSec`.
3. Iterate stagger candidates from `0` to `plateDurationSec` at `staggerStepSec` increments.
4. For each stagger:
   - Generate MOVE intervals for all plates.
   - Detect collisions by scanning sorted intervals.
   - If no collisions, return this stagger as optimal.
5. If no collision-free stagger is found, return the candidate with the fewest collisions.

## Complexity

Let:

- `P` = number of plates (156)
- `M` = number of MOVE tasks per plate

Intervals created: `P * M`

Collision check: sorting `O(P*M log(P*M))` and a linear scan.

This is efficient for typical lab workflows where `M` is small.

## Determinism

All calculations are deterministic, using plain TypeScript logic. No stochasticity, external calls, or inference.
