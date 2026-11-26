import { expect, test } from "@playwright/test";

test.describe("Offline PWA full quest smoke test", () => {
  test("loads production build once online, precaches shell & static assets, goes offline, and completes a full quest", async ({
    page,
    context,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    // 1. Load production app once while ONLINE
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Who's playing\?/i })
    ).toBeVisible();

    // Wait for Service Worker registration & activation
    const cacheSummary = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      const keys = await caches.keys();
      const assetsKey = keys.find((k) => k.startsWith("wee-sparks-assets-"));
      const shellKey = keys.find((k) => k.startsWith("wee-sparks-shell-"));
      const assetUrls = assetsKey
        ? (await (await caches.open(assetsKey)).keys()).map((r) =>
            new URL(r.url).pathname
          )
        : [];
      const shellUrls = shellKey
        ? (await (await caches.open(shellKey)).keys()).map((r) =>
            new URL(r.url).pathname
          )
        : [];
      return {
        hasActiveSw: Boolean(reg.active),
        cacheKeys: keys,
        assetUrls,
        shellUrls,
      };
    });

    expect(cacheSummary.hasActiveSw).toBe(true);
    expect(cacheSummary.shellUrls).toContain("/");
    expect(
      cacheSummary.assetUrls.some(
        (u) => u.startsWith("/_next/static/chunks/") && u.endsWith(".js")
      )
    ).toBe(true);
    expect(
      cacheSummary.assetUrls.some(
        (u) => u.startsWith("/_next/static/css/") && u.endsWith(".css")
      )
    ).toBe(true);

    // Reload once online so the active SW controls the page
    await page.reload({ waitUntil: "networkidle" });
    const controlled = await page.evaluate(() =>
      Boolean(navigator.serviceWorker.controller)
    );
    expect(controlled).toBe(true);

    // 2. Switch browser context completely OFFLINE
    await context.setOffline(true);

    // Reload the app while completely offline to verify full PWA shell boot
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Who's playing\?/i })
    ).toBeVisible({ timeout: 15_000 });

    // 3. Start a quest by tapping the child's avatar button
    const learnerButton = page
      .locator('button[aria-label^="Play as "]')
      .first();
    await expect(learnerButton).toBeVisible();
    await learnerButton.click();

    const progressBar = page.getByRole("progressbar", {
      name: "Quest progress",
    });
    await expect(progressBar).toBeVisible({ timeout: 10_000 });

    const totalSteps = Number(
      (await progressBar.getAttribute("aria-valuemax")) ?? "6"
    );
    expect(totalSteps).toBeGreaterThanOrEqual(1);

    // 4. Play through every step while 100% offline (verifying Next stays hidden until solved,
    //    and solving choice/shape steps or gently skipping after 3 misses on multi-step engines)
    for (let step = 0; step < totalSteps; step += 1) {
      const celebrationHeading = page.getByRole("heading", {
        name: /Causeway Quest Complete!/i,
      });
      if (await celebrationHeading.isVisible()) {
        break;
      }

      const audioButton = page.getByRole("button", {
        name: "Play question audio",
      });
      await expect(audioButton).toBeVisible({ timeout: 10_000 });

      const nextButton = page.getByRole("button", { name: "Next" });
      const skipButton = page.getByRole("button", {
        name: "Skip this question",
      });

      // Next must NOT be visible before solving
      await expect(nextButton).toBeHidden();

      // Try solving tap-choice cards (guarantees solving within 4 taps)
      const choiceCards = page.locator('button[aria-label^="Choose "]');
      const sortCards = page.locator('button[aria-label^="Sort "]');

      if ((await choiceCards.count()) > 0) {
        const count = await choiceCards.count();
        for (let i = 0; i < count; i += 1) {
          if (
            (await nextButton.isVisible()) ||
            (await celebrationHeading.isVisible())
          ) {
            break;
          }
          await choiceCards.nth(i).click();
          await page.waitForTimeout(150);
        }
      } else if ((await sortCards.count()) > 0) {
        const count = await sortCards.count();
        for (let i = 0; i < count; i += 1) {
          if (
            (await nextButton.isVisible()) ||
            (await celebrationHeading.isVisible())
          ) {
            break;
          }
          await sortCards.nth(i).click();
          await page.waitForTimeout(150);
        }
      } else {
        // Multi-step engines (NumberLine, Build-on-Frame, Coin Jar, Phonics, Trace):
        // Trigger 3 retries via Check button to unlock the gentle Skip control
        const checkBtn = page
          .locator("button")
          .filter({ hasText: /Check/i })
          .first();
        if (await checkBtn.isVisible()) {
          // For coin jar, phonics, or trace canvas where Check starts disabled until 1 interaction
          if (await checkBtn.isDisabled()) {
            const traceCanvas = page.locator("canvas").first();
            if (await traceCanvas.isVisible()) {
              const box = await traceCanvas.boundingBox();
              if (box) {
                await page.mouse.move(box.x + 20, box.y + 20);
                await page.mouse.down();
                await page.mouse.move(box.x + 40, box.y + 40);
                await page.mouse.up();
              }
            }
            const coinBtn = page
              .locator('button[aria-label^="Add UK "]')
              .first();
            if (await coinBtn.isVisible()) {
              await coinBtn.click();
            }
            const tileBtn = page
              .locator('button[aria-label^="Letter sound "]')
              .first();
            if (await tileBtn.isVisible()) {
              for (let t = 0; t < 4; t += 1) {
                const candidate = page
                  .locator('button[aria-label^="Letter sound "]')
                  .nth(t);
                if (await candidate.isVisible()) await candidate.click();
              }
            }
          }
          for (let tries = 0; tries < 3; tries += 1) {
            if (
              (await nextButton.isVisible()) ||
              (await skipButton.isVisible())
            ) {
              break;
            }
            if (await checkBtn.isEnabled()) {
              await checkBtn.click();
              await page.waitForTimeout(150);
            }
          }
        }
      }

      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else if (await skipButton.isVisible()) {
        await skipButton.click();
      } else {
        // Fallback for tracing/CVC if neither unlocked yet: wait for auto-advance or 25s gentle skip
        await expect(nextButton.or(skipButton).or(celebrationHeading)).toBeVisible(
          { timeout: 30_000 }
        );
        if (await nextButton.isVisible()) await nextButton.click();
        else if (await skipButton.isVisible()) await skipButton.click();
      }

      await page.waitForTimeout(350);
    }

    // 5. Verify post-session Celebration & Sticker Chest rendered completely offline
    //    (requires >= 1 step solved during the quest)
    await expect(
      page.getByRole("heading", { name: /Causeway Quest Complete!/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /Next Adaptive Quest/i })
    ).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
