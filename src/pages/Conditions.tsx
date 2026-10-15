import { LabelledText } from "../components/LabelledText";
import { useEffect, useRef, useState } from "react";
import {
  judgeMovement,
  judgeBeer,
  judgeDefense,
  judgeStartTurn,
  judgeVictory,
} from "../domain/judges";
import type { Inputs } from "../domain/judges";
import { Accordion, SourceLinks } from "../components/common";
type Field = { label: string; options: [string, string][] };
const yesno: [string, string][] = [
  ["yes", "예"],
  ["no", "아니요"],
];
const numbers = (from: number, to: number): [string, string][] =>
  Array.from({ length: to - from + 1 }, (_, i) => [
    `${from + i}`,
    `${from + i}`,
  ]);
const fields: Record<string, Field> = {
  movementCase:{label:"어떤 상황인가요?",options:[["elimination","탈락 보상·벌칙"],["hand","턴 종료 손패 정리"],["effect","카드 효과로 가져오기·버리기"],["weapon","무기 교체"],["empty","중앙 카드가 떨어짐"],["free","그냥 버리고 싶어요"]]},
  fallenRole:{label:"탈락한 사람의 공개된 역할은?",options:[["outlaw","무법자"],["deputy","부관"],["other","보안관·배신자"]]},
  eliminationCause:{label:"무법자는 어떻게 탈락했나요?",options:[["player","다른 사람이 낸 카드로 탈락"],["dynamite","다이너마이트로 탈락"],["self-duel","자신이 낸 결투에서 탈락"]]},
  sheriffCaused:{label:"보안관이 부관을 탈락시켰나요?",options:yesno},
  vultureAlive:{label:"벌처 샘이 살아 있나요?",options:yesno},
  handLife:{label:"현재 생명력은 몇 개인가요?",options:numbers(1,5)},
  handAmount:{label:"지금 손패는 몇 장인가요?",options:[...numbers(0,12),["many","13장 이상"]]},
  movementEffect:{label:"어떤 카드를 사용했나요?",options:[["panic","강탈"],["cat","캣 벌루"],["stagecoach","역마차"],["bank","은행"],["store","잡화점"]]},

  alive: { label: "지금 몇 명이 살아 있나요?", options: numbers(2, 7) },
  own: { label: "지금 내 카드 사용 단계인가요?", options: yesno },
  lethal: { label: "방금 치명 피해를 받았나요?", options: yesno },
  life: {
    label: "생명력은 얼마인가요? 치명 피해라면 피해 전 값을 선택하세요.",
    options: numbers(1, 5),
  },
  damage: { label: "방금 받은 피해량은 얼마인가요?", options: numbers(0, 3) },
  beers: { label: "손의 맥주는 몇 장인가요?", options: numbers(0, 6) },
  max: {
    label: "최대 생명력은 얼마인가요? 보안관의 +1을 포함하세요.",
    options: numbers(3, 5),
  },
  attack: {
    label: "어떤 공격을 받았나요?",
    options: [
      ["bang", "뱅!"],
      ["gatling", "개틀링"],
      ["indians", "인디언!"],
      ["duel", "결투"],
    ],
  },
  attacker: {
    label: "공격자는 슬랩 더 킬러인가요?",
    options: [
      ["slab-the-killer", "슬랩 더 킬러"],
      ["other", "다른 캐릭터"],
    ],
  },
  defender: {
    label: "방어자의 캐릭터는 무엇인가요?",
    options: [
      ["other", "다른 캐릭터"],
      ["jourdonnais", "주르도네"],
      ["calamity-janet", "캘러미티 재닛"],
    ],
  },
  barrel: { label: "실물 술통이 설치되어 있나요?", options: yesno },
  first: {
    label: "첫 번째 회피 판정 결과는?",
    options: [
      ["heart", "하트 성공"],
      ["other", "실패 또는 시도하지 않음"],
    ],
  },
  second: {
    label: "남은 회피 판정 결과는? (주르도네 + 실물 술통)",
    options: [
      ["heart", "하트 성공"],
      ["other", "실패 또는 시도하지 않음"],
    ],
  },
  dynamite: { label: "내 앞에 다이너마이트가 있나요?", options: yesno },
  jail: { label: "내 앞에 감옥이 있나요?", options: yesno },
  character: {
    label: "판정에 럭키 듀크 능력이 적용되나요?",
    options: [
      ["other", "아니요"],
      ["lucky-duke", "럭키 듀크"],
    ],
  },
  chosen: {
    label: "공개한 두 장 중 사용할 결과를 골랐나요?",
    options: [["yes", "선택한 실제 결과를 입력할게요"]],
  },
  suit: {
    label: "다이너마이트 판정의 실제 문양은?",
    options: [
      ["spade", "스페이드"],
      ["heart", "하트"],
      ["club", "클럽"],
      ["diamond", "다이아몬드"],
    ],
  },
  rank: {
    label: "다이너마이트 판정의 실제 숫자는?",
    options: [
      ...numbers(2, 10),
      ["11", "J"],
      ["12", "Q"],
      ["13", "K"],
      ["14", "A"],
    ],
  },
  jailSuit: {
    label: "감옥 판정의 실제 문양은?",
    options: [
      ["heart", "하트"],
      ["other", "하트 이외"],
    ],
  },
  survived: { label: "3 피해를 처리한 뒤 생존했나요?", options: yesno },
  complete: {
    label: "남은 역할 구성을 모두 공개 정보로 확인할 수 있나요?",
    options: yesno,
  },
  sheriff: {
    label: "보안관의 공개 상태는?",
    options: [
      ["alive", "생존"],
      ["dead", "탈락"],
    ],
  },
  outlaws: { label: "남아 있는 무법자는 몇 명인가요?", options: numbers(0, 3) },
  renegade: {
    label: "배신자의 공개 상태는?",
    options: [
      ["alive", "생존"],
      ["dead", "탈락"],
    ],
  },
  deputies: { label: "남아 있는 부관은 몇 명인가요?", options: numbers(0, 2) },
};
const kinds = {
  movement: {title:"카드 가져오기·버리기",judge:judgeMovement,related:[]},
  beer: {
    title: "맥주를 사용할 수 있나요?",
    judge: judgeBeer,
    related: ["beer", "sid-ketchum"],
  },
  defense: {
    title: "공격에 어떻게 대응하나요?",
    judge: judgeDefense,
    related: ["barrel", "slab-the-killer", "jourdonnais"],
  },
  start: {
    title: "턴 시작에 무엇을 판정하나요?",
    judge: judgeStartTurn,
    related: ["dynamite", "jail", "lucky-duke"],
  },
  victory: {
    title: "게임이 끝났나요?",
    judge: judgeVictory,
    related: ["outlaw-duel"],
  },
};
export function Conditions({ kind }: { kind: keyof typeof kinds }) {
  const [input, setInput] = useState<Inputs>({});
  const [editing, setEditing] = useState<string | null>(null);
  const config = kinds[kind];
  const verdict = config.judge(input);
  const next = editing ?? verdict.missingFields[0];
  const field = next ? fields[next] : null;
  const heading = useRef<HTMLHeadingElement>(null);
  const ready = verdict.status !== "needsInput";
  useEffect(() => {
    if (ready && !editing) heading.current?.focus();
  }, [ready, editing]);
  return (
    <>
      <div className="eyebrow">조건별 판정</div>
      <h1>{config.title}</h1>
      <p className="muted">
        실제 게임의 조건을 선택하세요. 조건을 바꾸면 다시 계산합니다.
      </p>
      {Object.keys(input).length > 0 && (
        <Accordion title="선택한 조건 · 수정" defaultOpen>
          <div className="condition-summary">
            {Object.entries(input).map(([key, value]) => (
              <button key={key} onClick={() => setEditing(key)}>
                {fields[key]?.label}
                <strong>
                  {fields[key]?.options.find((o) => o[0] === value)?.[1]} · 수정
                </strong>
              </button>
            ))}
          </div>
        </Accordion>
      )}
      {field && (
        <section className="question-panel">
          <small>조건 확인</small>
          <h2>{field.label}</h2>
          <div className="choices">
            {field.options.map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  setInput((p) => kind === "movement" ? ({...Object.fromEntries(Object.entries(p).slice(0,Object.keys(p).indexOf(next) < 0 ? Object.keys(p).length : Object.keys(p).indexOf(next))),[next]:value}) : ({ ...p, [next]: value }));
                  setEditing(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}
      {!editing &&
        (ready || verdict.answer !== "다음 조건을 선택해 주세요.") && (
          <section className={`answer ${ready ? "" : "pending"}`}>
            <h2 ref={heading} tabIndex={-1}>
              {ready ? "결론" : "확인이 필요해요"}
            </h2>
            <strong>{verdict.answer}</strong>
            {verdict.reasons.map((r) => (
              <p key={r}><LabelledText text={r}/></p>
            ))}
          </section>
        )}
      <button
        className="secondary full"
        onClick={() => {
          setInput({});
          setEditing(null);
        }}
      >
        조건 다시 선택
      </button>
      <SourceLinks refs={verdict.sourceRefs} />
      
      <p className="muted">
        자동으로 손패를 소모하거나 게임을 진행하지 않습니다.
      </p>
    </>
  );
}


