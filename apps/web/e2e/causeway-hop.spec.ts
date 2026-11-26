import { expect, test } from "@playwright/test";

test.describe("StarProgressBar Causeway hop on narrow tablet", () => {
  test.use({ viewport: { width: 600, height: 900 } });

  test("renders 6 stones cleanly inside bounds and smoothly hops Sparky in the overlay layer", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator('button[aria-label^="Play as "]').first().click();

    const progressBar = page.getByRole("progressbar", {
      name: "Quest progress",
    });
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveAttribute("aria-valuemax", "6");

    // Verify all 6 stones sit cleanly inside the narrow-tablet progress bar without overlap/clipping
    const trackBox = await progressBar.boundingBox();
    expect(trackBox).not.toBeNull();

    const stoneCenters: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      const stone = page.getByTestId(`causeway-stone-${i}`);
      await expect(stone).toBeVisible();
      const box = await stone.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(trackBox!.x - 2);
      expect(box!.x + box!.width).toBeLessThanOrEqual(
        trackBox!.x + trackBox!.width + 2
      );
      stoneCenters.push(box!.x + box!.width / 2);
    }

    // Stones should be strictly left-to-right ordered with spacing
    for (let i = 1; i < stoneCenters.length; i += 1) {
      expect(stoneCenters[i]!).toBeGreaterThan(stoneCenters[i - 1]! + 20);
    }

    // Sparky lives in the separate overlay layer (NOT inside any causeway-stone wrapper)
    const sparky = page.getByTestId("causeway-sparky");
    await expect(sparky).toBeVisible();
    const isInsideStone = await sparky.evaluate((el) =>
      Boolean(el.closest('[data-testid^="causeway-stone-"]'))
    );
    expect(isInsideStone).toBe(false);

    // Sparky starts centered above stone 0
    const sparkyBox0 = await sparky.boundingBox();
    expect(sparkyBox0).not.toBeNull();
    const sparkyCenter0 = sparkyBox0!.x + sparkyBox0!.width / 2;
    expect(Math.abs(sparkyCenter0 - stoneCenters[0]!)).toBeLessThan(12);

    // Solve step 0 (tap choice cards until Next appears) and advance to stone 1
    const nextButton = page.getByRole("button", { name: "Next" });
    const choiceCards = page.locator('button[aria-label^="Choose "]');
    const sortCards = page.locator('button[aria-label^="Sort "]');

    if ((await choiceCards.count()) > 0) {
      const count = await choiceCards.count();
      for (let i = 0; i < count; i += 1) {
        if (await nextButton.isVisible()) break;
        await choiceCards.nth(i).click();
        await page.waitForTimeout(120);
      }
    } else if ((await sortCards.count()) > 0) {
      const count = await sortCards.count();
      for (let i = 0; i < count; i += 1) {
        if (await nextButton.isVisible()) break;
        await sortCards.nth(i).click();
        await page.waitForTimeout(120);
      }
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Wait for spring hop to settle onto stone 1 and confirm accurate alignment
    await expect
      .poll(async () => {
        const box = await sparky.boundingBox();
        if (!box) return 999;
        return Math.abs(box.x + box.width / 2 - stoneCenters[1]!);
      })
      .toBeLessThan(12);

    expect(pageErrors).toEqual([]);
  });
});
