import { recordChange } from "./record.js";
import { resolveOptions, shouldTrackProperty } from "./options.js";
import {
  initTracking,
  linkProxy,
  resolveTarget,
} from "./store.js";
import type { WhyNotOptions } from "./types.js";

function createHandler(options: ReturnType<typeof resolveOptions>) {
  return {
    set(
      target: object,
      property: string | symbol,
      value: unknown,
      receiver: unknown
    ): boolean {
      const oldValue = Reflect.get(target, property, receiver);

      if (!shouldTrackProperty(property, options)) {
        return Reflect.set(target, property, value, receiver);
      }

      const ok = Reflect.set(target, property, value, receiver);
      if (ok && oldValue !== value) {
        recordChange(target, property, oldValue, value, options);
      }
      return ok;
    },

    deleteProperty(target: object, property: string | symbol): boolean {
      if (!shouldTrackProperty(property, options)) {
        return Reflect.deleteProperty(target, property);
      }

      const oldValue = Reflect.get(target, property);
      const ok = Reflect.deleteProperty(target, property);
      if (ok) {
        recordChange(target, property, oldValue, undefined, options);
      }
      return ok;
    },
  } satisfies ProxyHandler<object>;
}

/**
 * Wrap an object in a tracking Proxy.
 *
 * @example
 * const user = track({ name: "Hritik", age: 25 });
 * user.name = "John";
 * why(user, "name"); // → WhyReport
 */
export function track<T extends object>(
  obj: T,
  options?: WhyNotOptions
): T {
  const resolved = resolveOptions(options);
  const target = resolveTarget(obj as object) as T;

  initTracking(target, resolved);

  const proxy = new Proxy(target, createHandler(resolved));
  linkProxy(proxy, target);

  return proxy as T;
}
