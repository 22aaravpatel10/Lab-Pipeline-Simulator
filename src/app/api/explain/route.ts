import { NextResponse } from "next/server";
import { buildLeadScientistSummary } from "@/lib/explainer";
import type { LabWorkflowTask } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tasks = (body?.tasks ?? []) as LabWorkflowTask[];
    const staggerSec = Number(body?.staggerSec ?? 0);
    const sequentialMakespanSec = Number(body?.sequentialMakespanSec ?? 0);
    const pipelinedMakespanSec = Number(body?.pipelinedMakespanSec ?? 0);

    const summary = buildLeadScientistSummary({
      tasks,
      staggerSec,
      sequentialMakespanSec,
      pipelinedMakespanSec
    });

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Explain error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
