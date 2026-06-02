export function formatChangeTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function propertyKey(property: string | symbol): string {
  return typeof property === "symbol" ? property.toString() : property;
}
