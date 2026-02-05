"use client";

import type { SimulationResult } from "@/lib/types";

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
}

function TimelineRow({
    label,
    durationSec,
    maxSec,
    accent
}: {
    label: string;
    durationSec: number;
    maxSec: number;
    accent: string;
}) {
    const columns = 24;
    const span = Math.max(1, Math.round((durationSec / maxSec) * columns));
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>{label}</span>
                <span>{formatDuration(durationSec)}</span>
            </div>
            <div
                className="grid h-5 w-full rounded-full bg-neutral-100"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
                <div
                    className={`h-5 rounded-full ${accent}`}
                    style={{ gridColumn: `span ${span} / span ${span}` }}
                />
            </div>
        </div>
    );
}

interface TimelineViewProps {
    simulation: SimulationResult;
    compact?: boolean;
}

export function TimelineView({ simulation, compact = false }: TimelineViewProps) {
    return (
        <div className={`grid ${compact ? "gap-3" : "gap-4"}`}>
            <TimelineRow
                label="Sequential Run"
                durationSec={simulation.sequentialMakespanSec}
                maxSec={simulation.sequentialMakespanSec}
                accent="bg-neutral-300"
            />
            <TimelineRow
                label="Pipelined Run"
                durationSec={simulation.pipelinedMakespanSec}
                maxSec={simulation.sequentialMakespanSec}
                accent="bg-terracotta"
            />
            {!compact && (
                <div className="grid gap-1 text-sm text-neutral-600">
                    <p>
                        Optimal stagger: <strong>{simulation.staggerSec}s</strong>
                    </p>
                    <p>
                        Plate workflow duration:{" "}
                        <strong>{formatDuration(simulation.plateDurationSec)}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}

export { formatDuration };
