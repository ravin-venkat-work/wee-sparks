import { expect, test } from "@playwright/test";

test.describe("Wee World hub, first-run setup, calm mode, stickers, stories, and tracing", () => {
  test("verifies first-run setup, calm mode, mid-quest exit guard, 28-sticker SVG chest, and story tracing flow", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    // 1. Fresh device shows First-Run Setup & Calm Mode
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Who's playing\?/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Set Up Your First Explorer/i })
    ).toBeVisible();

    // Verify Calm Mode toggle sets data-calm-mode="true" on documentElement
    const calmBtn = page.getByRole("button", { name: /calm mode/i });
    await expect(calmBtn).toBeVisible();
    await calmBtn.click();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset.calmMode)
      )
      .toBe("true");
    await expect(
      page.getByRole("button", { name: /Calm mode is on/i })
    ).toBeVisible();
    // Toggle Calm Mode back off
    await page.getByRole("button", { name: /Calm mode is on/i }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset.calmMode)
      )
      .toBe("false");

    // Fill nickname, pick Pip companion, test sound, and start playing
    await page.getByPlaceholder(/Aoife, Noah/i).fill("Aoife");
    await page.getByRole("radio", { name: /Pip the Rathlin Puffin/i }).click();
    await page.getByRole("button", { name: /Test Sound/i }).click();
    await page.getByRole("button", { name: /Save & Start Playing/i }).click();

    // 2. Active Quest + Mid-Session Exit Confirmation
    await expect(
      page.getByRole("progressbar", { name: "Quest progress" })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Back to Who's playing" }).click();
    await expect(
      page.getByRole("heading", { name: /Leave this quest\?/i })
    ).toBeVisible();

    // Keep Playing keeps us inside the quest
    await page.getByRole("button", { name: /Keep Playing/i }).click();
    await expect(
      page.getByRole("progressbar", { name: "Quest progress" })
    ).toBeVisible();

    // Go Home returns cleanly to Wee World hub
    await page.getByRole("button", { name: "Back to Who's playing" }).click();
    await page.getByRole("button", { name: /Go Home/i }).click();

    // 3. Wee World Hub: Today's Quest, 28-Sticker Chest, and 4 Story Quests
    await expect(
      page.getByRole("heading", { name: /Aoife & Pip/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Play as Aoife" })
    ).toBeVisible();

    // Verify all 4 Story Quests are listed
    await expect(
      page.getByRole("button", { name: /Sparky & the Causeway Stars/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Rex's Dino Picnic in the Glens/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Pip's Voyage to Rathlin Island/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Nova's Starlight Moon Mission/i })
    ).toBeVisible();

    // Open Sticker Chest modal and verify 28 stickers & 4 collection tabs
    await page
      .getByRole("button", { name: /Open Aoife's Sticker Chest/i })
      .click();
    await expect(
      page.getByRole("heading", { name: /My Sticker Chest/i })
    ).toBeVisible();
    await expect(page.getByText(/0 \/ 28 Collected/i)).toBeVisible();

    const dinoTab = page.getByRole("tab", { name: /Dino Glens/i });
    await expect(dinoTab).toBeVisible();
    await dinoTab.click();
    await expect(
      page.locator('button[aria-label*="locked, requires"]')
    ).toHaveCount(7);

    await page.getByRole("button", { name: /Back to Wee World/i }).click();

    // 4. Story Quest + Guided Tracing + Mid-Story Exit Guard
    await page
      .getByRole("button", { name: /Rex's Dino Picnic in the Glens/i })
      .click();
    await expect(
      page.getByRole("heading", { name: /A Tiny Picnic Visitor/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /Play Challenge/i }).click();

    // Solve Chapter 1 (/a/ -> ant)
    await page.getByRole("button", { name: "Choose ant" }).click();
    const nextBtn = page.getByRole("button", { name: "Next" });
    await expect(nextBtn).toBeVisible({ timeout: 5_000 });
    await nextBtn.click();

    // Enter Chapter 2 (guided letter 's' tracing)
    await expect(
      page.getByRole("heading", { name: /Drawing a Sunny Signpost/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /Play Challenge/i }).click();
    await expect(
      page.locator('canvas[aria-label="Trace letter s"]')
    ).toBeVisible();
    await expect(page.getByText(/Checkpoints: 0 \/ 6/i)).toBeVisible();

    // Tap Home mid-story -> confirm reassuring saved-star leave dialog
    await page.getByRole("button", { name: "Back to Who's playing" }).click();
    await expect(
      page.getByRole("heading", { name: /Leave this story\?/i })
    ).toBeVisible();
    await expect(page.getByText(/1 ⭐ star/i)).toBeVisible();
    await page.getByRole("button", { name: /Go Home/i }).click();

    await expect(
      page.getByRole("heading", { name: /Aoife & Pip/i })
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
