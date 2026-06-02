import { DEFAULT_OPTIONS } from "./constants.js";
import type { ResolvedOptions, WhyNotOptions } from "./types.js";

export function resolveOptions(options?: WhyNotOptions): ResolvedOptions {
  return { ...DEFAULT_OPTIONS, ...options };
}

export function shouldTrackProperty(
  property: string | symbol,
  options: ResolvedOptions
): boolean {
  if (options.watch.length > 0) {
    return options.watch.includes(property);
  }

  const key =
    typeof property === "symbol" ? property.toString() : property;

  return !options.ignore.some((pattern) =>
    pattern instanceof RegExp ? pattern.test(key) : pattern === key
  );
}
