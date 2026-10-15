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
      "지금은 맥주를 사용할 수 없습니다.",
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
      [i.lethal === "yes" ? "손에 있는 맥주만으로 생명력을 1 이상으로 만들 수 없어, 맥주 사용만으로는 탈락을 막을 수 없습니다." : "손패에 맥주가 없어 맥주로 생명력을 회복할 수 없습니다."],
      refs,
    );
  return result(
    "allowed",
    after >= max
      ? "사용할 수 있지만 회복 효과는 없습니다."
      : `맥주 ${needed}장으로 생명력 ${Math.min(max, after + needed)}이 됩니다.`,
    [
      `맥주 사용: 손패의 맥주 ${needed}장을 버림 더미에 놓습니다. 실제로 회복한 생명력만큼만 공용 총알 토큰을 받습니다.`,
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
      i.attack === "duel" ? "결투를 받은 사람부터 뱅! 1장씩 번갈아 버림 더미에 놓습니다. 먼저 내지 못한 사람이 생명력 1을 잃으면 결투가 끝납니다." : "인디언!을 낸 사람을 제외한 각 플레이어는 손패의 뱅! 1장을 버림 더미에 놓거나 생명력 1을 잃습니다.",
      [
        i.attack === "duel"
          ? "대상부터 교대로 뱅!을 버립니다."
          : "생명력을 잃으면 자신의 총알 토큰 1개를 중앙에 돌려놓습니다.",
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
      ? "공격을 피했습니다. 이 공격으로 생명력을 잃지 않습니다."
      : `빗나감! ${left}개 효과가 더 필요합니다. 손패의 빗나감! ${left}장을 사용해 버림 더미에 놓으면 피해를 막습니다.`,
    [
      "같은 실물 술통은 재판정하지 않습니다.",
      ...(i.defender === "calamity-janet"
        ? ["뱅!을 빗나감!으로 바꿔 사용할 수 있습니다."]
        : []),
      "필요한 대응을 하지 못하면 생명력 1을 잃고, 자신의 총알 토큰 1개를 중앙에 돌려놓습니다.",
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
      "탈락합니다. 역할을 공개하고, 감옥 판정이나 카드 가져오기를 하지 않습니다.",
      ["폭발한 다이너마이트를 버림 더미에 놓습니다. 남은 손패·설치 카드는 버리되, 살아 있는 벌처 샘이 있다면 그 사람의 손패로 옮깁니다."],
      refs,
    );
  const jailMissing = missing(i, i.jail === "yes" ? ["jailSuit"] : [], refs);
  if (jailMissing) return jailMissing;
  const skip = i.jail === "yes" && i.jailSuit !== "heart";
  return result(
    skip ? "blocked" : "allowed",
    skip
      ? "감옥 카드를 버림 더미에 놓고 이번 턴을 건너뜁니다. 카드를 가져오거나 사용하지 않습니다."
      : "중앙 카드 맨 위에서 2장을 가져와 자신의 손패에 넣고 턴을 계속합니다. 캐릭터의 가져오기 능력이 있다면 그 능력을 적용합니다.",
    [
      ...(i.dynamite === "yes"
        ? [
            explosion
              ? "폭발한 다이너마이트를 버림 더미에 놓습니다. 앞서 반영한 피해 3을 다시 차감하지 말고, 살아남은 상태에서 남은 턴을 이어갑니다."
              : "다이너마이트 카드를 왼쪽의 살아 있는 플레이어 앞에 설치된 상태로 넘깁니다.",
          ]
        : []),
      ...(i.jail === "yes" ? ["감옥 판정에 사용한 공개 카드와 감옥 카드는 버림 더미에 놓습니다."] : []),
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

export function judgeMovement(i: Inputs): Verdict {
  const refs = [R("p3–5"), R("p7"), R("p9–11")];
  const need = (keys:string[]) => missing(i, keys, refs);
  const first=need(["movementCase"]); if(first)return first;
  if(i.movementCase === "elimination") {
    let m=need(["fallenRole"]);if(m)return m;
    if(i.fallenRole === "outlaw") {m=need(["eliminationCause"]);if(m)return m;}
    if(i.fallenRole === "deputy") {m=need(["sheriffCaused"]);if(m)return m;}
    m=need(["vultureAlive"]);if(m)return m;
    const transfer = i.vultureAlive === "yes"
      ? "탈락자의 손패와 설치된 게임 카드를 모두 살아 있는 벌처 샘의 손패로 옮깁니다."
      : "탈락자의 손패와 설치된 게임 카드를 모두 버림 더미에 놓습니다.";
    const reasons=["역할 공개: 탈락자의 역할 카드를 앞면으로 뒤집습니다."];
    let answer = transfer;
    if(i.vultureAlive === "yes") reasons.push("가져온 설치 카드: 벌처 샘 앞에 바로 설치하지 않고 손에 듭니다.");
    if(i.fallenRole === "outlaw") {
      if(i.eliminationCause === "player") {answer="무법자를 탈락시킨 사람이 중앙 카드 맨 위에서 3장을 가져와 자신의 손패에 넣습니다.";reasons.push("현상금: 탈락시킨 사람의 역할과 관계없이 받습니다. 다른 무법자도 받을 수 있습니다.");}
      else {answer="현상금으로 중앙 카드 3장을 가져오는 사람은 없습니다.";reasons.push(i.eliminationCause === "dynamite" ? "다이너마이트 피해는 어떤 플레이어가 준 피해로도 보지 않습니다." : "무법자가 자신이 낸 결투에서 탈락했으므로 결투 상대는 보상을 받지 않습니다.");}
    }
    if(i.fallenRole === "deputy" && i.sheriffCaused === "yes") {answer="보안관은 자신의 손패와 설치된 게임 카드를 모두 버림 더미에 놓습니다.";reasons.push("보안관 벌칙: 역할·캐릭터 카드는 버리지 않으며 보드에 그려진 기본 권총도 유지합니다.");}
    if(i.fallenRole === "outlaw" || (i.fallenRole === "deputy" && i.sheriffCaused === "yes")) reasons.push("탈락자의 카드: " + transfer);
    return result("allowed",answer,reasons,refs);
  }
  if(i.movementCase === "hand") {
    const m=need(["handLife","handAmount"]);if(m)return m;
    if(i.handAmount === "many")return result("allowed","자신의 손패를 현재 생명력 개수만큼 남기고, 나머지는 골라 버림 더미에 놓습니다.",["버릴 손패는 직접 고릅니다. 설치된 카드는 손패에 포함하지 않습니다."],refs);
    const excess=Math.max(0,+i.handAmount - +i.handLife);
    return result("allowed",excess ? "자신의 손패에서 "+excess+"장을 골라 버림 더미에 놓습니다." : "손패가 현재 생명력 이하이므로, 턴 종료에 손패를 버릴 필요가 없습니다.",["턴 종료: 현재 생명력보다 초과한 손패만 정리합니다. 설치된 카드는 세지 않습니다."],refs);
  }
  if(i.movementCase === "effect") {
    const m=need(["movementEffect"]);if(m)return m;
    const answers:Record<string,[string,string[]]>={
      panic:["강탈을 낸 사람이 상대의 손패 또는 설치된 카드 중 1장을 자신의 손패로 가져옵니다.",["거리 보정을 반영한 거리 1인 상대만 선택합니다.","손패는 무작위로, 설치된 카드는 골라 가져옵니다."]],
      cat:["캣 벌루를 낸 사람이 상대의 손패 또는 설치된 카드 중 1장을 골라 버림 더미에 놓습니다.",["거리 제한이 없습니다. 손패는 무작위로, 설치된 카드는 골라 버립니다."]],
      stagecoach:["역마차를 낸 사람이 중앙 카드 맨 위에서 2장을 가져와 자신의 손패에 넣습니다.",[]],
      bank:["은행을 낸 사람이 중앙 카드 맨 위에서 3장을 가져와 자신의 손패에 넣습니다.",[]],
      store:["잡화점을 낸 사람부터 시계방향으로 공개 카드 1장씩을 골라 각자의 손패에 넣습니다.",["생존자 수만큼 중앙 카드를 앞면으로 공개합니다.","모두 선택한 뒤 다음 카드를 사용합니다."]],
    };
    const [answer,reasons]=answers[i.movementEffect];return result("allowed",answer,reasons,refs);
  }
  if(i.movementCase === "weapon")return result("allowed","자신의 기존 무기 카드를 버림 더미에 놓고, 새 무기 카드를 개인 보드의 무기 자리에 앞면으로 놓습니다.",["설치 무기는 한 번에 하나만 가질 수 있습니다. 보드에 그려진 기본 권총은 버리는 카드가 아닙니다."],refs);
  if(i.movementCase === "empty")return result("allowed","버림 더미의 게임 카드를 모두 섞어 중앙에 뒷면으로 쌓고, 그 위에서 계속 가져옵니다.",["다른 사람의 손패와 설치된 카드는 섞지 않습니다."],refs);
  return result("blocked","손패나 설치된 카드를 단순히 버리고 싶다는 이유로 버림 더미에 놓을 수는 없습니다.",["턴 종료의 초과 손패 정리, 카드 효과, 시드 케첨 능력 등 규칙에 따른 버리기만 가능합니다."],refs);
}
