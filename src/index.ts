export type {
  ChangeRecord,
  SourceInfo,
  WhyNotOptions,
  WhyReport,
} from "./types.js";

export { track } from "./track.js";
export { print, reset, untrack, why, whyAll } from "./inspect.js";

import { print, reset, untrack, why, whyAll } from "./inspect.js";
import { track } from "./track.js";

const WhyNotJS = { track, why, whyAll, reset, untrack, print };
export default WhyNotJS;
