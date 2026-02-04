type Row = Record<string, string>;

const REQUIRED_HEADERS = [
  "Task Name",
  "Task Type",
  "Resource Used",
  "Start Time",
  "End Time"
];

export function parseCsv(content: string): Row[] {
  const rows = parseCsvRows(content);
  if (rows.length === 0) return [];
  const headers = rows[0];
  const headerMap = headers.reduce<Record<string, number>>((acc, header, idx) => {
    acc[header.trim()] = idx;
    return acc;
  }, {});

  const missing = REQUIRED_HEADERS.filter((h) => headerMap[h] === undefined);
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }

  return rows.slice(1).map((cells) => {
    const row: Row = {};
    REQUIRED_HEADERS.forEach((header) => {
      const idx = headerMap[header];
      row[header] = (cells[idx] ?? "").trim();
    });
    return row;
  });
}

function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];
    if (char === "\"" && inQuotes && next === "\"") {
      cell += "\"";
      i += 1;
      continue;
    }
    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      current.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      current.push(cell);
      if (current.length > 1 || current[0] !== "") {
        rows.push(current);
      }
      current = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  current.push(cell);
  if (current.length > 1 || current[0] !== "") {
    rows.push(current);
  }
  return rows;
}
