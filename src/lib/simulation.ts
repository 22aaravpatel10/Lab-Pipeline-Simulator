import type {
  CollisionPoint,
  LabWorkflowTask,
  SimulationConfig,
  SimulationResult
} from "@/lib/types";
import { isMoveFunction } from "@/lib/types";

interface TaskWindow extends LabWorkflowTask {
  start_sec: number;
  end_sec: number;
}

interface MoveInterval {
  start_sec: number;
  end_sec: number;
  plate: number;
  task: string;
}

function buildTimeline(tasks: LabWorkflowTask[]): TaskWindow[] {
  let cursor = 0;
  return tasks.map((task) => {
    const start = cursor;
    const end = start + task.duration_sec;
    cursor = end;
    return { ...task, start_sec: start, end_sec: end };
  });
}

function generateMoveIntervals(
  timeline: TaskWindow[],
  plates: number,
  staggerSec: number
): MoveInterval[] {
  const moveTasks = timeline.filter((task) => isMoveFunction(task));
  const intervals: MoveInterval[] = [];
  for (let plate = 0; plate < plates; plate += 1) {
    const offset = plate * staggerSec;
    for (const task of moveTasks) {
      intervals.push({
        start_sec: offset + task.start_sec,
        end_sec: offset + task.end_sec,
        plate,
        task: task.name
      });
    }
  }
  return intervals.sort((a, b) => a.start_sec - b.start_sec);
}

function detectCollisions(intervals: MoveInterval[]): CollisionPoint[] {
  const collisions: CollisionPoint[] = [];
  if (intervals.length === 0) return collisions;

  let active = intervals[0];
  for (let i = 1; i < intervals.length; i += 1) {
    const current = intervals[i];
    if (current.start_sec < active.end_sec) {
      collisions.push({
        time_sec: current.start_sec,
        plate_a: active.plate,
        plate_b: current.plate,
        task: current.task
      });
      if (current.end_sec > active.end_sec) {
        active = current;
      }
    } else {
      active = current;
    }
  }
  return collisions;
}

export function calculateOptimalPipelining(
  tasks: LabWorkflowTask[],
  config: SimulationConfig
): SimulationResult {
  const timeline = buildTimeline(tasks);
  const plateDurationSec = timeline.length
    ? timeline[timeline.length - 1].end_sec
    : 0;
  const sequentialMakespanSec = plateDurationSec * config.plates;

  let best: SimulationResult = {
    staggerSec: plateDurationSec,
    plateDurationSec,
    sequentialMakespanSec,
    pipelinedMakespanSec: plateDurationSec + plateDurationSec * (config.plates - 1),
    collisions: []
  };

  for (
    let stagger = 0;
    stagger <= plateDurationSec;
    stagger += config.staggerStepSec
  ) {
    const intervals = generateMoveIntervals(timeline, config.plates, stagger);
    const collisions = detectCollisions(intervals);
    if (collisions.length === 0) {
      const pipelinedMakespanSec =
        plateDurationSec + stagger * (config.plates - 1);
      return {
        staggerSec: stagger,
        plateDurationSec,
        sequentialMakespanSec,
        pipelinedMakespanSec,
        collisions
      };
    }

    if (stagger === 0 || collisions.length < best.collisions.length) {
      const pipelinedMakespanSec =
        plateDurationSec + stagger * (config.plates - 1);
      best = {
        staggerSec: stagger,
        plateDurationSec,
        sequentialMakespanSec,
        pipelinedMakespanSec,
        collisions
      };
    }
  }

  return best;
}
