import type { Verdict, SourceRef } from "../content/types.ts";
export type Inputs = Record<string, string>;
const R = (locator: string): SourceRef => ({ sourceId: "R", locator });
const F = (locator: string): SourceRef => ({ sourceId: "F", locator });
function result(
  status: Verdict["status"],
  answer: string,
  reasons: string[],
  sourceRefs: SourceRef[],
  missingFields: string[] = [],
): Verdict {
  return { status, answer, reasons, sourceRefs, missingFields };
}
function missing(i: Inputs, fields: string[], refs: SourceRef[]) {
  const absent = fields.filter((f) => i[f] === undefined || i[f] === "");
  return absent.length
    ? result("needsInput", "다음 조건을 선택해 주세요.", [], refs, absent)
    : null;
}
export function judgeBeer(i: Inputs): Verdict {
  const refs = [R("p6"), F("Q16"), F("Q25")];
  const first = missing(i, ["alive"], refs);
  if (first) return first;
  if (+i.alive === 2)
    return result(
      "blocked",
      "회복 효과가 없습니다.",
      ["생존자가 2명이면 맥주를 내도 생명력을 회복하지 못합니다."],
      refs,
    );
  const timing = missing(i, ["own", "lethal"], refs);
  if (timing) return timing;
  if (i.own === "no" && i.lethal === "no")
    return result(
      "blocked",
      "지금은 사용할 수 없습니다.",
      ["자기 턴 밖에서는 치명 피해 직후에만 맥주를 사용합니다."],
      refs,
    );
  const m = missing(i, ["life", "damage", "beers", "max"], refs);
  if (m) return m;
  const alive = +i.alive,
    life = +i.life,
    damage = +i.damage,
    beers = +i.beers,
    max = +i.max;
  if (alive < 2 || life < 1 || damage < 0)
    return result(
      "needsInput",
      "생명력과 피해 입력을 확인해 주세요.",
      [],
      refs,
      ["life"],
    );
  if (max < life)
    return result(
      "needsInput",
      "최대 생명력은 입력한 현재 생명력 이상이어야 합니다.",
      [],
      refs,
      ["max"],
    );
  const after = i.lethal === "yes" ? life - damage : life;
  if (i.lethal === "yes" && after > 0)
    return result(
      "needsInput",
      "치명 피해는 피해 후 생명력이 0 이하인 경우입니다.",
      [],
      refs,
      ["damage"],
    );
  const needed = i.lethal === "yes" ? 1 - after : 1;
  if (beers < needed)
    return result(
      "blocked",
      `맥주 ${needed}장이 필요하지만 ${beers}장만 있습니다.`,
      ["치명 피해 직후에는 생명력을 최소 1로 만들어야 합니다."],
      refs,
    );
  return result(
    "allowed",
    after >= max
      ? "사용할 수 있지만 회복 효과는 없습니다."
      : `맥주 ${needed}장으로 생명력 ${Math.min(max, after + needed)}이 됩니다.`,
    [
      `필요한 맥주: ${needed}장`,
      `최대 생명력: ${max}`,
      "Sid Ketchum 능력은 맥주 제한과 별개입니다.",
    ],
    refs,
  );
}
export function judgeDefense(i: Inputs): Verdict {
  const refs = [R("p6"), R("p8"), R("p9"), F("Q02"), F("Q19")];
  const first = missing(i, ["attack"], refs);
  if (first) return first;
  if (!["bang", "gatling", "indians", "duel"].includes(i.attack))
    return result(
      "outOfScope",
      "이 도우미가 다루지 않는 공격입니다.",
      [],
      refs,
    );
  if (["indians", "duel"].includes(i.attack)) {
    const m = missing(i, ["defender"], refs);
    if (m) return m;
    return result(
      "allowed",
      "뱅! 1장을 버리거나 생명력 1을 잃습니다.",
      [
        i.attack === "duel"
          ? "대상부터 교대로 뱅!을 버립니다."
          : "각 대상이 뱅! 1장을 버립니다.",
        "빗나감!과 술통은 대응할 수 없습니다.",
        ...(i.defender === "calamity-janet"
          ? ["캘러미티 재닛은 빗나감!을 뱅!으로 바꿔 버릴 수 있습니다."]
          : []),
      ],
      refs,
    );
  }
  const m = missing(i, ["attacker", "defender", "barrel"], refs);
  if (m) return m;
  const checks =
    (i.barrel === "yes" ? 1 : 0) + (i.defender === "jourdonnais" ? 1 : 0);
  const required = ["first", "second"].slice(0, checks);
  const more = missing(i, required, refs);
  if (more) return more;
  const need = i.attack === "bang" && i.attacker === "slab-the-killer" ? 2 : 1;
  const hits = required.filter((f) => i[f] === "heart").length;
  const left = Math.max(0, need - hits);
  return result(
    "allowed",
    left === 0
      ? "공격을 피했습니다."
      : `빗나감! ${left}개 효과가 더 필요합니다.`,
    [
      "같은 실물 술통은 재판정하지 않습니다.",
      ...(i.defender === "calamity-janet"
        ? ["뱅!을 빗나감!으로 바꿔 사용할 수 있습니다."]
        : []),
      "필요한 대응을 하지 못하면 생명력 1을 잃습니다.",
    ],
    refs,
  );
}
export function judgeStartTurn(i: Inputs): Verdict {
  const refs = [R("p9"), R("p10")];
  const m = missing(i, ["dynamite", "jail", "character"], refs);
  if (m) return m;
  if (i.character === "lucky-duke" && !i.chosen)
    return result(
      "needsInput",
      "럭키 듀크로 공개한 두 장 중 선택한 실제 결과를 입력해 주세요.",
      [],
      refs,
      ["chosen"],
    );
  const fields = i.dynamite === "yes" ? ["suit", "rank"] : [];
  const more = missing(i, fields, refs);
  if (more) return more;
  const explosion =
    i.dynamite === "yes" && i.suit === "spade" && +i.rank >= 2 && +i.rank <= 9;
  if (explosion && !i.survived)
    return result(
      "needsInput",
      "다이너마이트가 폭발합니다. 3 피해를 처리한 뒤 생존 여부를 선택해 주세요.",
      [],
      refs,
      ["survived"],
    );
  if (explosion && i.survived === "no")
    return result(
      "blocked",
      "탈락합니다. 감옥과 턴을 진행하지 않습니다.",
      ["폭발한 다이너마이트를 먼저 버립니다."],
      refs,
    );
  const jailMissing = missing(i, i.jail === "yes" ? ["jailSuit"] : [], refs);
  if (jailMissing) return jailMissing;
  const skip = i.jail === "yes" && i.jailSuit !== "heart";
  return result(
    skip ? "blocked" : "allowed",
    skip
      ? "감옥을 버리고 이번 턴을 건너뜁니다."
      : "카드 가져오기 단계를 진행합니다.",
    [
      ...(i.dynamite === "yes"
        ? [
            explosion
              ? "다이너마이트를 버리고 3 피해를 먼저 처리합니다."
              : "다이너마이트를 왼쪽 생존자에게 넘깁니다.",
          ]
        : []),
      ...(i.jail === "yes" ? ["감옥 판정 후 감옥을 버립니다."] : []),
      "턴 시작 판정은 다이너마이트 → 감옥 순서입니다.",
    ],
    refs,
  );
}
export function judgeVictory(i: Inputs): Verdict {
  const refs = [R("p4")];
  const m = missing(i, ["complete"], refs);
  if (m) return m;
  if (i.complete === "no")
    return result(
      "needsInput",
      "공개 정보만으로 승자를 단정하지 않습니다.",
      [
        "보안관 탈락: 배신자만 생존했으면 배신자, 그 외에는 무법자 승리.",
        "무법자와 배신자 모두 탈락: 보안관·부관 승리.",
      ],
      refs,
      ["complete"],
    );
  const more = missing(i, ["sheriff", "outlaws", "renegade", "deputies"], refs);
  if (more) return more;
  if (i.sheriff === "dead")
    return result(
      "allowed",
      +i.outlaws === 0 && i.renegade === "alive" && +i.deputies === 0
        ? "배신자가 승리합니다."
        : "무법자가 승리합니다.",
      ["보안관이 탈락하면 즉시 종료합니다."],
      refs,
    );
  if (+i.outlaws === 0 && i.renegade === "dead")
    return result(
      "allowed",
      "보안관과 부관이 승리합니다.",
      ["탈락한 부관도 같은 편으로 승리합니다."],
      refs,
    );
  return result(
    "allowed",
    "게임을 계속합니다.",
    ["무법자나 배신자가 남아 있습니다."],
    refs,
  );
}
