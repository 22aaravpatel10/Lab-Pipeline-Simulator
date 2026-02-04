# Deterministic CSV Parser

The parser converts a raw CSV into a strictly typed `LabWorkflowManifest`. It is deterministic and contains no inference or LLM behavior.

## Source Files

- `src/lib/csv.ts` — Low-level CSV parsing.
- `src/lib/time.ts` — Time parsing helper.
- `src/lib/parser.ts` — Workflow parser that builds the manifest.
- `src/app/api/parse-workflow/route.ts` — API endpoint.

## Required Columns

The CSV **must** contain these columns (case-sensitive):

- `Task Name`
- `Task Type`
- `Resource Used`
- `Start Time`
- `End Time`

If any are missing, the API returns HTTP 400 with a descriptive error.

## Task Type Normalization

`Task Type` values are normalized into `TaskType`:

- Values equal to `"MOVE Function"` or containing the substring `"move"` (case-insensitive) map to `MOVE_FUNCTION`.
- All other values map to `INSTRUMENT_FUNCTION`.

This keeps the parser resilient to slight CSV variations while still deterministic.

## Duration Calculation

- `Start Time` and `End Time` are converted to seconds using `parseTimeToSeconds`.
- `duration_sec = End - Start`.
- Negative durations are clamped to absolute value and recorded in `warnings`.

### Supported Time Formats

`parseTimeToSeconds` accepts:

- ISO timestamps (e.g., `2025-03-01T10:03:20Z`).
- `HH:MM` or `HH:MM:SS` (e.g., `00:05:30`).
- Numeric strings (treated as seconds).

If the format is unrecognized, parsing fails with an error.

## API Behavior

### Endpoint

`POST /api/parse-workflow`

### Request Body

```json
{ "csv": "Task Name,Task Type,..." }
```

### Success Response

```json
{
  "manifest": {
    "tasks": [
      {
        "id": "task-1",
        "name": "Pick Plate",
        "type": "MOVE_FUNCTION",
        "resource": "Staubli TX-60",
        "duration_sec": 25
      }
    ]
  },
  "warnings": []
}
```

### Error Response

```json
{ "error": "Missing required columns: Start Time" }
```
