import { z } from "zod";

// Zod Schemas for validation
export const TaskTypeSchema = z.enum(["MOVE_FUNCTION", "INSTRUMENT_FUNCTION"]);

export const LabWorkflowTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: TaskTypeSchema,
  resource: z.string(),
  duration_sec: z.number().nonnegative()
});

export const LabWorkflowManifestSchema = z.object({
  tasks: z.array(LabWorkflowTaskSchema)
});

export const ParsedWorkflowSchema = z.object({
  manifest: LabWorkflowManifestSchema,
  warnings: z.array(z.string())
});

export const SimulationConfigSchema = z.object({
  plates: z.number().positive(),
  staggerStepSec: z.number().positive()
});

export const CollisionPointSchema = z.object({
  time_sec: z.number(),
  plate_a: z.number(),
  plate_b: z.number(),
  task: z.string()
});

export const SimulationResultSchema = z.object({
  staggerSec: z.number(),
  plateDurationSec: z.number(),
  sequentialMakespanSec: z.number(),
  pipelinedMakespanSec: z.number(),
  collisions: z.array(CollisionPointSchema)
});

// TypeScript types inferred from Zod schemas
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type LabWorkflowTask = z.infer<typeof LabWorkflowTaskSchema>;
export type LabWorkflowManifest = z.infer<typeof LabWorkflowManifestSchema>;
export type ParsedWorkflow = z.infer<typeof ParsedWorkflowSchema>;
export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;
export type CollisionPoint = z.infer<typeof CollisionPointSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// Helper to check if a task is a MOVE_FUNCTION (triggers collision detection)
export function isMoveFunction(task: LabWorkflowTask): boolean {
  return task.type === "MOVE_FUNCTION";
}
