import { CONSOLE_STYLES } from "./constants.js";
import { formatChangeTime } from "./format.js";
import { captureStack, parseCallSite } from "./stack.js";
import { getHistory } from "./store.js";
import type { ChangeRecord, ResolvedOptions } from "./types.js";

function appendChange(
  existing: ChangeRecord[],
  entry: ChangeRecord,
  maxHistory: number
): ChangeRecord[] {
  const next =
    existing.length >= maxHistory
      ? [...existing.slice(1), entry]
      : [...existing, entry];

  return next.map((record, index) => ({ ...record, index: index + 1 }));
}

function logVerboseChange(
  property: string | symbol,
  oldValue: unknown,
  newValue: unknown,
  entry: ChangeRecord
): void {
  const location = entry.source
    ? `${entry.source.file}:${entry.source.line}`
    : "unknown source";

  console.group(
    `%c[WhyNotJS]%c .${String(property)} changed  %c${location}`,
    CONSOLE_STYLES.label,
    CONSOLE_STYLES.inherit,
    CONSOLE_STYLES.muted
  );
  console.log("Old →", oldValue);
  console.log("New →", newValue);
  console.log("Time:", entry.time);
  console.groupEnd();
}

/** Record a mutation on a tracked target and notify listeners. */
export function recordChange(
  target: object,
  property: string | symbol,
  oldValue: unknown,
  newValue: unknown,
  options: ResolvedOptions
): void {
  const history = getHistory(target);
  if (!history) return;

  const previous = history.get(property) ?? [];
  const stack = captureStack();
  const now = new Date();

  const entry: ChangeRecord = {
    index: previous.length + 1,
    property,
    oldValue,
    newValue,
    timestamp: now.toISOString(),
    time: formatChangeTime(now),
    source: parseCallSite(stack),
    stack,
  };

  history.set(property, appendChange(previous, entry, options.maxHistory));

  if (options.verbose) {
    logVerboseChange(property, oldValue, newValue, entry);
  }

  options.onchange(entry);
}
