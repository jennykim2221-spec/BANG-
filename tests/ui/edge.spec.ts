import { test, expect } from "@playwright/test";
test("AC01/10 · primary pages at all widths and doubled text", async ({
  page,
}) => {
  for (const width of [320, 390, 430])
    for (const path of [
      "/play",
      "/cards",
      "/cards/beer",
      "/characters/paul-regret",
      "/rulings/slab-barrel",
      "/rulings/start-check/check",
      "/tools/distance",
      "/learn/setup",
      "/learn/practice",
      "/sources",
    ]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width} ${path}`,
      ).toBeTruthy();
    }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/play",
    "/cards/beer",
    "/rulings/beer-check/check",
    "/tools/distance",
    "/learn/roles",
  ]) {
    await page.goto(path);
    await page.addStyleTag({
      content:
        "body{font-size:32px}h1{font-size:48px}h2{font-size:36px}p,button,a,label,input,select,.row-summary{font-size:inherit!important}small{font-size:26px!important}",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `200% ${path}`,
    ).toBeTruthy();
  }
});
test("AC05/10 · IME waits and keyboard navigation", async ({ page }) => {
  await page.goto("/play");
  await expect(page.locator("main h1")).toBeVisible();
  const input = page.getByRole("searchbox");
  await expect(input).not.toBeFocused();
  await input.focus();
  await input.dispatchEvent("compositionstart");
  await input.fill("맥주");
  await expect(page).toHaveURL(/\/play$/);
  await input.dispatchEvent("compositionend");
  await expect(page).toHaveURL(/search/);
  await expect(page.locator(".entry-row>a").first()).toContainText("맥주");
  await page.goto("/rulings/beer-check/check");
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "3", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "지금 내 카드 사용 단계인가요?" }),
  ).toBeVisible();
});
test("AC11 · filter/scroll restoration, sheet back, external failure independent", async ({
  page,
  context,
}) => {
  await page.goto("/cards?filter=장비");
  await page.getByRole("link", { name: /윈체스터.*Winchester/ }).click();
  await expect(page.locator("main h1")).toHaveText("윈체스터");
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "장비", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.goto("/tools/distance");
  await page.getByRole("button", { name: /내 장비·캐릭터/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page).toHaveURL(/\/tools\/distance$/);
  await context.route("https://bang.dvgiochi.com/**", (r) => r.abort());
  await page.goto("/cards/beer");
  await page.getByRole("button", { name: "공식 근거와 확인일" }).click();
  await expect(page.getByRole("link", { name: /R · p6/ })).toBeVisible();
  await expect(
    page.getByText(/자신의 생명력을 1 회복합니다/).first(),
  ).toBeVisible();
});
test("AC09/12 · practice and progress resume, video limits stated", async ({
  page,
}) => {
  await page.goto("/learn/practice");
  await page.getByRole("button", { name: "2장 가져오기" }).click();
  await page.getByRole("button", { name: "뱅! 사용하기" }).click();
  await page.getByRole("button", { name: "1장 버리고 끝내기" }).click();
  await expect(
    page.getByText("첫 턴을 마쳤어요. 다음 사람의 차례입니다."),
  ).toBeVisible();
  await expect(page.locator(".question-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "게임 중 도움 →", exact: true }).click();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "이어 배우기" }),
  ).toBeVisible();
  await page.goto("/sources");
  await expect(
    page.getByText(/영상의 발언이나 타임스탬프는 제공하지 않습니다/),
  ).toBeVisible();
});


