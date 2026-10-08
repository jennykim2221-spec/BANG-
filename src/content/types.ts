export type SourceRef = { sourceId: "R" | "F" | "C" | "P"; locator: string };
export type Entry = {
  id: string;
  kind: "card" | "character" | "ruling" | "lesson";
  title: string;
  nameEn?: string;
  aliases: string[];
  summary: string;
  tags: string[];
  steps: string[];
  exceptions: string[];
  relatedIds: string[];
  sourceRefs: SourceRef[];
  verification: "verified" | "draft";
  verifiedAt: string;
  priority: number;
};
export type Card = Entry & {
  kind: "card";
  edition: "base";
  copies: number;
  border: "brown" | "blue";
  timing: string;
  target: string;
  distanceRule: string;
  range?: number;
  distanceModifier?: number;
};
export type Character = Entry & {
  kind: "character";
  baseLife: number;
  trigger: string;
  optional: boolean;
  distanceModifier: number;
};
export type Ruling = Entry & { kind: "ruling"; conditions: string[] };
export type Lesson = Entry & {
  kind: "lesson";
  order: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};
export type Verdict = {
  status: "allowed" | "blocked" | "needsInput" | "outOfScope";
  answer: string;
  reasons: string[];
  missingFields: string[];
  sourceRefs: SourceRef[];
};
