import { entries } from "../content/index.ts";
import type { Entry } from "../content/types.ts";
export const normalize = (s: string) =>
  s.toLowerCase().replace(/[\s!?！？，,.·]/g, "");
const consonants = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
export const initials = (s: string) =>
  [...s]
    .map((c) => {
      const n = c.charCodeAt(0) - 0xac00;
      return n >= 0 && n <= 11171 ? consonants[Math.floor(n / 588)] : c;
    })
    .join("");
export function searchContent(
  query: string,
  scope: Entry["kind"] | "all" = "all",
) {
  const q = normalize(query);
  if (!q) return [];
  return entries
    .filter((e) => scope === "all" || e.kind === scope)
    .map((e) => {
      const title = normalize(e.title),
        names = [e.title, e.nameEn ?? ""],
        aliases = e.aliases.map(normalize);
      let score = 99;
      if (e.kind === "ruling" && (title === q || aliases.includes(q)))
        score = 0;
      else if (names.some((n) => normalize(n) === q)) score = 1;
      else if (
        aliases.includes(q) ||
        (e.kind === "card" &&
          [...names, ...e.aliases].some((n) => normalize(initials(n)) === q))
      )
        score = 2;
      else if (title.includes(q) || normalize(e.nameEn ?? "").includes(q))
        score = 3;
      else if (
        q !== "뱅" &&
        [...e.tags, e.summary, ...e.aliases].some((n) =>
          normalize(n).includes(q),
        )
      )
        score = 4;
      return { entry: e, score };
    })
    .filter((r) => r.score < 99)
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.entry.priority - b.entry.priority ||
        a.entry.id.localeCompare(b.entry.id),
    )
    .map((r) => r.entry);
}
