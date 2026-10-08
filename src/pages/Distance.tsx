import { useEffect, useRef, useState } from "react";
import { calculateDistance } from "../domain/distance";
import type { DistanceInput } from "../domain/distance";
import { cards } from "../content";
import { SourceLinks } from "../components/common";
const initial: DistanceInput = {
  seats: ["A", "B", "C", "D", "E"],
  eliminated: [],
  actor: "",
  target: "",
  scope: false,
  rose: false,
  mustang: false,
  paul: false,
  weapon: "colt",
  card: "bang",
};
export function Distance() {
  const [state, setState] = useState(initial);
  const [sheet, setSheet] = useState<"actor" | "target" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const alive = state.seats.filter((s) => !state.eliminated.includes(s));
  const result = calculateDistance(state);
  const update = (part: Partial<DistanceInput>) =>
    setState((p) => ({ ...p, ...part }));
  useEffect(() => {
    if (!sheet) return;
    const element = dialog.current;
    const opener = returnFocus.current;
    element?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const pop = () => setSheet(null);
    window.addEventListener("popstate", pop);
    return () => {
      element?.close();
      document.body.style.overflow = old;
      window.removeEventListener("popstate", pop);
      opener?.focus();
    };
  }, [sheet]);
  function open(which: "actor" | "target", element: HTMLElement) {
    returnFocus.current = element;
    setSheet(which);
    history.pushState({ sheet: true }, "", location.href);
  }
  function close() {
    setSheet(null);
    if (history.state?.sheet) history.back();
  }
  return (
    <>
      <div className="eyebrow">거리와 사거리를 따로</div>
      <h1>누구에게 닿나요?</h1>
      <p className="muted">좌석과 장비로 공격 가능 여부를 확인해요.</p>
      <section className="panel">
        <h2>처음 시작한 인원</h2>
        <div className="choices">
          {[4, 5, 6, 7].map((n) => (
            <button
              aria-pressed={state.seats.length === n}
              key={n}
              onClick={() =>
                setState({ ...initial, seats: "ABCDEFG".slice(0, n).split("") })
              }
            >
              {n}명
            </button>
          ))}
        </div>
        <div className="seat-ring" aria-label="시계방향 좌석 그림">
          {state.seats.map((s, i) => {
            const angle = (2 * Math.PI * i) / state.seats.length - Math.PI / 2;
            return (
              <span
                key={s}
                className={`seat ${state.eliminated.includes(s) ? "dead" : ""} ${state.actor === s ? "actor" : ""} ${state.target === s ? "target" : ""}`}
                style={{
                  left: `${50 + 37 * Math.cos(angle)}%`,
                  top: `${50 + 37 * Math.sin(angle)}%`,
                }}
              >
                {s}
                {state.actor === s && <small>나</small>}
                {state.target === s && <small>대상</small>}
              </span>
            );
          })}
          <span className="ring-center">
            {alive.length}명 생존
            <br />
            <small>탈락자는 제외해요</small>
          </span>
        </div>
        <div className="seat-list">
          {state.seats.map((s) => (
            <label key={s}>
              <input
                type="checkbox"
                checked={state.eliminated.includes(s)}
                onChange={(e) => {
                  const eliminated = e.target.checked
                    ? [...state.eliminated, s]
                    : state.eliminated.filter((x) => x !== s);
                  update({
                    eliminated,
                    ...(e.target.checked && state.actor === s
                      ? {
                          actor: "",
                          target: "",
                          scope: false,
                          rose: false,
                          mustang: false,
                          paul: false,
                          weapon: "colt",
                          card: "bang",
                        }
                      : e.target.checked && state.target === s
                        ? { target: "", mustang: false, paul: false }
                        : {}),
                  });
                }}
              />
              {s} 탈락
            </label>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="two-col">
          <label>
            내 좌석
            <select
              aria-label="내 좌석"
              value={state.actor}
              onChange={(e) =>
                update({
                  actor: e.target.value,
                  target: state.target === e.target.value ? "" : state.target,
                  scope: false,
                  rose: false,
                })
              }
            >
              <option value="">선택하세요</option>
              {alive.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            대상 좌석
            <select
              aria-label="대상 좌석"
              value={state.target}
              onChange={(e) =>
                update({ target: e.target.value, mustang: false, paul: false })
              }
            >
              <option value="">선택하세요</option>
              {alive
                .filter((s) => s !== state.actor)
                .map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </label>
        </div>
        <button
          className="setting"
          onClick={(e) => open("actor", e.currentTarget)}
        >
          내 장비·캐릭터 <span>{+state.scope + +state.rose} 보정 ›</span>
        </button>
        <button
          className="setting"
          onClick={(e) => open("target", e.currentTarget)}
        >
          상대 장비·캐릭터 <span>{+state.mustang + +state.paul} 보정 ›</span>
        </button>
        <label>
          사용할 카드
          <select
            value={state.card}
            onChange={(e) =>
              update({ card: e.target.value as "bang" | "panic" })
            }
          >
            <option value="bang">뱅!</option>
            <option value="panic">강탈!</option>
          </select>
        </label>
        <label>
          내 무기
          <select
            value={state.weapon}
            onChange={(e) => update({ weapon: e.target.value })}
          >
            <option value="colt">기본 무기 Colt .45 · 사거리 1</option>
            {cards
              .filter((c) => c.range)
              .map((c) => (
                <option value={c.id} key={c.id}>
                  {c.title} · 사거리 {c.range}
                </option>
              ))}
          </select>
        </label>
      </section>
      {result ? (
        <section className="answer" aria-live="polite">
          <small>최종 거리</small>
          <div className="distance-value">
            {result.effective}
            <span>
              {result.reachable ? "거리 조건 충족" : "거리 조건 불충족"}
            </span>
          </div>
          <dl>
            <dt>기본 좌석 거리</dt>
            <dd>{result.base}</dd>
            <dt>대상 보정</dt>
            <dd>+{result.targetModifier}</dd>
            <dt>내 보정</dt>
            <dd>−{result.actorModifier}</dd>
            <dt>선택 무기 사거리</dt>
            <dd>{result.weaponRange}</dd>
          </dl>
          <p>
            {state.card === "panic"
              ? "강탈!은 무기와 무관하게 최종 거리 1이어야 합니다."
              : "최종 거리 ≤ 무기 사거리이면 뱅!이 닿습니다."}
          </p>
        </section>
      ) : (
        <div className="empty">
          {alive.length < 2
            ? "생존자가 2명 이상이어야 계산할 수 있어요."
            : "내 좌석과 다른 생존 대상을 선택해 주세요."}
        </div>
      )}
      <p className="muted">
        사용 횟수와 실제 손패 보유 여부는 판단하지 않습니다.
      </p>
      <SourceLinks
        refs={[
          { sourceId: "R", locator: "p4–5" },
          { sourceId: "R", locator: "p8" },
          { sourceId: "R", locator: "p10" },
          { sourceId: "F", locator: "Q04" },
        ]}
      />
      
      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="sheet-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div>
          <header>
            <h2 id="sheet-title">
              {sheet === "actor" ? "내 장비·캐릭터" : "상대 장비·캐릭터"}
            </h2>
            <button onClick={close} aria-label="닫기">
              ×
            </button>
          </header>
          {(sheet === "actor"
            ? [
                ["scope", "조준경 · 거리 −1"],
                ["rose", "Rose Doolan · 거리 −1"],
              ]
            : [
                ["mustang", "머스탱 · 거리 +1"],
                ["paul", "Paul Regret · 거리 +1"],
              ]
          ).map(([key, label]) => (
            <label className="check-row" key={key}>
              <input
                type="checkbox"
                checked={!!state[key as keyof DistanceInput]}
                onChange={(e) => update({ [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
          <p className="muted">
            같은 장비는 하나만 적용해요. 캐릭터 능력과 장비는 함께 적용합니다.
          </p>
          <button className="primary full" onClick={close}>
            선택 완료
          </button>
        </div>
      </dialog>
    </>
  );
}

