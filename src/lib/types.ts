export type TaskType = "MOVE_FUNCTION" | "INSTRUMENT_FUNCTION";

export interface LabWorkflowTask {
  id: string;
  name: string;
  type: TaskType;
  resource: string;
  duration_sec: number;
}

export interface LabWorkflowManifest {
  tasks: LabWorkflowTask[];
}

export interface ParsedWorkflow {
  manifest: LabWorkflowManifest;
  warnings: string[];
}

export interface SimulationConfig {
  plates: number;
  staggerStepSec: number;
}

export interface CollisionPoint {
  time_sec: number;
  plate_a: number;
  plate_b: number;
  task: string;
}

export interface SimulationResult {
  staggerSec: number;
  plateDurationSec: number;
  sequentialMakespanSec: number;
  pipelinedMakespanSec: number;
  collisions: CollisionPoint[];
}
