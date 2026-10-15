import { ImportantTip } from "../components/ImportantTip";
import { CardArtwork } from "../components/CardArtwork";
import { LabelledText } from "../components/LabelledText";
import { learningSession } from "../storage/learning-session";
import { Setup } from "./Setup";
import { useEffect, useState } from "react";
import { lessons } from "../content";
import type { Lesson } from "../content/types";
import { Link } from "../app/router";
import { useRouter } from "../app/router-context";
import { SourceLinks } from "../components/common";
import { progress, write } from "../storage/store";
import { contentVersion } from "../content/sources";
export function LessonPage({ lesson }: { lesson: Lesson }) {
  const { go, learningHome } = useRouter();

  const viewLessons=learningSession.review?learningSession.reviewLessons:learningSession.lessons;
  const [seat, setSeat] = useState(viewLessons[lesson.id]?.seat ?? "");
  useEffect(() => { if(learningSession.review) learningSession.reviewLessons[lesson.id]={seat}; if(!learningSession.protectBookmark) learningSession.lessons[lesson.id]={seat}; }, [lesson.id, seat]);
  useEffect(() => {
    write("learning-started", true);
    if (learningSession.protectBookmark) return;
    learningSession.hasResume=true;
    write("progress", {
      ...progress(),
      version: contentVersion,
      id: lesson.id,
    });
  }, [lesson.id]);
  const finish = () => {
    const p = progress();
    write("progress", { ...p, done: [...new Set([...p.done, lesson.id])] });
  };
  if (lesson.id === "setup") return <Setup />;
  return (
    <>
      <div className="section-line">
        <Link className="back-link" to={learningHome ? "/" : "/learn"}>{learningHome ? "‹ 홈으로" : "‹ 배우기"}</Link>
        <span>{lesson.order} / {lessons.length} 단원</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${(lesson.order / lessons.length) * 100}%` }} />
      </div>
      <h1>{lesson.title}</h1>
      <p className="lead"><LabelledText text={lesson.summary}/></p>
      {lesson.id === "distance" && <ImportantTip>설치 카드로 상대까지의 거리는 늘어나거나 줄어들 수 있음</ImportantTip>}
      <ol className="lesson-steps">
        {lesson.steps.map((s, i) => (
          <li key={s} className={lesson.id === "combat" || (lesson.id === "distance" && (i === 1 || i === 2)) ? "combat-step" : undefined}>
            <b>{i + 1}</b>
            <span><LabelledText text={s}/></span>
            {(lesson.id === "combat" || (lesson.id === "distance" && (i === 1 || i === 2))) && <div className="combat-card-images">{(lesson.id === "distance" ? (i === 1 ? [["mustang","머스탱"],["paul-regret","폴 리그렛"]] : [["scope","조준경"],["rose-doolan","로즈 둘란"]]) : i === 0 ? [["bang","뱅!"],["gatling","개틀링"]] : i === 1 ? [["indians","인디언!"]] : [["duel","결투"]]).map(([id,title]) => <CardArtwork key={id} id={id} title={title}/>)}</div>}
          </li>
        ))}
      </ol>
      {lesson.id === "distance" && (
        <section className="panel">
          <h2>가상 5인 테이블</h2>
          <div className="five-seat-table" role="img" aria-label="시계방향으로 A, B, C, D, E가 원형으로 앉은 5인 테이블. 내 좌석은 A입니다."><div className="round-table-center">테이블</div>{["A", "B", "C", "D", "E"].map((name, i) => <span key={name} className={`table-seat seat-${i} ${name === "A" ? "my-seat" : ""} ${seat === name ? "target-seat" : ""}`}>{name}{name === "A" && <small>나</small>}</span>)}</div>
          <div className="choices">
            {["B", "C", "D", "E"].map((s) => (
              <button
                aria-pressed={seat === s}
                key={s}
                onClick={() => setSeat(s)}
              >
                대상 {s}
              </button>
            ))}
          </div>
          {seat && (
            <p role="status">
              A에서 {seat}까지 기본 거리 {["B", "E"].includes(seat) ? 1 : 2}
              입니다.
            </p>
          )}
          <Link className="text-button" to="/tools/distance">
            장비를 더해서 계산하기 ›
          </Link>
        </section>
      )}
      <SourceLinks refs={lesson.sourceRefs} />
      <div className="two-col">
        {lesson.order > 1 ? (
          <Link
            className="back-link"
            to={"/learn/" + lessons[lesson.order - 2].id}
          >
            이전 단원
          </Link>
        ) : (
          <Link className="secondary" to="/play">
            게임 중 도움
          </Link>
        )}
        {lesson.order < lessons.length ? (
          <button className="primary" onClick={() => { finish(); go("/learn/" + lessons[lesson.order].id); }}>
            다음 단원 →
          </button>
        ) : (
          <button className="primary" onClick={() => { finish(); go(learningHome ? "/" : "/learn"); }}>
            끝내기
          </button>
        )}
      </div>
    </>
  );
}









