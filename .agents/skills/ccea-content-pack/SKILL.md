---
name: ccea-content-pack
description: Generates and validates themed JSON exercise packs for Northern Ireland CCEA Foundation Stage (P1 and P2) literacy and numeracy micro-skills. Use when asked to create exercises, phonics packs, or maths quests.
---

# Goal
Generate valid JSON exercise files saved to `apps/web/src/data/packs/` that strictly match the Zod schemas in `packages/curriculum-schema`.

# Instructions
1. Read `packages/curriculum-schema/src/index.ts` first to verify exact field names and enum values.
2. Ensure all P1 phonics words strictly use target Linguistic Phonics stages (e.g., `s, a, t, p, i, n` before introducing digraphs `sh, ch, th, ng`).
3. Include an `offlineParentTip` for every skill and tag every exercise with a kid-friendly theme (`space`, `dinosaurs`, `animals`, `vehicles`).
4. Run the validation script (`pnpm --filter content-studio validate`) after writing any pack to confirm zero schema errors.