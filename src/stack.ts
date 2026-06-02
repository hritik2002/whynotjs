import { INTERNAL_STACK_MARKERS } from "./constants.js";
import type { SourceInfo } from "./types.js";

/** `at fn (path:line:col)` — path may contain colons (`file://…`) */
const STACK_FRAME_NAMED =
  /at (?:async )?(.+?) \((.+):(\d+):(\d+)\)/;

/** `at path:line:col` — top-level / module body */
const STACK_FRAME_BARE = /at (.+):(\d+):(\d+)/;

function isInternalFrame(line: string): boolean {
  return INTERNAL_STACK_MARKERS.some((marker) => line.includes(marker));
}

function parseStackLine(line: string): SourceInfo | null {
  const named = STACK_FRAME_NAMED.exec(line);
  if (named) {
    const [, fn, path, lineStr, colStr] = named;
    return {
      file: path.split("/").pop() ?? path,
      line: Number.parseInt(lineStr, 10),
      column: Number.parseInt(colStr, 10),
      fn: fn ?? null,
      path,
    };
  }

  const bare = STACK_FRAME_BARE.exec(line);
  if (!bare) return null;

  const [, path, lineStr, colStr] = bare;
  return {
    file: path.split("/").pop() ?? path,
    line: Number.parseInt(lineStr, 10),
    column: Number.parseInt(colStr, 10),
    fn: null,
    path,
  };
}

/**
 * Parse a stack trace and return the first non-internal call site.
 * Relies on `new Error().stack` — no bundler plugin required.
 */
export function parseCallSite(stack: string): SourceInfo | null {
  const frames = stack.split("\n").slice(1);

  for (const raw of frames) {
    const line = raw.trim();
    if (isInternalFrame(line)) continue;

    const site = parseStackLine(line);
    if (site) return site;
  }

  return null;
}

/** Capture the current call stack as a string. */
export function captureStack(): string {
  return new Error().stack ?? "";
}
