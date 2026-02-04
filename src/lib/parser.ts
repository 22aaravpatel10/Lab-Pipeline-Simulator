import { parseCsv } from "@/lib/csv";
import { parseTimeToSeconds } from "@/lib/time";
import type { LabWorkflowTask, ParsedWorkflow, TaskType } from "@/lib/types";

function normalizeTaskType(raw: string): TaskType {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "move function" || normalized.includes("move")) {
    return "MOVE_FUNCTION";
  }
  return "INSTRUMENT_FUNCTION";
}

export function parseWorkflowCsv(csvText: string): ParsedWorkflow {
  const rows = parseCsv(csvText);
  const warnings: string[] = [];

  const tasks: LabWorkflowTask[] = rows.map((row, index) => {
    const start = parseTimeToSeconds(row["Start Time"]);
    const end = parseTimeToSeconds(row["End Time"]);
    let duration = end - start;
    if (duration < 0) {
      warnings.push(
        `Row ${index + 2} has an end time earlier than start time; duration was clamped.`
      );
      duration = Math.abs(duration);
    }

    return {
      id: `task-${index + 1}`,
      name: row["Task Name"] || `Task ${index + 1}`,
      type: normalizeTaskType(row["Task Type"]),
      resource: row["Resource Used"] || "Unknown",
      duration_sec: Math.round(duration)
    };
  });

  return {
    manifest: { tasks },
    warnings
  };
}
