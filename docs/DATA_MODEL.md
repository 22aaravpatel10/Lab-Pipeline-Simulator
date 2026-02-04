# Data Model

This document defines the core data structures used across parsing, simulation, and visualization.

## Types

### TaskType

`TaskType` is a strict union that encodes the two recognized categories of workflow tasks:

- `"MOVE_FUNCTION"`
- `"INSTRUMENT_FUNCTION"`

Defined in `src/lib/types.ts`.

### LabWorkflowTask

A single step in the workflow. Created by the deterministic parser and consumed by the simulation engine.

Fields:

- `id: string`
  - System-generated identifier. Current format: `task-{index}`.
- `name: string`
  - Human-readable task name from CSV `Task Name`.
- `type: TaskType`
  - Normalized task type.
- `resource: string`
  - Resource label from CSV `Resource Used`.
- `duration_sec: number`
  - Duration in seconds computed from CSV `Start Time` and `End Time`.

### LabWorkflowManifest

Container for all tasks in a parsed workflow.

Fields:

- `tasks: LabWorkflowTask[]`

### ParsedWorkflow

Return type of the parser endpoint.

Fields:

- `manifest: LabWorkflowManifest`
- `warnings: string[]`
  - Non-fatal warnings such as negative durations.

### SimulationConfig

Parameters used by the pipelining algorithm.

Fields:

- `plates: number` — Total number of plates to simulate.
- `staggerStepSec: number` — Increment size when searching for the stagger.

### CollisionPoint

Represents a MOVE collision between two plates.

Fields:

- `time_sec: number`
- `plate_a: number`
- `plate_b: number`
- `task: string`

### SimulationResult

Returned by `calculateOptimalPipelining`.

Fields:

- `staggerSec: number`
- `plateDurationSec: number`
- `sequentialMakespanSec: number`
- `pipelinedMakespanSec: number`
- `collisions: CollisionPoint[]`

## Semantics

- All durations are in seconds.
- All start/end offsets are computed from durations and CSV order, not from actual wall-clock time.
- `plateDurationSec` is the total time for a single plate workflow.
- `sequentialMakespanSec` is `plateDurationSec * plates`.
- `pipelinedMakespanSec` is `plateDurationSec + stagger * (plates - 1)`.
