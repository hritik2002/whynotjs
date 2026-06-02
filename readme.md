# WhyNotJS

You're staring at a bug. Some property is wrong. You have no idea who changed it, when, or from where.

`console.log` everywhere. Breakpoints. `git blame` on a file that touches the object in 6 places. Thirty minutes later you find it.

**There's a better way.**

```ts
import { track, why } from "whynotjs";

const user = track({ name: "Hritik", age: 25 });

// …mutations happen across your entire codebase…

why(user, "name");
// Changed 2 times
//
// 1. Old → Hritik  New → John
//    Source: ProfileForm.tsx:24  (handleSubmit)
//    Time:   10:22 PM
//
// 2. Old → John    New → Jane
//    Source: UserSettings.tsx:87  (onSave)
//    Time:   10:45 PM
```

One line to opt in. No store. No actions. No boilerplate. Works on any plain JavaScript object.

---

## Install

```bash
npm install whynotjs
```

---

## How it works

WhyNotJS wraps your object in a native [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Every mutation fires the `set` trap, which captures an `Error` stack trace at that exact moment, parses out the call-site, and stores a `ChangeRecord` in a `WeakMap` keyed to your object.

```
track(obj)
  └─ new Proxy(obj, { set, deleteProperty })
       └─ mutation fires → new Error().stack
            └─ parse call-site  (file · line · col · fn)
                 └─ push ChangeRecord into WeakMap<target, Map<prop, history>>
                      └─ why(obj, prop)  reads it back
```

Four deliberate design decisions:

- **`WeakMap` as the store** — your object can be garbage-collected normally. No leaks, no cleanup required (unless you want it with `untrack`).
- **`Error.stack` for call-sites** — no bundler plugin, no source-map server, no build step. It's just a standard V8/SpiderMonkey stack trace, parsed at runtime.
- **`Reflect` alongside `Proxy`** — every trap delegates through `Reflect` so prototype chains, getters, and class instances all behave correctly.
- **No-op on identical values** — `obj.x = obj.x` records nothing. The guard is `oldValue !== newValue` before any write.

This is the same primitive Vue 3's `reactive()`, MobX, and Immer are built on. WhyNotJS just exposes the audit trail instead of hiding it.

---

## API

### `track(obj, options?)`

Wrap an object. Returns a Proxy — use it everywhere you'd use the original.

```ts
const user   = track({ name: "Hritik", age: 25 });
const config = track({ theme: "dark" }, { verbose: true });
```

| Option | Type | Default | Description |
|---|---|---|---|
| `maxHistory` | `number` | `50` | Sliding-window cap per property. Oldest records are evicted. |
| `onchange` | `(record: ChangeRecord) => void` | noop | Fires on every mutation. |
| `verbose` | `boolean` | `false` | Logs every change to the console automatically. |
| `ignore` | `Array<string \| RegExp>` | `[]` | Properties to skip. |
| `watch` | `Array<string \| symbol>` | `[]` | When set, only these properties are tracked. |

---

### `why(obj, property)`

Full change history for one property.

```ts
const report = why(user, "name");

report.count                       // 2
report.changes[0].oldValue         // "Hritik"
report.changes[0].newValue         // "John"
report.changes[0].source           // { file: "ProfileForm.tsx", line: 24, col: 14, fn: "handleSubmit" }
report.changes[0].time             // "10:22 PM"
report.changes[0].timestamp        // "2024-01-15T22:22:00.000Z"
```

---

### `whyAll(obj)`

History for every property at once.

```ts
const all = whyAll(user);
// { name: WhyReport, age: WhyReport }
```

---

### `print(obj, property)`

Pretty-prints to the console using `console.group`.

```ts
print(user, "name");
// [WhyNotJS] .name changed 2 times
//   1. 10:22 PM
//      Old → Hritik  /  New → John
//      ProfileForm.tsx:24 (handleSubmit)
//   2. 10:45 PM
//      Old → John  /  New → Jane
//      UserSettings.tsx:87 (onSave)
```

---

### `reset(obj, property?)`

Clear history for one property, or all of them.

```ts
reset(user, "name");   // clears .name only
reset(user);           // clears everything
```

---

### `untrack(obj)`

Stop tracking entirely and free the WeakMap entry.

```ts
untrack(user);
```

---

## Recipes

### React — debug a form without touching state

```tsx
import { useRef } from "react";
import { track, print } from "whynotjs";

function ProfileForm() {
  const user = useRef(track({ name: "", email: "" })).current;

  return (
    <input
      onChange={e => {
        user.name = e.target.value;       // tracked
        print(user, "name");              // log it any time
      }}
    />
  );
}
```

### Reactive callback — build a mini event system

```ts
const store = track(
  { status: "idle", retries: 0 },
  {
    onchange({ property, oldValue, newValue, source, time }) {
      logger.info(`[${time}] ${String(property)}: ${oldValue} → ${newValue}`, source);
    },
  }
);
```

### Audit trail — know exactly what your async code touched

```ts
const order = track({ status: "pending", total: 0 });

await processPayment(order);   // black box

print(order, "status");
// Changed 3 times:  pending → validating → charging → complete
// Each with source file + line
```

### Bounded history — keep only the last N changes

```ts
const sensor = track({ temp: 0 }, { maxHistory: 10 });

// Stream in 1000 readings — only the last 10 are kept
readings.forEach(r => (sensor.temp = r));

why(sensor, "temp").changes.length   // 10
```

### Ignore internals with a regex

```ts
const model = track(obj, { ignore: [/^_/, /^__/] });
// _id, __proto__, _rev — all ignored
// Only public properties are tracked
```

---

## TypeScript

Written in TypeScript. Full types included, no `@types/` package needed.

```ts
import type { ChangeRecord, WhyReport, WhyNotOptions, SourceInfo } from "whynotjs";
```

---

## Compatibility

Requires native `Proxy` (ES2015+). Cannot be polyfilled.

| Runtime | Minimum version |
|---|---|
| Node.js | 14 |
| Chrome / Edge | 49 |
| Firefox | 18 |
| Safari | 10 |

---

## License

MIT