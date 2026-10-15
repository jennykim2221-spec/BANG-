import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cards,
  characters,
  entries,
  lessons,
  rulings,
} from "../src/content/index.ts";
import { searchContent } from "../src/domain/search.ts";
import { calculateDistance } from "../src/domain/distance.ts";
import type { DistanceInput } from "../src/domain/distance.ts";
import {
  judgeBeer,
  judgeDefense,
  judgeStartTurn,
  judgeVictory,
} from "../src/domain/judges.ts";
test("AC03 · base edition counts and stable IDs", () => {
  assert.equal(cards.length, 22);
  assert.equal(
    cards.reduce((n, c) => n + c.copies, 0),
    80,
  );
  assert.equal(characters.length, 16);
  assert.equal(lessons.length, 6);
  assert.equal(new Set(entries.map((e) => e.id)).size, entries.length);
});
test("AC04 · verified sources and references for every public item", () => {
  for (const e of entries) {
    assert.equal(e.verification, "verified");
    assert.ok(e.sourceRefs.length);
    assert.ok(
      e.sourceRefs.every((r) => r.sourceId !== "R" || /^p\d/.test(r.locator)),
    );
    for (const id of e.relatedIds)
      assert.ok(
        entries.some((e) => e.id === id),
        `${e.id} references ${id}`,
      );
  }
});
const queries: Record<string, string> = {
  "맥주 두 명": "beer-two",
  "감옥 보안관": "jail-sheriff",
  "뱅 두 번": "bang-twice",
  "술통 실패": "barrel-fail",
  "강탈 거리": "panic-range",
  ㅁㅈ: "beer",
  beer: "beer",
  다이너마잇: "dynamite",
  맥주: "beer",
  "BANG !": "bang",
};
for (const [q, id] of Object.entries(queries))
  test(`AC05 · ${q} → ${id}`, () => assert.equal(searchContent(q)[0]?.id, id));
test("search empty, unknown, scope and response budget", () => {
  assert.deepEqual(searchContent(""), []);
  assert.deepEqual(searchContent("zzzzzz"), []);
  assert.ok(searchContent("beer", "card").every((e) => e.kind === "card"));
  const start = performance.now();
  for (let i = 0; i < 100; i++) searchContent("강탈 거리");
  assert.ok((performance.now() - start) / 100 < 100);
});
const input: DistanceInput = {
  seats: ["A", "B", "C", "D", "E"],
  eliminated: [],
  actor: "A",
  target: "C",
  scope: false,
  rose: false,
  mustang: false,
  paul: false,
  weapon: "colt",
  card: "bang",
};
test("AC07 · base 2 + target 1 − actor 1 = 2", () => {
  const r = calculateDistance({ ...input, scope: true, mustang: true });
  assert.equal(r?.base, 2);
  assert.equal(r?.effective, 2);
});
test("AC07 · minimum distance one even with double reduction", () =>
  assert.equal(
    calculateDistance({ ...input, target: "B", scope: true, rose: true })
      ?.effective,
    1,
  ));
test("F Q04 · long weapon never extends Panic", () =>
  assert.equal(
    calculateDistance({ ...input, card: "panic", weapon: "winchester" })
      ?.reachable,
    false,
  ));
test("AC07 · eliminated seats removed and invalid actor/target blocked", () => {
  assert.equal(calculateDistance({ ...input, eliminated: ["B"] })?.base, 1);
  assert.equal(calculateDistance({ ...input, eliminated: ["A"] }), null);
  assert.equal(calculateDistance({ ...input, target: "A" }), null);
  assert.equal(
    calculateDistance({ ...input, eliminated: ["B", "C", "D", "E"] }),
    null,
  );
});
const beer = {
  alive: "3",
  own: "yes",
  lethal: "no",
  life: "2",
  damage: "0",
  beers: "2",
  max: "4",
};
test("AC06 · all judges require input", () => {
  for (const judge of [judgeBeer, judgeDefense, judgeStartTurn, judgeVictory])
    assert.equal(judge({}).status, "needsInput");
});
test("AC06 · sufficient early conditions avoid irrelevant questions", () => {
  assert.equal(judgeBeer({ alive: "2" }).status, "blocked");
  assert.equal(
    judgeBeer({ alive: "3", own: "no", lethal: "no" }).status,
    "blocked",
  );
  assert.equal(
    judgeDefense({ attack: "indians", defender: "other" }).status,
    "allowed",
  );
});
test("Beer · two survivors, out of turn, lethal multiple beers, full life", () => {
  assert.equal(judgeBeer({ ...beer, alive: "2" }).status, "blocked");
  assert.equal(judgeBeer({ ...beer, own: "no" }).status, "blocked");
  assert.match(
    judgeBeer({ ...beer, own: "no", lethal: "yes", damage: "3" }).answer,
    /맥주 2장.*생명력 1/,
  );
  assert.equal(
    judgeBeer({ ...beer, lethal: "yes", damage: "3", beers: "1" }).status,
    "blocked",
  );
  assert.match(
    judgeBeer({ ...beer, life: "4" }).answer,
    /회복 효과는 없습니다/,
  );
});
test("F Q03 · Gatling does not consume BANG limit", () =>
  assert.match(
    rulings.find((r) => r.id === "gatling-bang")!.summary,
    /포함하지 않습니다/,
  ));
