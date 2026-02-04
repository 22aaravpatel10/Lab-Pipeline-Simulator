import type { LabWorkflowTask } from "@/lib/types";

interface ExplainerInput {
  tasks: LabWorkflowTask[];
  staggerSec: number;
  sequentialMakespanSec: number;
  pipelinedMakespanSec: number;
}

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}

export function buildLeadScientistSummary(input: ExplainerInput): string {
  const gainSec = input.sequentialMakespanSec - input.pipelinedMakespanSec;
  const gainPct = input.sequentialMakespanSec
    ? (gainSec / input.sequentialMakespanSec) * 100
    : 0;
  const bottleneck = input.tasks
    .filter((task) => task.type === "INSTRUMENT_FUNCTION")
    .sort((a, b) => b.duration_sec - a.duration_sec)[0];

  const bottleneckName = bottleneck?.resource || bottleneck?.name || "instrument";

  return (
    `By pipelining these 156 plates with a ${input.staggerSec}-second stagger, ` +
    `we reduced the total makespan by ${formatHours(gainSec)} hours ` +
    `(${gainPct.toFixed(1)}% gain). ` +
    `The bottleneck remains the ${bottleneckName} duration. ` +
    `Next, we can explore whether the MOVE queue or ${bottleneckName} capacity ` +
    `offers the highest leverage for additional throughput.`
  );
}
