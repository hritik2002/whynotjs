import { CONSOLE_STYLES } from "./constants.js";
import { propertyKey } from "./format.js";
import {
  clearHistory,
  disposeTracking,
  requireHistory,
  resolveTarget,
} from "./store.js";
import type { ChangeRecord, WhyReport } from "./types.js";

function buildReport(
  property: string | symbol,
  changes: ChangeRecord[]
): WhyReport {
  return { property, count: changes.length, changes };
}

/**
 * Get the change history for a single property.
 */
export function why<T extends object>(
  obj: T,
  property: keyof T | string | symbol
): WhyReport {
  const target = resolveTarget(obj as object);
  const history = requireHistory(target);
  const prop = property as string | symbol;
  const changes = history.get(prop) ?? [];

  return buildReport(prop, changes);
}

/**
 * Get change history for every tracked property on an object.
 */
export function whyAll<T extends object>(
  obj: T
): Record<string, WhyReport> {
  const target = resolveTarget(obj as object);
  const history = requireHistory(target);
  const reports: Record<string, WhyReport> = {};

  for (const [prop, changes] of history) {
    reports[propertyKey(prop)] = buildReport(prop, changes);
  }

  return reports;
}

/** Clear change history for one property, or all properties when omitted. */
export function reset<T extends object>(
  obj: T,
  property?: keyof T | string | symbol
): void {
  const target = resolveTarget(obj as object);
  clearHistory(target, property as string | symbol | undefined);
}

/** Stop tracking an object and release its stored history. */
export function untrack<T extends object>(obj: T): void {
  const target = resolveTarget(obj as object);
  disposeTracking(target, obj as object);
}

function printChange(record: ChangeRecord): void {
  console.group(`${record.index}. ${record.time}`);
  console.log("Old →", record.oldValue);
  console.log("New →", record.newValue);

  if (record.source) {
    const { file, line, column, fn } = record.source;
    const fnLabel = fn ? ` (${fn})` : "";
    console.log(`Source: ${file}:${line}:${column}${fnLabel}`);
  }

  console.groupEnd();
}

/** Pretty-print the history of a property to the console. */
export function print<T extends object>(
  obj: T,
  property: keyof T | string | symbol
): void {
  const report = why(obj, property);
  const label = String(property);

  if (report.count === 0) {
    console.log(`[WhyNotJS] .${label} has never changed.`);
    return;
  }

  const times = report.count === 1 ? "time" : "times";
  console.group(
    `%c[WhyNotJS]%c .${label} changed ${report.count} ${times}`,
    CONSOLE_STYLES.label,
    CONSOLE_STYLES.inherit
  );

  for (const change of report.changes) {
    printChange(change);
  }

  console.groupEnd();
}
