import { CardArtwork } from "./CardArtwork";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "../app/router";
import { useRouter } from "../app/router-context";
import { entryPath } from "../content";
import type { Card, Entry, SourceRef } from "../content/types";
import { sources } from "../content/sources";
import { records, write } from "../storage/store";
export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v15M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Z" />
      </>
    ),
    cards: (
      <>
        <rect x="7" y="3" width="13" height="18" rx="2" />
        <path d="M4 6 2 18l4 1M12 8h3m-3 4h4m-4 4h2" />
      </>
    ),
    scale: (
      <>
        <path d="M12 3v18M7 21h10M3 7h18M6 7 2 15h8Zm12 0-4 8h8Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    arrow: <path d="m9 5 7 7-7 7" />,
    star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />,
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4m0 14v4M1 12h4m14 0h4" />
      </>
    ),
    heart: <path d="M12 21 3 12C-2 5 7 0 12 7 17 0 26 5 21 12Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    move: (
      <>
        <path d="M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4" />
      </>
    ),
    flag: (
      <>
        <path d="M5 22V3h14l-3 4 3 4H5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.cards}
    </svg>
  );
}
export function SourceLinks({ refs }: { refs: SourceRef[] }) {
  return (
    <div className="sources">
      {refs.map((ref, i) => (
        <a
          key={i}
          href={
            sources[ref.sourceId].url +
            (ref.sourceId === "R"
              ? `#page=${ref.locator.match(/\d+/)?.[0] ?? 1}`
              : "")
          }
          target="_blank"
          rel="noreferrer"
        >
          {ref.sourceId} · {ref.locator}{" "}
          <span>{sources[ref.sourceId].title} ↗</span>
        </a>
      ))}
      <small>
        확인일 2026.10.08 · 연결 실패 시 위 페이지·번호로 찾아보세요.
      </small>
    </div>
  );
}
export function Accordion({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section className="accordion">
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {title}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
export function Favorite({ entry }: { entry: Entry }) {
  const [saved, setSaved] = useState(() =>
    records("saved").some((r) => r.id === entry.id),
  );
  const [status, setStatus] = useState("");
  return (
    <>
      <button
        className={`favorite ${saved ? "selected" : ""}`}
        aria-label={`${entry.title} 즐겨찾기`}
        aria-pressed={saved}
        onClick={() => {
          const list = records("saved");
          if (!saved && list.length >= 50) {
            setStatus("즐겨찾기는 50개까지 저장할 수 있어요.");
            return;
          }
          write(
            "saved",
            saved
              ? list.filter((x) => x.id !== entry.id)
              : [{ id: entry.id, at: new Date().toISOString() }, ...list],
          );
          setSaved(!saved);
          setStatus(
            saved ? "즐겨찾기에서 제거했어요." : "즐겨찾기에 저장했어요.",
          );
        }}
      >
        <Icon name="star" />
      </button>
      <span className="sr-only" role="status">
        {status}
      </span>
    </>
  );
}
export function EntryRow({ entry }: { entry: Entry }) {
  const { url } = useRouter();
  const fromSetup = new URLSearchParams(url.split("?")[1]).get("from") === "setup";
  const card = entry.kind === "card" ? entry as Card : null;
  return (
    <div className={`entry-row ${card ? `card-tone-${card.border}` : ""}`}>
      <Link to={entryPath(entry) + (fromSetup && entry.kind === "character" ? "?from=setup" : "")}>
        {(card || entry.kind === "character") ? <CardArtwork id={entry.id} title={entry.title} thumbnail /> : <>
        <span className={`mini-card ${entry.kind}`} aria-hidden="true">
          {entry.kind === "ruling"
              ? "?"
              : entry.kind === "lesson"
                ? "✦"
                : entry.tags.includes("회복")
                  ? "♡"
                  : entry.tags.includes("공격")
                    ? "✧"
                    : "♧"}
        </span>
        </>}
        <span className="entry-copy">
          <strong>{entry.title}</strong>
          {entry.nameEn && <small>{entry.nameEn}</small>}
          {card && <small className="card-color-label">{card.border === "blue" ? "파란 설치 카드" : "갈색 일회성 카드"}</small>}
          <span className="row-summary">{entry.summary}</span>
        </span>
        <Icon name="arrow" size={16} />
      </Link>
      {entry.kind !== "lesson" && <Favorite entry={entry} />}
    </div>
  );
}
export function SearchBox() {
  const { url, go } = useRouter();
  const initial = url.startsWith("/search")
    ? (new URLSearchParams(url.split("?")[1]).get("q") ?? "")
    : "";
  const [text, setText] = useState(initial);
  const [composing, setComposing] = useState(false);
  const focused = useRef(false);
  const previous = useRef(initial);
  // The URL is an external source: synchronize the input after browser back or a suggestion link.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (previous.current !== initial) {
      previous.current = initial;
      setText(initial);
    }
  }, [initial]);
  useEffect(() => {
    if (composing || !focused.current) return;
    const timer = setTimeout(() => {
      if (text.trim() || url.startsWith("/search")) {
        const next = "/search?q=" + encodeURIComponent(text);
        if (next !== url) go(next);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [text, composing, url, go]);
  return (
    <form
      className="searchbox"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go("/search?q=" + encodeURIComponent(text));
      }}
    >
      <Icon name="search" size={20} />
      <input
        aria-label="카드 이름 또는 궁금한 상황"
        placeholder="카드 이름 또는 궁금한 상황"
        value={text}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
        }}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        type="search"
      />
      <button aria-label="검색" type="submit">
        <Icon name="arrow" size={18} />
      </button>
    </form>
  );
}
export function Share() {
  const [status, setStatus] = useState("");
  return (
    <>
      <button
        className="text-button"
        onClick={async () => {
          try {
            if (navigator.share)
              await navigator.share({
                title: document.title,
                url: location.href,
              });
            else {
              await navigator.clipboard.writeText(location.href);
              setStatus("주소를 복사했어요.");
            }
          } catch {
            setStatus("공유하지 못했어요. 아래 주소를 복사해 주세요.");
          }
        }}
      >
        주소 공유 ↗
      </button>
      <span role="status">{status}</span>
      {status.includes("못") && (
        <input aria-label="상세 주소" readOnly value={location.href} />
      )}
    </>
  );
}



