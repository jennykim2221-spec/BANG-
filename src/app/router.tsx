import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, MouseEvent } from "react";
import { RouterContext, useRouter } from "./router-context";
const positions = new Map<string, number>();
history.replaceState({...history.state, bangIndex:history.state?.bangIndex ?? 0}, "");
export function RouterProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState(location.pathname + location.search);
  const currentUrl = useRef(url);
  const restore = useRef<string | null>(null);
  useEffect(() => {
    currentUrl.current = url;
  }, [url]);
  useEffect(() => {
    history.scrollRestoration = "manual";
    const pop = () => {
      const next = location.pathname + location.search;
      if (next === currentUrl.current) return;
      restore.current = next;
      setUrl(next);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useLayoutEffect(() => {
    if (restore.current !== url) return;
    const offset = positions.get(url) ?? 0;
    window.scrollTo(0, offset);
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, offset);
      restore.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [url]);
  const go = useCallback(
    (next: string) => {
      positions.set(url, window.scrollY);
      const index = Number(history.state?.bangIndex ?? 0);
      const isMenu = /^\/(?:play|learn|cards|characters|rulings|saved|recent|sources)?$/.test(next.split("?")[0]);
      const returnOrigin = next.startsWith("/search") || next.split("?")[0] === "/tools/distance" || (next.split("?")[0] === "/rulings" && new URLSearchParams(next.split("?")[1]).get("group") === "movement")
        ? history.state?.returnOrigin ?? {url,index}
        : isMenu ? null : history.state?.returnOrigin ?? null;
      const learningHome = next.startsWith("/learn/") && (new URLSearchParams(next.split("?")[1]).get("from") === "home" || (url.startsWith("/learn/") && !!history.state?.learningHome));
      history.pushState({bangIndex:index+1,returnOrigin,learningHome}, "", next);
      setUrl(next);
      window.scrollTo(0, 0);
    },
    [url],
  );
  const backFromSearch = () => {
    const origin=history.state?.returnOrigin as {url:string;index:number} | undefined;
    const delta=Number(history.state?.bangIndex ?? 0)-(origin?.index ?? 0);
    if(origin && delta>0) history.go(-delta);
    else go(origin?.url ?? "/");
  };
  return (
    <RouterContext.Provider value={{ url, go, backFromSearch, hasReturnOrigin: !!history.state?.returnOrigin, learningHome: !!history.state?.learningHome }}>
      {children}
    </RouterContext.Provider>
  );
}
export function Link({
  to,
  children,
  className,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const { go } = useRouter();
  return (
    <a
      href={to}
      className={className}
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          go(to);
        }
      }}
    >
      {children}
    </a>
  );
}

