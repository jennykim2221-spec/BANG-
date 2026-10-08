import { entries } from "../content/index.ts";
import { contentVersion } from "../content/sources.ts";
export const memory = new Map<string, unknown>();
export let storageUnavailable = false;
export function read<T>(
  key: string,
  fallback: T,
  valid: (v: unknown) => v is T,
): T {
  const cached = memory.get(key);
  if (memory.has(key) && valid(cached)) return cached;
  try {
    const raw = localStorage.getItem(`bang:v1:${key}`);
    if (!raw) return (memory.get(key) as T) ?? fallback;
    const data: unknown = JSON.parse(raw);
    return valid(data) ? data : fallback;
  } catch {
    storageUnavailable = true;
    return (memory.get(key) as T) ?? fallback;
  }
}
export function write(key: string, value: unknown) {
  memory.set(key, value);
  try {
    localStorage.setItem(`bang:v1:${key}`, JSON.stringify(value));
  } catch {
    storageUnavailable = true;
  }
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("bang-storage-change"));
}
export type RecordItem = { id: string; at: string };
export function validRecords(v: unknown): v is RecordItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (x) =>
        x &&
        typeof x.id === "string" &&
        entries.some((e) => e.id === x.id) &&
        typeof x.at === "string" &&
        !isNaN(Date.parse(x.at)),
    )
  );
}
export function records(key: string) {
  return read(key, [], validRecords).slice(0, key === "recent" ? 10 : 50);
}
export function remember(id: string) {
  write(
    "recent",
    [
      { id, at: new Date().toISOString() },
      ...records("recent").filter((x) => x.id !== id),
    ].slice(0, 10),
  );
}
export type Progress = { version: string; id: string; done: string[] };
export function progress() {
  return read<Progress>(
    "progress",
    { version: contentVersion, id: "setup", done: [] },
    (v): v is Progress =>
      !!v &&
      typeof v === "object" &&
      "version" in v &&
      v.version === contentVersion &&
      "id" in v &&
      typeof v.id === "string" &&
      entries.some((e) => e.kind === "lesson" && e.id === v.id) &&
      "done" in v &&
      Array.isArray(v.done) &&
      v.done.every(
        (id) =>
          typeof id === "string" &&
          entries.some((e) => e.kind === "lesson" && e.id === id),
      ),
  );
}
