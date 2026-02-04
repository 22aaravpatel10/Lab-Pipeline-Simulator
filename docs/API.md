# API

This application exposes two server routes under the Next.js App Router.

## POST /api/parse-workflow

### Purpose

Parse a raw CSV string into a typed `LabWorkflowManifest`.

### Request

```json
{ "csv": "Task Name,Task Type,..." }
```

### Response (Success)

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

### Response (Error)

```json
{ "error": "Missing required columns: Start Time" }
```

### Error Conditions

- Missing required CSV columns.
- Invalid time formats in `Start Time` or `End Time`.
- Empty CSV payload.

## POST /api/explain

### Purpose

Generate a deterministic 3-sentence summary for a lead scientist.

### Request

```json
{
  "tasks": [
    {
      "id": "task-1",
      "name": "Pick Plate",
      "type": "MOVE_FUNCTION",
      "resource": "Staubli TX-60",
      "duration_sec": 25
    }
  ],
  "staggerSec": 45,
  "sequentialMakespanSec": 20100,
  "pipelinedMakespanSec": 5600
}
```

### Response (Success)

```json
{
  "summary": "By pipelining these 156 plates with a 45-second stagger, we reduced ..."
}
```

### Response (Error)

```json
{ "error": "Explain error" }
```

## Notes

- The explain endpoint does not use an LLM. It is deterministic.
- The caller is responsible for supplying correct inputs.
