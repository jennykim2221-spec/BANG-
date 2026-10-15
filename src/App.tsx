import { ImportantTip } from "./components/ImportantTip";
import { LabelledText } from "./components/LabelledText";
import { restartLesson, continueLearning } from "./storage/learning-session";
import { coverImage } from "./content/cover";
import { CardArtwork } from "./components/CardArtwork";
import { useEffect, useRef, useState } from "react";
import { Link } from "./app/router";
import { useRouter } from "./app/router-context";
import {
  cards,
  characters,
  entryPath,
  getEntry,
  lessons,
  rulings,
} from "./content";
import type { Card, Character, Entry, Ruling } from "./content/types";
import { contentVersion, sources } from "./content/sources";
import {
  EntryRow,
  Favorite,
  Icon,
  SearchBox,
} from "./components/common";
import { searchContent } from "./domain/search";
import { Conditions } from "./pages/Conditions";
import { Distance } from "./pages/Distance";
import { LessonPage } from "./pages/Learn";
import {
  progress,
  read,
  records,
  remember,
  storageUnavailable,
  write,
} from "./storage/store";
import "./styles.css";
const suggestions = [
  "맥주 두 명",
  "감옥 보안관",
  "뱅 두 번",
  "술통 실패",
  "강탈 거리",
];
const tools = [
  ["defense", "공격받았어요", "target"],
  ["beer", "맥주·생명력", "heart"],
  ["distance", "거리·사거리", "target"],
  ["start", "감옥·다이너마이트", "clock"],
  ["movement", "카드 가져오기·버리기", "move"],
  ["victory", "탈락·승리", "flag"],
];
const toolTitles: Record<string, string> = {
  beer: "맥주 판정",
  defense: "공격 방어 판정",
  start: "턴 시작 판정",
  victory: "승패 판정",
};
function toolPath(id: string) {
  return id === "distance"
    ? "/tools/distance"
    : id === "movement"
      ? "/rulings?group=movement"
      : `/rulings/${id}-check/check`;
}
function QuickLinks() {
  return (
    <div className="quick-grid">
      {tools.map(([id, title, icon]) => (
        <Link key={id} to={toolPath(id)}>
          <Icon name={icon} />
          <span>{title}</span>
          <span className="chevron">›</span>
        </Link>
      ))}
    </div>
  );
}
function RecordList({ name, limit }: { name: string; limit?: number }) {
  const list = records(name)
    .map((r) => getEntry(r.id))
    .filter((e): e is Entry => !!e).slice(0, limit ?? Infinity);
  return list.length ? (
    <div>
      {list.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  ) : (
    <p className="muted">아직 본 항목이 없어요. 궁금한 카드부터 찾아보세요.</p>
  );
}
function Home({ play = false }: { play?: boolean }) {
  const p = progress();
  const started = read("learning-started", false, (v): v is boolean => typeof v === "boolean") || p.done.length > 0;
  return (
    <>
      {!play ? (
        <>
          <div className="eyebrow">작은 테이블 위, 든든한 길잡이</div>
          <section className="hero">
            <div className="hero-art" aria-hidden="true">
              <img className="hero-cover" src={coverImage} alt="" />
              <span className="hero-logo">BANG!</span>
              <span className="hero-caption">YOUR FIRST ROUND</span>
            </div>
            <div className="hero-copy">
              <small>처음이어도 괜찮아요</small>
              <h1>
                한 턴씩 배우면,
                <br />
                어느새 뱅!
              </h1>
              <p>준비부터 첫 라운드까지 함께해요.</p>
            </div>
          </section>
          <div className="mode-grid">
            <Link
              to={"/learn/" + (started ? p.id : "setup")}
              className="mode-card learn-start" onClickCapture={continueLearning}
            >
              <Icon name="book" />
              <strong>{started ? "이어서 배우기" : "처음 배우기"}</strong>
              <small>{started ? "멈춘 곳에서 계속해요" : "처음이라면 여기부터"}</small>
              <span>{started ? "계속하기 →" : "시작하기 →"}</span>
            </Link>
            <Link to="/play" className="mode-card">
              <Icon name="target" />
              <strong>게임 중 도움</strong>
              <small>궁금한 규칙 바로 찾기</small>
              <span>찾아보기 →</span>
            </Link>
          </div>
          <section className="home-area home-area-learning"><div className="section-line"><h2>단계별로 시작하기</h2><span className="area-header-actions"><small className="muted">{p.done.length} / {lessons.length}</small><Link className="area-menu-icon" to="/learn" aria-label="배우기 메뉴 전체 보기"><Icon name="book" size={20} /></Link></span></div>
      <div className="list-panel">
        {lessons.map((l) => (
          <Link className={`lesson-row ${p.done.includes(l.id) ? "lesson-completed" : ""}`} key={l.id} onClickCapture={() => restartLesson(l.id)} to={"/learn/" + l.id}>
            <span className="round-number">
              {p.done.includes(l.id) ? "✓" : `${l.order}`.padStart(2, "0")}
            </span>
            <span>
              <strong>{l.title}</strong>
              <small>
                {l.order === 1
                  ? "인원과 준비물 확인"
                  : "핵심 규칙과 직접 해보기"}
              </small>
            </span>
            <Icon name="arrow" size={18} />
          </Link>
        ))}
      </div>
          </section>
        </>
      ) : (
        <>
          <div className="eyebrow">게임은 계속, 질문은 빠르게</div>
          <h1>지금 무엇이 궁금한가요?</h1>
          <p className="muted">상황을 고르면 필요한 규칙을 알려드려요.</p>
        </>
      )}
      <section className="home-area home-area-situations"><div className="section-line">
          <h2>상황으로 바로 찾기</h2><Link className="area-menu-icon" to="/play" aria-label="상황별 빠른 도움 메뉴"><Icon name="target" size={20} /></Link>
          
        </div>
        <QuickLinks />
      </section>
      {play && (
        <section>
          <h2>내 차례 요약</h2>
          <Link className="turn-strip" to="/learn/turn">
            <Icon name="clock" />
            <span>
              <strong>턴 전 확인 → 2장 가져오기</strong>
              <small>카드 사용 → 초과 손패 정리</small>
            </span>
            <Icon name="arrow" size={18} />
          </Link>
        </section>
      )}
      <section className="home-area home-area-questions"><div className="section-line">
          <h2>자주 헷갈리는 질문</h2>
          <Link className="area-menu-icon" to="/rulings" aria-label="판정 메뉴 전체 보기"><Icon name="scale" size={20} /></Link>
        </div>
        {["gatling-bang", "beer-two"].map((id) => (
          <EntryRow key={id} entry={getEntry(id)!} />
        ))}
      </section>
      <section className="home-area home-area-recent"><div className="section-line"><h2>최근 본 항목</h2><Link className="area-all-link" to="/recent">모두 보기 ›</Link></div>
        <RecordList name="recent" limit={3} />
      </section>
      <div className="footer-links"><Link to="/sources">근거·확인 범위 ↗</Link></div>
    </>
  );
}
function Catalog({ character = false }: { character?: boolean }) {
  const { url, go } = useRouter();
  const filter = new URLSearchParams(url.split("?")[1]).get("filter") ?? "전체";
  const fromLearning = character && new URLSearchParams(url.split("?")[1]).get("from") === "setup";
  const list = character
    ? characters
    : cards.filter((c) => filter === "전체" || c.tags.includes(filter));
  return (
    <>
      {!character && (
        <p className="note">
          기본 무기 Colt .45는 사거리 1입니다. 별도 카드가 아니므로 80장에
          포함하지 않아요.
        </p>
      )}
      <h1 className="sr-only">{character ? "캐릭터" : "카드 도감"}</h1>
      {!fromLearning && <nav className="catalog-tabs" aria-label="카드와 캐릭터 선택">
        {!fromLearning && <Link to="/cards" className={character ? "catalog-tab" : "catalog-tab active"} aria-current={character ? undefined : "page"}>카드 도감</Link>}
        <Link to={"/characters" + (new URLSearchParams(url.split("?")[1]).get("from") === "setup" ? "?from=setup" : "")} className={character ? "catalog-tab active" : "catalog-tab"} aria-current={character ? "page" : undefined}>캐릭터</Link>
      </nav>}
      {character && <p className="muted">능력의 시점과 예외를 함께 확인해요.</p>}
      {!character && (
        <div className="filter-strip" aria-label="카드 종류">
          {["전체", "공격", "방어", "회복", "카드 얻기", "방해", "장비"].map(
            (t) => (
              <button
                key={t}
                aria-pressed={filter === t}
                onClick={() => go("/cards?filter=" + encodeURIComponent(t))}
              >
                {t}
              </button>
            ),
          )}
        </div>
      )}
      <div className="section-line">
        <small>
          {character ? "캐릭터 16종" : "22종 · 총 80장"}
          {filter !== "전체" && ` · ${list.length}종`}
        </small>
        
      </div>
      <div className="list-panel">
        {list.map((e) => (
          <EntryRow key={e.id} entry={e} />
        ))}
      </div>

      {!character && <p className="muted">카드 이미지 없이도, 한 문장으로 이해해요.</p>}
    </>
  );
}
function Detail({ entry }: { entry: Entry }) {
  const { url } = useRouter();
  const fromSetup = new URLSearchParams(url.split("?")[1]).get("from") === "setup";
  const card = entry.kind === "card" ? (entry as Card) : null;
  const character = entry.kind === "character" ? (entry as Character) : null;
  const ruling = entry.kind === "ruling" ? (entry as Ruling) : null;
  return (
    <>
      <div className="section-line">
        <Link
          to={
            entry.kind === "card"
              ? "/cards"
              : entry.kind === "character"
                ? "/characters" + (fromSetup ? "?from=setup" : "") : "/rulings"
          }
        >
          ‹{" "}
          {entry.kind === "card"
            ? "카드 도감"
            : entry.kind === "character"
              ? "캐릭터"
              : "상황별 판정"}
        </Link>
        <Favorite entry={entry} />
      </div>
      <div className={`detail-heading ${card ? `card-tone-${card.border}` : ""}`}>
        {(card || character) ? <CardArtwork id={entry.id} title={entry.title} /> : <>
        <span className="text-card brown" aria-hidden="true">?<small>BANG!</small></span>
        </>}
        <div>
          <h1>{entry.title}</h1>
          {entry.nameEn && <p className="english">{entry.nameEn}</p>}
          <div className="badges">
            {card ? (
              <>
                <span>{card.tags.join(" · ")}</span>
                <span>
                  {card.border === "brown" ? "갈색 카드" : "파란 카드"} ·{" "}
                  {card.copies}장
                </span>
              </>
            ) : (
              character ? <span className="character-life"><strong>시작 생명력 {character.baseLife}</strong><span className="life-token-row" aria-label={`생명력 토큰 ${character.baseLife}개`}>{Array.from({length:character.baseLife},(_,i)=><svg key={i} className="life-token" width="17" height="30" viewBox="0 0 28 46" aria-hidden="true"><ellipse cx="14" cy="23" rx="13" ry="22" fill="#e5bc65" stroke="#956320" strokeWidth="1.5"/><path d="M9 16Q9 9 14 7Q19 9 19 16V34H9Z" fill="#f9dfa0" stroke="#8c632b" strokeWidth="1.5"/><path d="M8 33H20V37H8Z" fill="#b98535" stroke="#8c632b"/></svg>)}</span></span> : <span>공식 판정</span>
            )}
          </div>
        </div>
      </div>
      
      <section className={`answer ${card ? `card-tone-${card.border}` : ""}`}>
        <small>{ruling ? "결론" : "이것만 먼저 기억해요"}</small>
        <strong>{entry.summary}</strong>
      </section>
      {card && (
        <dl className="facts">
          <div>
            <dt>언제</dt>
            <dd>{card.timing}</dd>
          </div>
          <div>
            <dt>누구에게</dt>
            <dd>{card.target}</dd>
          </div>
          <div>
            <dt>거리</dt>
            <dd>
              {
                (
                  {
                    weapon: "내 무기의 사거리",
                    fixed1: "보정 후 거리 1",
                    any: "거리 제한 없음",
                    self: "자기 자신",
                    others: "거리와 무관",
                    all: "거리와 무관",
                  } as Record<string, string>
                )[card.distanceRule]
              }
            </dd>
          </div>
          <div>
            <dt>처리 후</dt>
            <dd>
              {card.border === "brown" ? "버림 더미로" : "설치 상태 유지"}
            </dd>
          </div>
        </dl>
      )}
      {character && (
        <dl className="facts">
          <div>
            <dt>발동 시점</dt>
            <dd>{character.trigger}</dd>
          </div>
          <div>
            <dt>능력 적용</dt>
            <dd>{character.optional ? "선택 가능" : "조건 충족 시 적용"}</dd>
          </div>
          <div>
            <dt>보안관이라면</dt>
            <dd>시작 생명력 {character.baseLife + 1}</dd>
          </div>
          <div>
            <dt>거리 보정</dt>
            <dd>
              {character.distanceModifier
                ? character.id === "paul-regret"
                  ? "상대가 보는 나 +1"
                  : "내가 보는 상대 −1"
                : "없음"}
            </dd>
          </div>
        </dl>
      )}
      {ruling && (
        <section>
          <h2>적용 조건</h2>
          {ruling.conditions.map((c) => (
            <p className="condition" key={c}>
              {c}
            </p>
          ))}
        </section>
      )}
      <section>
        <h2>{ruling ? "처리 순서" : "사용 절차"}</h2>
        <ol className="plain-steps">
          {entry.steps.map((s, i) => (
            <li key={i}><LabelledText text={s}/></li>
          ))}
        </ol>
      </section>
      {entry.exceptions.length > 0 && (
        <section>
          <h2>주의할 예외</h2>
          {entry.exceptions.map((e) => (
            <ImportantTip key={e}>{e}</ImportantTip>
          ))}
        </section>
      )}
      
      
      
    </>
  );
}
function Search() {
  const { url, backFromSearch } = useRouter();
  const q = new URLSearchParams(url.split("?")[1]).get("q") ?? "";
  const found = searchContent(q);
  return (
    <>
      <button className="secondary learning-back search-back" onClick={backFromSearch}>‹ 이전 화면으로 돌아가기</button>
      <div className="section-line">
        <h1>{q ? "검색 결과" : "궁금한 규칙 찾기"}</h1>
        {q && <small>{found.length}개</small>}
      </div>
      <span className="sr-only" role="status">
        {q ? `${q}, 검색 결과 ${found.length}개` : ""}
      </span>
      {found.length ? (
        <div className="list-panel">
          {found.map((e) => (
            <div key={e.id}>
              <span className="result-kind">
                {
                  (
                    {
                      card: "카드",
                      character: "캐릭터",
                      ruling: "판정",
                      lesson: "규칙·학습",
                    } as const
                  )[e.kind]
                }
              </span>
              <EntryRow entry={e} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="empty">
            <Icon name="search" size={32} />
            <h2>{q ? `“${q}” 결과가 없어요` : "어떤 상황이 궁금한가요?"}</h2>
            <p>카드 이름이나 짧은 질문으로 찾아보세요.</p>
            <small>별칭: beer → 맥주 · 다이너마잇 → 다이너마이트</small>
          </div>
          <h2>이렇게 검색해 보세요</h2>
          <div className="suggestions">
            {suggestions.map((s) => (
              <Link key={s} to={"/search?q=" + encodeURIComponent(s)}>
                {s} ↗
              </Link>
            ))}
          </div>
          <h2>상황을 선택해도 좋아요</h2>
          <QuickLinks />
        </>
      )}
    </>
  );
}
function Rulings() {
  const { url } = useRouter();
  const movement = url.includes("movement");
  return (
    <>
      <div className="eyebrow">조건을 확인하고, 근거까지</div>
      <h1>상황별 판정</h1>
      <QuickLinks />
      <section>
        <h2>{movement ? "카드 가져오기·버리기" : "자주 헷갈리는 질문"}</h2>
        {rulings
          .filter(
            (r) =>
              !movement ||
              [
                "general-store-wait",
                "discard-free",
                "panic-range",
                "outlaw-duel",
              ].includes(r.id),
          )
          .map((r) => (
            <EntryRow key={r.id} entry={r} />
          ))}
      </section>
    </>
  );
}
function Sources() {
  return (
    <>
      <div className="eyebrow">어디까지 확인했나요?</div>
      <h1>근거와 확인 범위</h1>
      <p className="lead">
        뱅! 4~7인을 위한
        <br />
        독립적인 한국어 도움말입니다.
      </p>
      <p>
        규칙 설명은 공식 자료를 읽고 작성한 한국어 요약입니다. 공식 한국어
        번역이 아니며 한글 카드명은 검색용 가칭입니다.
      </p>
      <p className="note">
        확장판·주사위판·듀얼·하우스 룰은 판정 범위에 포함하지 않습니다.
      </p>
      <h2>공식 자료</h2>
      {Object.entries(sources).map(([id, source]) => (
        <a
          className="source-card"
          key={id}
          href={source.url}
          target="_blank"
          rel="noreferrer"
        >
          <b>{id}</b>
          <span>
            {source.title}
            <small>새 창에서 열기 ↗</small>
          </span>
        </a>
      ))}
      <h2>확인일과 버전</h2>
      <p>2026.10.08 · 콘텐츠 {contentVersion}</p>
      <h2>영상 확인 한계</h2>
      <p>
        기획서에 언급된 영상의 대본·자막·장면 설명은 확보하지 못했습니다. 영상의
        발언이나 타임스탬프는 제공하지 않습니다.
      </p>
      <h2>콘텐츠 변경 이력</h2>
      <p>
        2026.10.08: 카드·캐릭터·FAQ 참조, 조건 판정과 학습 콘텐츠를
        추가했습니다.
      </p>
      <p className="muted">
        공식 링크가 열리지 않아도 상세의 인쇄 페이지와 FAQ 번호로 찾아볼 수
        있습니다. 외부 PDF와 영상은 오프라인에 저장하지 않습니다.
      </p>
    </>
  );
}
function Saved() {
  const [list, setList] = useState(records("saved"));
  return (
    <>
      <h1>즐겨찾기</h1>
      <p className="muted">
        자주 찾는 답을 기기에 모아두세요. {list.length} / 50
      </p>
      {!list.length ? (
        <div className="empty">
          <Icon name="star" size={36} />
          <h2>아직 저장한 항목이 없어요</h2>
          <Link className="primary" to="/cards">
            카드 도감 둘러보기
          </Link>
        </div>
      ) : (
        (["card", "ruling", "character"] as const).map((kind) => (
          <section key={kind}>
            <h2>
              {
                (
                  { card: "카드", ruling: "판정", character: "캐릭터" } as const
                )[kind]
              }
            </h2>
            {list
              .map((r) => getEntry(r.id))
              .filter((e): e is Entry => !!e && e.kind === kind)
              .map((e) => (
                <div className="saved-row" key={e.id}>
                  <Link to={entryPath(e)}>{e.title}</Link>
                  <button
                    aria-label={`${e.title} 제거`}
                    onClick={() => {
                      const next = list.filter((x) => x.id !== e.id);
                      write("saved", next);
                      setList(next);
                    }}
                  >
                    제거
                  </button>
                </div>
              ))}
          </section>
        ))
      )}
    </>
  );
}
function Learn() {

  return (
    <>
      <div className="eyebrow learn-intro">준비부터 첫 라운드까지</div>
      <h1>처음 배우기</h1>
      <p className="lead">내 속도로, 한 턴씩.</p>
      <p className="muted">
        단원당 약 60~90초를 목표로 구성했어요. 순서와 관계없이 열 수 있습니다.
      </p>
      <div className="list-panel">
        {lessons.map((l) => (
          <Link className="lesson-row" key={l.id} onClickCapture={() => restartLesson(l.id)} to={"/learn/" + l.id}>
            <span className="round-number">
              {`${l.order}`.padStart(2, "0")}
            </span>
            <span>
              <strong>{l.title}</strong>
              <small>
                {l.order === 1
                  ? "인원과 준비물 확인"
                  : "핵심 규칙과 직접 해보기"}
              </small>
            </span>
            <Icon name="arrow" size={18} />
          </Link>
        ))}
      </div>
      <Link className="secondary full" to="/play">
        이미 게임 중인가요? 빠른 도움 →
      </Link>
    </>
  );
}
export default function App() {
  const { url } = useRouter();
  const path = url.split("?")[0];
  const [, setTick] = useState(0);
  const [keyboard, setKeyboard] = useState(false);
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(path);
  useEffect(() => {
    const updateViewport = () =>
      setKeyboard(
        !!window.visualViewport &&
          window.innerHeight - window.visualViewport.height > 150,
      );
    window.visualViewport?.addEventListener("resize", updateViewport);
    return () =>
      window.visualViewport?.removeEventListener("resize", updateViewport);
  }, []);
  useEffect(() => {
    const changed = () => setTick((t) => t + 1);
    window.addEventListener("bang-storage-change", changed);
    return () => window.removeEventListener("bang-storage-change", changed);
  }, []);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        const inspect = (worker: ServiceWorker | null) => {
          if (worker) worker.postMessage("SKIP_WAITING");
        };
        inspect(reg.waiting);
        reg.addEventListener("updatefound", () => {
          reg.installing?.addEventListener("statechange", () =>
            inspect(reg.waiting),
          );
        });
        await reg.update().catch(() => {});
        await navigator.serviceWorker.ready;

      })
      .catch(() => {});

  }, []);
  let page;
  let title = "뱅! 처음이라면";
  const section = path.startsWith("/learn")
    ? "learn"
    : path.startsWith("/cards") || path.startsWith("/characters")
      ? "cards"
      : path.startsWith("/rulings") || path.startsWith("/tools")
        ? "rulings"
        : "home";
  const tone = path.startsWith("/learn") || new URLSearchParams(url.split("?")[1]).get("from") === "setup" ? "learn" : path === "/recent" ? "recent" : path === "/play" || path === "/search" || path.startsWith("/tools") || path.endsWith("/check") ? "situations" : path.startsWith("/rulings") ? "questions" : "neutral";
  const id = path.split("/")[2];
  const entry = id ? getEntry(id) : undefined;
  if (path === "/") page = <Home />;
  else if (path === "/recent") {
    title="최근 본 항목";
    page=<><h1>최근 본 항목</h1><p className="muted">최근 확인한 순서대로 보여드려요.</p><RecordList name="recent" /></>;
  } else if (path === "/play") {
    title = "게임 중 빠른 도움";
    page = <Home play />;
  } else if (path === "/search") {
    title = "궁금한 규칙 찾기";
    page = <Search />;
  } else if (path === "/cards" || path === "/characters") {
    title = path === "/cards" ? "카드 도감" : "캐릭터";
    page = <Catalog character={path === "/characters"} />;
  } else if (path === "/learn") {
    title = "처음 배우기";
    page = <Learn />;
  } else if (path.startsWith("/learn/") && entry?.kind === "lesson") {
    title = entry.title;
    page = <LessonPage key={id} lesson={lessons.find((l) => l.id === id)!} />;
  } else if (path === "/rulings") {
    title = "상황별 판정";
    page = <Rulings />;
  } else if (
    path.startsWith("/rulings/") &&
    id?.endsWith("-check") &&
    toolTitles[id.replace("-check", "")]
  ) {
    const kind = id.replace("-check", "") as
      "beer" | "defense" | "start" | "victory";
    title = toolTitles[kind];
    page = <Conditions key={kind} kind={kind} />;
  } else if (path === "/tools/distance") {
    title = "거리 도우미";
    page = <Distance />;
  } else if (path === "/sources") {
    title = "근거와 확인 범위";
    page = <Sources />;
  } else if (path === "/saved") {
    title = "즐겨찾기";
    page = <Saved />;
  } else if (entry && path === entryPath(entry)) {
    title = entry.title;
    page = <Detail key={id} entry={entry} />;
  } else {
    title = "페이지를 찾을 수 없어요";
    page = (
      <div className="empty">
        <h1>{title}</h1>
        <p>주소를 확인하거나 홈에서 다시 찾아보세요.</p>
        <Link className="primary" to="/">
          홈으로
        </Link>
      </div>
    );
  }
  useEffect(() => {
    document.title = title + " | 뱅! 도움말";
    if (entry && path === entryPath(entry)) remember(entry.id);
    if (path === "/play" || path.startsWith("/learn"))
      write("preferences", { mode: path === "/play" ? "play" : "learn" });
    if (previousPath.current !== path && !path.startsWith("/search"))
      main.current?.focus({ preventScroll: true });
    previousPath.current = path;
  }, [path, title, entry]);
  const lastMode = read(
    "preferences",
    { mode: "learn" },
    (v): v is { mode: string } =>
      !!v &&
      typeof v === "object" &&
      "mode" in v &&
      ["play", "learn"].includes(String(v.mode)),
  );
  return (
    <div className={`app theme-${tone}`}>
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <div className="top-bar">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">B!</span>
          <span>{title.length > 15 ? "뱅! 도움말" : title}</span>
        </Link>
        <Link to="/saved" className="header-favorites" aria-label="즐겨찾기"><Icon name="star" size={18} /><span>즐겨찾기</span></Link>
      </header>
      <div className="search-wrap">
        <SearchBox />
      </div>
      </div>
      <main id="main" tabIndex={-1} ref={main}>
        {path.startsWith("/characters") && new URLSearchParams(url.split("?")[1]).get("from") === "setup" && <Link className="secondary learning-back" to="/learn/setup">‹ 배우기로 돌아가기</Link>}
        {page}
      </main>
      <footer className="app-status">
        
        {storageUnavailable && (
          <p role="status">저장할 수 없어 현재 세션에서만 유지합니다.</p>
        )}
      </footer>
      <nav
        className={`bottom-tabs ${keyboard ? "keyboard-open" : ""}`}
        aria-label="주요 메뉴"
      >
        {[
          ["home", "홈", "home", lastMode.mode === "play" ? "/play" : "/"],
          ["learn", "배우기", "book", "/learn"],
          ["cards", "카드 및 캐릭터", "cards", "/cards"],
          ["rulings", "판정", "scale", "/rulings"],
        ].map(([key, label, icon, to]) => (
          <Link
            to={to}
            key={key}
            aria-current={section === key ? "page" : undefined}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}





















