import type { ResolvedOptions } from "./types.js";

export const PACKAGE_NAME = "whynotjs";

export const DEFAULT_OPTIONS: ResolvedOptions = {
  maxHistory: 50,
  onchange: () => {},
  verbose: false,
  ignore: [],
  watch: [],
};

/**
 * Stack frame substrings to skip when resolving a mutation call site.
 * Avoid matching bare package name — project dirs are often named after the package.
 */
export const INTERNAL_STACK_MARKERS = [
  `${PACKAGE_NAME}/dist/`,
  `node_modules/${PACKAGE_NAME}/`,
  "<anonymous>",
  "Proxy.<anonymous>",
] as const;

export const CONSOLE_STYLES = {
  label: "color:#7c3aed;font-weight:bold",
  muted: "color:#6b7280;font-size:0.85em",
  inherit: "color:inherit",
} as const;
