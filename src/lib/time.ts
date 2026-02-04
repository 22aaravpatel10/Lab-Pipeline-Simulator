export function parseTimeToSeconds(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const iso = Date.parse(trimmed);
  if (!Number.isNaN(iso)) {
    return Math.floor(iso / 1000);
  }

  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const seconds = Number(timeMatch[3] ?? 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  throw new Error(`Unrecognized time format: ${value}`);
}
