import { StrictMode, Component } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RouterProvider } from "./app/router";
const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
if (navigation?.type === "reload") {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key === "bang:v1:progress" || key === "bang:v1:learning-started" || key.startsWith("bang:v1:lesson-")) localStorage.removeItem(key);
    }
  } catch { /* Learning defaults remain available when storage is blocked. */ }
  history.replaceState({}, "", "/");
  window.scrollTo(0, 0);
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main>
        <h1>화면을 불러오지 못했어요</h1>
        <p>새로고침하면 첫 화면부터 다시 시작합니다.</p>
        <a href="/">홈으로 돌아가기</a>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider>
        <App />
      </RouterProvider>
    </ErrorBoundary>
  </StrictMode>,
);



