import type { ChangeRecord, ResolvedOptions } from "./types.js";

const historyByTarget = new WeakMap<
  object,
  Map<string | symbol, ChangeRecord[]>
>();
const optionsByTarget = new WeakMap<object, ResolvedOptions>();
const targetByProxy = new WeakMap<object, object>();

/** Resolve a proxy (or raw target) to the underlying tracked object. */
export function resolveTarget(obj: object): object {
  return targetByProxy.get(obj) ?? obj;
}

/** Link a proxy to its target for later lookups. */
export function linkProxy(proxy: object, target: object): void {
  targetByProxy.set(proxy, target);
}

export function unlinkProxy(proxy: object): void {
  targetByProxy.delete(proxy);
}

export function initTracking(
  target: object,
  options: ResolvedOptions
): void {
  historyByTarget.set(target, new Map());
  optionsByTarget.set(target, options);
}

export function getHistory(
  target: object
): Map<string | symbol, ChangeRecord[]> | undefined {
  return historyByTarget.get(target);
}

export function requireHistory(
  target: object
): Map<string | symbol, ChangeRecord[]> {
  const history = historyByTarget.get(target);
  if (!history) {
    throw new Error(
      "[WhyNotJS] Object is not tracked. Did you forget to call track(obj)?"
    );
  }
  return history;
}

export function clearHistory(
  target: object,
  property?: string | symbol
): void {
  const history = historyByTarget.get(target);
  if (!history) return;

  if (property !== undefined) {
    history.delete(property);
  } else {
    history.clear();
  }
}

export function disposeTracking(target: object, proxy?: object): void {
  historyByTarget.delete(target);
  optionsByTarget.delete(target);
  if (proxy) unlinkProxy(proxy);
}