test("F Q06 · Duel discard does not consume BANG limit", () =>
  assert.match(
    rulings.find((r) => r.id === "duel-count")!.summary,
    /포함하지 않습니다/,
  ));
const defense = {
  attack: "bang",
  attacker: "slab-the-killer",
  defender: "other",
  barrel: "yes",
  first: "heart",
};
test("F Q02 · Slab with successful Barrel needs one more Missed", () =>
  assert.match(judgeDefense(defense).answer, /1개/));
test("F Q19 · Slab Gatling only needs one Missed", () =>
  assert.match(
    judgeDefense({ ...defense, attack: "gatling", barrel: "no" }).answer,
    /1개/,
  ));
test("F Q09 · Saloon with two survivors allowed in own turn", () =>
  assert.match(
    rulings.find((r) => r.id === "saloon-two")!.summary,
    /자기 턴에 가능합니다/,
  ));
test("F Q10 · Saloon cannot save lethal damage", () =>
  assert.match(
    rulings.find((r) => r.id === "saloon-lethal")!.summary,
    /불가능/,
  ));
test("F Q17 · Bart must survive with Beer in hand first", () =>
  assert.match(
    rulings.find((r) => r.id === "bart-lethal")!.summary,
    /손에 있던 맥주로 먼저 생존/,
  ));
test("F Q23 · Outlaw losing own Duel gives no reward", () =>
  assert.match(
    rulings.find((r) => r.id === "outlaw-duel")!.summary,
    /받지 않습니다/,
  ));
test("Duel and Indians disallow Barrel, Janet conversion, Jourdonnais two checks", () => {
  assert.match(judgeDefense({ ...defense, attack: "indians" }).answer, /뱅!/);
  assert.match(
    judgeDefense({
      ...defense,
      attack: "duel",
      defender: "calamity-janet",
    }).reasons.join(" "),
    /바꿔/,
  );
  assert.match(
    judgeDefense({ ...defense, defender: "jourdonnais", second: "heart" })
      .answer,
    /피했습니다/,
  );
});
test("Dynamite before Jail and lethal stops next steps", () => {
  const s = {
    dynamite: "yes",
    jail: "yes",
    character: "other",
    suit: "spade",
    rank: "9",
    jailSuit: "heart",
  };
  assert.equal(judgeStartTurn(s).status, "needsInput");
  assert.match(judgeStartTurn({ ...s, survived: "no" }).answer, /탈락/);
  assert.equal(judgeStartTurn({ ...s, survived: "yes" }).status, "allowed");
  assert.equal(
    judgeStartTurn({ ...s, suit: "heart", jailSuit: "other" }).status,
    "blocked",
  );
});
test("Victory uses public information and includes eliminated winning side", () => {
  assert.equal(judgeVictory({ complete: "no" }).status, "needsInput");
  const s = {
    complete: "yes",
    sheriff: "dead",
    outlaws: "0",
    renegade: "alive",
    deputies: "0",
  };
  assert.match(judgeVictory(s).answer, /배신자/);
  assert.match(judgeVictory({ ...s, deputies: "1" }).answer, /무법자/);
  assert.match(
    judgeVictory({ ...s, sheriff: "alive", renegade: "dead" }).answer,
    /보안관과 부관/,
  );
});
