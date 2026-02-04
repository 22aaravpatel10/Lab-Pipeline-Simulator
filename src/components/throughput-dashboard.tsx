"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateOptimalPipelining } from "@/lib/simulation";
import type {
  LabWorkflowTask,
  ParsedWorkflow,
  SimulationResult
} from "@/lib/types";

const DEFAULT_CSV = `Task Name,Task Type,Resource Used,Start Time,End Time
Pick Plate,MOVE Function,Staubli TX-60,00:00:00,00:00:25
Load Incubator,MOVE Function,Staubli TX-60,00:00:25,00:00:55
Incubate A,Instrument Function,Incubator A,00:00:55,00:05:55
Unload Incubator,MOVE Function,Staubli TX-60,00:05:55,00:06:20
Plate Read,Instrument Function,Reader 01,00:06:20,00:09:40
Return Plate,MOVE Function,Staubli TX-60,00:09:40,00:10:10`;

const STAGGER_STEP_SEC = 10;
const STACKER_COUNT = 12;
const PLATES_PER_STACKER = 13;

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
    <div className="grid gap-3">
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>{label}</span>
        <span>{formatDuration(durationSec)}</span>
      </div>
      <div
        className="grid h-6 w-full rounded-full bg-neutral-100"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        <div
          className={`h-6 rounded-full ${accent}`}
          style={{ gridColumn: `span ${span} / span ${span}` }}
        />
      </div>
    </div>
  );
}

export default function ThroughputDashboard() {
  const [csvText, setCsvText] = React.useState(DEFAULT_CSV);
  const [parsed, setParsed] = React.useState<ParsedWorkflow | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [stackers, setStackers] = React.useState(
    Array.from({ length: STACKER_COUNT }, () => true)
  );
  const [armOnline, setArmOnline] = React.useState(true);
  const [simulation, setSimulation] = React.useState<SimulationResult | null>(
    null
  );
  const [summary, setSummary] = React.useState<string>("");

  const plateCount = stackers.filter(Boolean).length * PLATES_PER_STACKER;

  const handleParse = async () => {
    setParseError(null);
    try {
      const response = await fetch("/api/parse-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to parse CSV");
      }
      setParsed(data);
    } catch (error) {
      setParsed(null);
      setSimulation(null);
      setSummary("");
      setParseError(error instanceof Error ? error.message : "Parse failed");
    }
  };

  React.useEffect(() => {
    if (!parsed || parsed.manifest.tasks.length === 0 || !armOnline) {
      setSimulation(null);
      setSummary("");
      return;
    }

    const result = calculateOptimalPipelining(parsed.manifest.tasks, {
      plates: plateCount || STACKER_COUNT * PLATES_PER_STACKER,
      staggerStepSec: STAGGER_STEP_SEC
    });
    setSimulation(result);

    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks: parsed.manifest.tasks,
        staggerSec: result.staggerSec,
        sequentialMakespanSec: result.sequentialMakespanSec,
        pipelinedMakespanSec: result.pipelinedMakespanSec
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {
        setSummary("");
      });
  }, [parsed, armOnline, plateCount]);

  const taskList: LabWorkflowTask[] = parsed?.manifest.tasks ?? [];

  return (
    <Tabs defaultValue="config">
      <TabsList>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
        <TabsTrigger value="terminal">Terminal</TabsTrigger>
      </TabsList>

      <TabsContent value="config">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">
                  Deterministic Parser
                </h2>
                <Button onClick={handleParse}>Parse CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-neutral-600">
                  Workflow CSV
                </label>
                <Textarea
                  value={csvText}
                  onChange={(event) => setCsvText(event.target.value)}
                />
              </div>
              {parseError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {parseError}
                </div>
              )}
              {parsed?.warnings.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {parsed.warnings.join(" ")}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-xl font-semibold">
                Lab Capacity
              </h2>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Staubli TX-60 Arm
                  </p>
                  <p className="text-xs text-neutral-500">
                    Enables MOVE Function contention checks
                  </p>
                </div>
                <Switch checked={armOnline} onClick={() => setArmOnline(!armOnline)} />
              </div>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Stacker</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Plates</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stackers.map((enabled, index) => (
                    <TableRow key={`stacker-${index}`}>
                      <TableCell className="font-medium">
                        Stacker {index + 1}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={enabled}
                          onClick={() => {
                            const next = [...stackers];
                            next[index] = !next[index];
                            setStackers(next);
                          }}
                        />
                      </TableCell>
                      <TableCell>{enabled ? PLATES_PER_STACKER : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                Active plates: <span className="font-semibold">{plateCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="visualizer">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                Pipelining Timeline
              </h2>
              <div className="text-sm text-neutral-500">
                Stagger step: {STAGGER_STEP_SEC}s
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            {simulation ? (
              <div className="grid gap-6">
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
                <div className="grid gap-2 text-sm text-neutral-600">
                  <p>
                    Optimal stagger: <strong>{simulation.staggerSec}s</strong>
                  </p>
                  <p>
                    Plate workflow duration:{" "}
                    <strong>{formatDuration(simulation.plateDurationSec)}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
                Parse a CSV to generate the pipelining timeline.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="terminal">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Terminal</h2>
              <Input
                value={`Plates: ${plateCount}`}
                readOnly
                className="max-w-[140px] text-center"
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-950 px-4 py-3 font-mono text-xs text-neutral-100">
              {summary || "Awaiting simulation output."}
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-900 px-4 py-3 font-mono text-xs text-neutral-200">
              {JSON.stringify(
                {
                  tasks: taskList,
                  simulation
                },
                null,
                2
              )}
            </div>
            {simulation?.collisions.length ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                Collision points: {simulation.collisions.length}. Earliest at{
                " "}
                {simulation.collisions[0].time_sec}s.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
