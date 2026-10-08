import { cards } from "./cards.ts";
import { characters } from "./characters.ts";
import { rulings } from "./rulings.ts";
import { lessons } from "./lessons.ts";
import type { Entry } from "./types.ts";
export { cards, characters, rulings, lessons };
export const entries: Entry[] = [
  ...cards,
  ...characters,
  ...rulings,
  ...lessons,
].filter((e) => e.verification === "verified");
export function entryPath(e: Entry) {
  return `/${{ card: "cards", character: "characters", ruling: "rulings", lesson: "learn" }[e.kind]}/${e.id}${e.kind === "ruling" && e.id.endsWith("-check") ? "/check" : ""}`;
}
export function getEntry(id: string) {
  return entries.find((e) => e.id === id);
}
