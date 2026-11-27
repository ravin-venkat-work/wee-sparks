# ✨ Wee Sparks

An offline-first, audio-first literacy and numeracy learning app built for **Primary 1 and Primary 2 children (ages 4–6)** in Northern Ireland, mapped directly to the **CCEA Foundation Stage** curriculum.

## Scope
- **Year Groups:** Primary 1 (`P1`) and Primary 2 (`P2`) — **CCEA Foundation Stage only** (ages 4–6).
- **Areas of Learning Covered:** **Language and Literacy** (NI Linguistic Phonics Stages 1–4, high-frequency words, captions, and guided letter formation) and **Mathematics and Numeracy** (subitising, Ten-Frames 1–20, number bonds, number lines, 2D/3D shapes, and UK coins `1p`–`20p`).
- **Out of Scope:** Primary 3 / Key Stage 1+ and the other CCEA Areas of Learning (The Arts, The World Around Us, PDMU, Physical Development & Movement, and Religious Education) are deliberately excluded from screen-based drills and instead encouraged through offline parent tips. See [CURRICULUM_MAP.md](./CURRICULUM_MAP.md) for the full mapping.

## Core Principles
- **CCEA Curriculum Aligned:** Built around NI Linguistic Phonics and practical Foundation Stage number sense rather than generic English standards.
- **Zero Runtime AI:** 100% deterministic, offline-capable student runtime in `apps/web` with pre-validated JSON content packs generated offline via `tools/content-studio`.
- **Child-Safe & Privacy-First:** Designed for the UK ICO Children's Code with local-first Dexie (IndexedDB) storage using bare-minimum PII (nicknames only), a spoken-free `ParentGate` protecting adult settings and printing, zero third-party ad/behavioral trackers, and cookieless first-party Vercel Web Analytics limited strictly to aggregate page views and web vitals (zero child/parent identifiers or custom learner telemetry).
- **Offline PWA & Audio-First UX:** Touch targets `>= 64px × 64px`, service-worker precaching of the app shell and bundled MP3s (`apps/web/public/audio/`), and plain-English Parent Bridge mastery & printable A4 practice sheets.

## Workspace Scripts
```bash
pnpm dev              # Run apps/web locally
pnpm typecheck        # Typecheck curriculum-schema, web, and content-studio
pnpm test             # Run unit tests (adaptive, ParentGate, RewardBurst, state machine, audio audit)
pnpm validate:packs   # Validate all CCEA JSON packs against Zod schemas
pnpm audit:audio      # List every pack/UI audioKey and report missing MP3 recordings
```
