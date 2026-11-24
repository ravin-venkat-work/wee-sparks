# Project Rules: NI Foundation Quest (CCEA P1–P2)

1. **Zero Runtime LLM Calls:** Never import `@google/genai`, OpenAI, or any LLM SDK inside `apps/web`. All AI generation happens strictly offline inside `tools/content-studio`.
2. **Offline-First & Children's Code:** All student progress must persist locally in IndexedDB (Dexie). Never add third-party analytics, tracking pixels, or ad SDKs.
3. **Foundation Stage UX (Ages 4–6):**
   - Minimum touch target size: `64px x 64px`.
   - Every prompt and interactive card must support audio playback (`audioKey`).
   - Avoid dense text instructions; rely on visual cues, audio replay buttons, and tactile drag/tap controls.
4. **NI Localization:** Always use UK spelling (e.g., *colour*, *recognise*), UK currency (`1p, 2p, 5p, 10p, 20p`), and CCEA Foundation Stage / Linguistic Phonics terminology.