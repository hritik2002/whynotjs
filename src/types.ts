export interface ChangeRecord {
  index: number;
  property: string | symbol;
  oldValue: unknown;
  newValue: unknown;
  timestamp: string;
  time: string;
  source: SourceInfo | null;
  stack: string;
}

export interface SourceInfo {
  file: string;
  line: number;
  column: number;
  fn: string | null;
  path: string;
}

export interface WhyReport {
  property: string | symbol;
  count: number;
  changes: ChangeRecord[];
}

export interface WhyNotOptions {
  maxHistory?: number;
  onchange?: (record: ChangeRecord) => void;
  /**
   * When true, logs every change to the console automatically.
   * @default false
   */
  verbose?: boolean;
  ignore?: Array<string | RegExp>;
  /** When non-empty, only these properties are tracked. */
  watch?: Array<string | symbol>;
}

export type ResolvedOptions = Required<WhyNotOptions>;
