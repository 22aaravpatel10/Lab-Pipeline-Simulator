"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const PLATES_PER_STACKER = 13;

export interface ResourceConfig {
    robot: { id: string; name: string; active: boolean };
    incubator: { id: string; name: string; active: boolean };
    stackers: Array<{ id: string; active: boolean; plates: number }>;
}

interface SettingsProps {
    resources: ResourceConfig;
    onResourcesChange: (resources: ResourceConfig) => void;
}

export default function Settings({ resources, onResourcesChange }: SettingsProps) {
    const toggleRobot = () => {
        onResourcesChange({
            ...resources,
            robot: { ...resources.robot, active: !resources.robot.active }
        });
    };

    const toggleIncubator = () => {
        onResourcesChange({
            ...resources,
            incubator: { ...resources.incubator, active: !resources.incubator.active }
        });
    };

    const toggleStacker = (stackerId: string) => {
        onResourcesChange({
            ...resources,
            stackers: resources.stackers.map((s) =>
                s.id === stackerId ? { ...s, active: !s.active } : s
            )
        });
    };

    const activePlates = resources.stackers
        .filter((s) => s.active)
        .reduce((sum, s) => sum + s.plates, 0);

    const activeStackers = resources.stackers.filter((s) => s.active).length;

    return (
        <div className="grid gap-6">
            {/* Global Assets */}
            <Card>
                <CardHeader>
                    <h2 className="font-display text-xl font-semibold">Global Assets</h2>
                </CardHeader>
                <CardContent className="grid gap-3">
                    {/* Robot Arm */}
                    <div
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${resources.robot.active
                                ? "border-neutral-200 bg-neutral-50"
                                : "border-amber-200 bg-amber-50"
                            }`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-neutral-700">
                                {resources.robot.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {resources.robot.active
                                    ? "Online — MOVE Function contention enabled"
                                    : "⚠️ Offline — Simulation paused"}
                            </p>
                        </div>
                        <Switch checked={resources.robot.active} onClick={toggleRobot} />
                    </div>

                    {/* Incubator */}
                    <div
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${resources.incubator.active
                                ? "border-neutral-200 bg-neutral-50"
                                : "border-amber-200 bg-amber-50"
                            }`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-neutral-700">
                                {resources.incubator.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {resources.incubator.active
                                    ? "Online — Instrument Function available"
                                    : "⚠️ Maintenance Mode"}
                            </p>
                        </div>
                        <Switch checked={resources.incubator.active} onClick={toggleIncubator} />
                    </div>
                </CardContent>
            </Card>

            {/* Stacker Grid */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-xl font-semibold">Stacker Grid</h2>
                        <span className="text-sm text-neutral-500">
                            {activeStackers}/12 active • {activePlates} plates
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {resources.stackers.map((stacker, index) => (
                            <div
                                key={stacker.id}
                                className={`rounded-xl border px-4 py-3 transition-colors ${stacker.active
                                        ? "border-neutral-200 bg-white"
                                        : "border-amber-200 bg-amber-50"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-700">
                                            Stacker {index + 1}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {stacker.active ? `${stacker.plates} plates` : "Maintenance"}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={stacker.active}
                                        onClick={() => toggleStacker(stacker.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                <span className="font-medium">Configuration Summary:</span>{" "}
                {activeStackers} of 12 stackers active •{" "}
                <span className="font-semibold text-terracotta">{activePlates} plates</span>{" "}
                ready for simulation
                {!resources.robot.active && (
                    <span className="ml-2 text-amber-600">• Robot offline</span>
                )}
                {!resources.incubator.active && (
                    <span className="ml-2 text-amber-600">• Incubator in maintenance</span>
                )}
            </div>
        </div>
    );
}

export function createDefaultResources(): ResourceConfig {
    return {
        robot: { id: "Staubli_TX60", name: "Staubli TX-60 (Robotic Arm)", active: true },
        incubator: { id: "Thermo_Incubator", name: "Thermo Incubator", active: true },
        stackers: Array.from({ length: 12 }, (_, i) => ({
            id: `Stacker_${i + 1}`,
            active: true,
            plates: PLATES_PER_STACKER
        }))
    };
}
