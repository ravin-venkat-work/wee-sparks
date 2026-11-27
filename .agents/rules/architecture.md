# Project Rules: Wee Sparks (CCEA Foundation Stage P1–P2)

1. **Curriculum Scope (P1–P2 Only):** Wee Sparks strictly targets **Northern Ireland CCEA Foundation Stage (Primary 1 & Primary 2, ages 4–6)** across **Language and Literacy** and **Mathematics and Numeracy** only. Primary 3 / Key Stage 1+ and the other four CCEA Areas of Learning (The Arts, The World Around Us, PDMU, Physical Development & Movement) plus Religious Education are deliberately out of scope (see `CURRICULUM_MAP.md`).
2. **Zero Runtime LLM Calls:** Never import `@google/genai`, OpenAI, or any LLM SDK inside `apps/web`. All AI generation happens strictly offline inside `tools/content-studio`.
3. **Offline-First & Children's Code:** All student profiles, attempts, mastery, and stickers must persist strictly locally in IndexedDB (Dexie). First-party, cookieless Vercel Web Analytics (`@vercel/analytics` `<Analytics />` with zero custom child/learner telemetry properties and zero PII) is permitted for aggregate page-view health only; never send learner names, progress, or identifiers to analytics, and never add third-party ad/behavioral trackers, tracking pixels, or ad SDKs. All adult settings, profile editing, year-group changes, and printing must stay behind `ParentGate`.
4. **Foundation Stage UX (Ages 4–6):**
   - Minimum touch target size: `64px x 64px`.
   - Every prompt and interactive card must support audio playback (`audioKey`).
   - Avoid dense text instructions on child-facing screens; rely on visual cues, audio replay buttons, and tactile drag/tap controls.
5. **NI Localization:** Always use UK spelling (e.g., *colour*, *recognise*, *practise*), UK currency (`1p, 2p, 5p, 10p, 20p`), and CCEA Foundation Stage / Linguistic Phonics terminology.
