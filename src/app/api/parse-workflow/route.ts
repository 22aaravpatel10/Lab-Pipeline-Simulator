import { NextResponse } from "next/server";
import { parseWorkflowCsv } from "@/lib/parser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const csv = typeof body?.csv === "string" ? body.csv : "";
    if (!csv.trim()) {
      return NextResponse.json(
        { error: "CSV payload is required." },
        { status: 400 }
      );
    }

    const parsed = parseWorkflowCsv(csv);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Parse error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
