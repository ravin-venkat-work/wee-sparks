# Northern Ireland CCEA Foundation Stage Curriculum Map

**Wee Sparks Scope:** Primary 1 (`P1`) and Primary 2 (`P2`), ages 4–6 — **Northern Ireland CCEA Foundation Stage** only.

---

## 1. CCEA Areas of Learning: In Scope vs Deliberately Out of Scope

The Northern Ireland Foundation Stage Curriculum is organised into six Areas of Learning plus Religious Education. Wee Sparks intentionally focuses on **two core Areas of Learning** where short, audio-first tablet practice provides clear value, while encouraging off-screen play for the rest via Parent Bridge tips.

| CCEA Area of Learning / Stage | Status | Coverage in Wee Sparks | Rationale |
| :--- | :--- | :--- | :--- |
| **Language and Literacy** | **In Scope** | Talking & Listening (audio prompts/phonemes), Reading (NI Linguistic Phonics Stages 1–4, high-frequency words, decodable captions), Writing (Elkonin segmenting & guided letter formation with anti-reversal cues) | Directly supported by pure-phoneme audio playback, interactive sound boxes, and touch tracing |
| **Mathematics and Numeracy** | **In Scope** | Processes in Mathematics (visual modelling), Understanding Number (subitising 1–5, Ten-Frames 1–20), Number Operations (bonds to 5 & 10, addition/subtraction within 20 on number lines), Measures/Money (UK coins `1p`–`20p`), Shape and Space (2D & 3D shapes) | Concrete-pictorial visual tools (Ten-Frames, number lines, UK coin jars, shape buckets) map cleanly to 4–6 year old touch interactions |
| **The World Around Us** *(Science & Tech, Geography, History)* | **Out of Scope** *(thematic context only)* | Used purely as motivating visual themes (`space`, `dinosaurs`, `animals`, `vehicles`) and Northern Ireland cultural motifs (Giant's Causeway, Rathlin Puffin) | Best experienced through hands-on nature, experiments, and real-world exploration rather than screen drills |
| **The Arts** *(Art & Design, Music, Drama)* | **Out of Scope** | Not assessed or modelled as curriculum skills | Creative expression belongs on paper, paint, instruments, and imaginative play |
| **Personal Development & Mutual Understanding (PDMU)** | **Out of Scope** | Not modelled as curriculum skills | Social-emotional learning happens through relationships with family, teachers, and peers |
| **Physical Development & Movement (PE)** | **Out of Scope** | Not modelled as curriculum skills | Gross motor play belongs off-screen |
| **Religious Education (NI Core Syllabus)** | **Out of Scope** | Not modelled | Handled by families and schools per NI statutory guidance |
| **Key Stage 1 (`P3`–`P4`) & Key Stage 2 (`P5`–`P7`)** | **Out of Scope** | Strictly `P1`–`P2` in `YearGroupSchema` | KS1 requires multi-sentence reading, place value beyond 100, and written algorithms outside Foundation Stage UX |

---

## 2. Exercise Type → CCEA Area, Strand & UI Engine Mapping

All 10 Zod-validated exercise templates in [`packages/curriculum-schema/src/exercises.ts`](./packages/curriculum-schema/src/exercises.ts):

| Exercise Type (`type`) | UI Engine Component | CCEA Area of Learning | CCEA Strands Covered | Year Groups |
| :--- | :--- | :--- | :--- | :--- |
| `initial-sound-match` | `TapChoiceEngine` | Language & Literacy | Talking & Listening; NI Linguistic Phonics Stage 1 (`s,a,t,p,i,n`, `c,k,e,h,r,m,d`, `g,o,u,l,f,b...`) & Stage 3–4 digraph/double/vowel sound matching | P1, P2 |
| `cvc-blending` | `PhonicsBuilderEngine` | Language & Literacy | Reading; NI Linguistic Phonics Stage 1 (CVC), Stage 2 (CCVC/CVCC), Stage 3–4 (digraphs, double letters, target vowels) | P1, P2 |
| `phoneme-segment` | `PhonicsBuilderEngine` | Language & Literacy | Writing & Spelling; Elkonin sound-box segmenting (Stages 1–4) | P1, P2 |
| `high-frequency-word` | `TapChoiceEngine` | Language & Literacy | Reading; High-Frequency Words (`P1`) and Decodable Captions & Picture Comprehension (`P2`) | P1, P2 |
| `trace-glyph` | `TraceCanvasEngine` | Language & Literacy / Numeracy | Writing (guided letter formation with anti-reversal cues) & Understanding Number (numeral formation 1–9) | P1 |
| `ten-frame-count` | `TapChoiceEngine` (`count-to-numeral`) / `DragSortEngine` (`build-on-frame`) | Mathematics & Numeracy | Understanding Number (Subitising 1–5, Ten-Frames 1–10, Double Ten-Frames 11–20) | P1, P2 |
| `number-line-hop` | `NumberLineEngine` | Mathematics & Numeracy | Understanding Number & Number Operations (0–10 counting/bonds, 0–20 addition & subtraction) | P1, P2 |
| `number-bond` | `TapChoiceEngine` | Mathematics & Numeracy | Number Operations (Number Bonds to 5, Number Bonds to 10, part-whole within 20) | P1, P2 |
| `uk-coin-match` | `DragSortEngine` | Mathematics & Numeracy | Measures — Money (UK coins `1p, 2p, 5p` in P1; `1p, 2p, 5p, 10p, 20p` up to `20p` in P2) | P1, P2 |
| `shape-sort` | `DragSortEngine` | Mathematics & Numeracy | Shape and Space (2D shapes `circle, square, triangle, rectangle` in P1; 3D shapes `cube, sphere, cylinder, cone` in P2) | P1, P2 |

---

## 3. Complete CCEA Foundation Stage Micro-Skill Catalog (21 Skills)

All 21 canonical skills defined in [`packages/curriculum-schema/src/catalog.ts`](./packages/curriculum-schema/src/catalog.ts) have dedicated validated exercises across the offline JSON packs in `apps/web/src/data/packs/` (minimum 10+ exercises per skill):

### Primary 1 — Language & Literacy (6 Skills)

| Code | Skill ID | CCEA Strand / LP Stage | Exercise Types Used | Prerequisites |
| :--- | :--- | :--- | :--- | :--- |
| `P1.LIT.1` | `ccea-p1-lit-initial-satpin` | Linguistic Phonics Stage 1 (`s, a, t, p, i, n`) | `initial-sound-match`, `trace-glyph` | None |
| `P1.LIT.2` | `ccea-p1-lit-cvc-blend-satpin` | Linguistic Phonics Stage 1 (CVC blending) | `cvc-blending` | `P1.LIT.1` |
| `P1.LIT.3` | `ccea-p1-lit-initial-ckehrmd` | Linguistic Phonics Stage 1 (`c, k, e, h, r, m, d`) | `initial-sound-match`, `trace-glyph` | `P1.LIT.1` |
| `P1.LIT.4` | `ccea-p1-lit-cvc-segment-stage1` | Linguistic Phonics Stage 1 (Elkonin segmenting) | `phoneme-segment` | `P1.LIT.2`, `P1.LIT.3` |
| `P1.LIT.5` | `ccea-p1-lit-initial-goulfb` | Linguistic Phonics Stage 1 (`g, o, u, l, f, b, j, v, w, x, y, z`) | `initial-sound-match`, `trace-glyph` | `P1.LIT.3` |
| `P1.LIT.6` | `ccea-p1-lit-hfw-p1` | High-Frequency Words | `high-frequency-word` | `P1.LIT.2` |

### Primary 1 — Mathematics & Numeracy (5 Skills)

| Code | Skill ID | CCEA Strand | Exercise Types Used | Prerequisites |
| :--- | :--- | :--- | :--- | :--- |
| `P1.NUM.1` | `ccea-p1-num-subitise-1-5` | Number Sense (1–5) | `ten-frame-count`, `trace-glyph` | None |
| `P1.NUM.2` | `ccea-p1-num-ten-frames-1-10` | Number Sense (1–10) | `ten-frame-count`, `number-line-hop` | `P1.NUM.1` |
| `P1.NUM.3` | `ccea-p1-num-bonds-to-5` | Addition & Subtraction (within 5) | `number-bond`, `number-line-hop` | `P1.NUM.1` |
| `P1.NUM.4` | `ccea-p1-num-shapes-2d` | Shape & Space (2D) | `shape-sort` | None |
| `P1.NUM.5` | `ccea-p1-num-coins-1p-5p` | Measures — Money (`1p, 2p, 5p`) | `uk-coin-match` | `P1.NUM.1` |

### Primary 2 — Language & Literacy (5 Skills)

| Code | Skill ID | CCEA Strand / LP Stage | Exercise Types Used | Prerequisites |
| :--- | :--- | :--- | :--- | :--- |
| `P2.LIT.1` | `ccea-p2-lit-cvcc-ccvc` | Linguistic Phonics Stage 2 (CCVC / CVCC) | `cvc-blending`, `phoneme-segment` | `P1.LIT.4` |
| `P2.LIT.2` | `ccea-p2-lit-digraphs-sh-ch-th-ng` | Linguistic Phonics Stage 3–4 (`sh, ch, th, ng`) | `cvc-blending`, `phoneme-segment`, `initial-sound-match` | `P2.LIT.1` |
| `P2.LIT.3` | `ccea-p2-lit-double-letters` | Linguistic Phonics Stage 3 (`ff, ll, ss, zz`) | `cvc-blending`, `phoneme-segment` | `P2.LIT.1` |
| `P2.LIT.4` | `ccea-p2-lit-vowel-sounds` | Linguistic Phonics Stage 4 (`ee/ea, ai/ay, oa/ow`) | `cvc-blending`, `phoneme-segment`, `high-frequency-word` | `P2.LIT.2` |
| `P2.LIT.5` | `ccea-p2-lit-captions-comprehension` | Reading Comprehension (decodable captions) | `high-frequency-word` | `P1.LIT.6`, `P2.LIT.2` |

### Primary 2 — Mathematics & Numeracy (5 Skills)

| Code | Skill ID | CCEA Strand | Exercise Types Used | Prerequisites |
| :--- | :--- | :--- | :--- | :--- |
| `P2.NUM.1` | `ccea-p2-num-ten-frames-11-20` | Number Sense (Double Ten-Frames 11–20) | `ten-frame-count` (`frameSize: 20`) | `P1.NUM.2` |
| `P2.NUM.2` | `ccea-p2-num-bonds-to-10` | Addition & Subtraction (Bonds to 10) | `number-bond`, `number-line-hop` | `P1.NUM.2`, `P1.NUM.3` |
| `P2.NUM.3` | `ccea-p2-num-add-sub-within-20` | Addition & Subtraction (within 20) | `number-line-hop` (`max: 20`), `number-bond` | `P2.NUM.1`, `P2.NUM.2` |
| `P2.NUM.4` | `ccea-p2-num-coins-to-20p` | Measures — Money (`1p`–`20p`) | `uk-coin-match` | `P1.NUM.5`, `P2.NUM.2` |
| `P2.NUM.5` | `ccea-p2-num-shapes-3d` | Shape & Space (3D: cube, sphere, cylinder, cone) | `shape-sort` | `P1.NUM.4` |

---

## 4. Content Packs Inventory (`apps/web/src/data/packs/`)

| Pack File | Year Group | Purpose |
| :--- | :--- | :--- |
| `p1-starter-pack.json` | `P1` | Initial SATPIN sounds, CVC blending & Ten-Frames 1–10 |
| `p1-themed-expansion.json` | `P1` | Themed P1 phonics, sight words, shapes, bonds & 1p–5p coins |
| `p1-core-expansion.json` | `P1` | Sight words, 2D shape sorting, 0–10 number lines & glyph tracing |
| `p1-mastery-expansion.json` | `P1` | Deep mastery pool — 10+ new exercises for all 11 P1 CCEA skills |
| `p2-foundation-pack.json` | `P2` | Digraphs, CCVC, bonds to 10/20, 0–20 number lines & UK coins |
| `p2-mastery-expansion.json` | `P2` | Deep mastery pool — 10+ new exercises for all 10 P2 CCEA skills |

Validate all packs against the canonical Zod schemas anytime with:
```bash
pnpm validate:packs
```
