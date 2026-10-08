import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("AC01/02 · first visit, all widths, tabs clear final content", async ({
  page,
}) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /처음 배우기.*시작하기/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /게임 중 도움.*찾아보기/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/home-${width}-${test.info().project.name}.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("link", { name: "근거·확인 범위 ↗" })
    .scrollIntoViewIfNeeded();
  const b = await page
    .getByRole("link", { name: "근거·확인 범위 ↗" })
    .boundingBox();
  const n = await page.locator(".bottom-tabs").boundingBox();
  expect(b!.y + b!.height).toBeLessThan(n!.y);
});
test("AC05/11 · search → detail → ruling → browser back", async ({ page }) => {
  await page.goto("/play");
  await expect(
    page.getByRole("heading", { name: "지금 무엇이 궁금한가요?" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("beer");
  await expect(page).toHaveURL(/search/);
  await page.locator(".entry-row>a").first().click();
  await expect(
    page.getByRole("heading", { name: "맥주", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /두 명일 때 맥주/ }).click();
  await expect(
    page.getByText("맥주를 내도 회복 효과가 없습니다.").first(),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "맥주", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("beer");
  await page.getByRole("searchbox").fill("없는카드");
  await expect(
    page.getByRole("heading", { name: /결과가 없어요/ }),
  ).toBeVisible();
  await page.goto("/not-a-page");
  await expect(
    page.getByRole("heading", { name: "페이지를 찾을 수 없어요" }),
  ).toBeVisible();
});
test("AC06 · sequential conditions and result recalculation", async ({
  page,
}) => {
  await page.goto("/rulings/beer-check/check");
  await expect(
    page.getByRole("heading", { name: "결론", exact: true }),
  ).toHaveCount(0);
  const choices = ["3", "예", "아니요", "2", "0", "2", "4"];
  for (const name of choices)
    await page
      .locator(".question-panel")
      .getByRole("button", { name, exact: true })
      .click();
  await expect(page.getByText(/맥주 1장으로 생명력 3/)).toBeVisible();
  await page.getByRole("button", { name: "선택한 조건 · 수정" }).click();
  await page.getByRole("button", { name: /지금 몇 명/ }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "2", exact: true })
    .click();
  await expect(
    page.getByText("회복 효과가 없습니다.", { exact: true }),
  ).toBeVisible();
});
test("AC07 · distance, sheet Escape and focus return, elimination", async ({
  page,
}) => {
  await page.goto("/tools/distance");
  await page.getByLabel("내 좌석", { exact: true }).selectOption("A");
  await page.getByLabel("대상 좌석", { exact: true }).selectOption("C");
  await expect(page.locator(".distance-value")).toContainText("2");
  await page.getByRole("button", { name: /내 장비·캐릭터/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("조준경 · 거리 −1").check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: /내 장비·캐릭터/ }),
  ).toBeFocused();
  await expect(page.locator(".distance-value")).toContainText("거리 조건 충족");
  await page.getByLabel("C 탈락").check();
  await expect(page.getByLabel("대상 좌석", { exact: true })).toHaveValue("");
});
test("AC08 · offline reload on unvisited detail/search/ruling", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.getByText("✓ 오프라인에서 사용할 수 있어요")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.goto("/cards/beer");
  await expect(
    page.getByRole("heading", { name: "맥주", exact: true }),
  ).toBeVisible();
  await page.goto("/search?q=맥주%20두%20명");
  await expect(page.locator(".entry-row>a").first()).toContainText(
    "두 명일 때 맥주",
  );
  await page.goto("/rulings/beer-check/check");
  await expect(
    page.getByRole("heading", { name: "지금 몇 명이 살아 있나요?" }),
  ).toBeVisible();
  await context.setOffline(false);
});
test("AC09/10 · learning, accessibility, doubled text", async ({ page }) => {
  for (const route of [
    "/",
    "/play",
    "/cards",
    "/cards/beer",
    "/characters",
    "/rulings",
    "/rulings/beer-check/check",
    "/tools/distance",
    "/learn/roles",
    "/saved",
    "/sources",
  ]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations, route).toEqual([]);
  }
  await page.goto("/learn/roles");
  await expect(page.locator(".question-panel")).toHaveCount(0);
  await page.addStyleTag({
    content:
      "body{font-size:32px}h1{font-size:48px}h2{font-size:36px}p,button,a,label,input,select,.row-summary{font-size:inherit!important}small{font-size:26px!important}",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "다음 단원 →" })
    .scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "다음 단원 →" })).toBeVisible();
  await page.screenshot({
    path: `artifacts/text-200-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("AC11 · storage denied, corrupt data, favorites and direct URLs", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("corrupt-once")) return;
    sessionStorage.setItem("corrupt-once", "yes");
    localStorage.setItem("bang:v1:progress", "broken");
    localStorage.setItem("bang:v1:saved", '[{"id":"unknown","at":"invalid"}]');
  });
  await page.goto("/cards/beer");
  await page.getByRole("button", { name: "맥주 즐겨찾기" }).first().click();
  await page.goto("/saved");
  await expect(
    page.getByRole("link", { name: "맥주", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "맥주 제거" }).click();
  await expect(
    page.getByRole("heading", { name: "아직 저장한 항목이 없어요" }),
  ).toBeVisible();
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new Error("Denied");
      },
    });
  });
  await page.goto("/learn/setup");
  await expect(
    page.getByText("저장할 수 없어 현재 세션에서만 유지합니다."),
  ).toBeVisible();
});

