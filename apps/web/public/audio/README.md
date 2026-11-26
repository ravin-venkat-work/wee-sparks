# Wee Sparks Offline Audio Library (`public/audio`)

Wee Sparks is **audio-first and offline-first** for Northern Ireland CCEA Foundation Stage (Primary 1 & Primary 2, ages 4–6). When static MP3 files exist under `apps/web/public/audio/`, the app plays them immediately and precaches them in the Service Worker for full offline tablet use (falling back to browser speech synthesis only for clips that have not been recorded yet).

---

## 1. Folder Structure (`resolveAudioUrl`)

[`resolveAudioUrl`](../../src/lib/audioUrls.ts) maps every `audioKey` as follows:

- `phoneme/<slug>` **and** `phonemes/<slug>` → `/audio/phonemes/<slug>.mp3`
- Any other `<category>/<slug>` → `/audio/<category>/<slug>.mp3`

```text
apps/web/public/audio/
├── phonemes/    # PRIORITY 1 — Pure NI Linguistic Phonics sounds (/s/, /a/, /t/, /sh/, /ch/, /th/, /ng/...)
├── word/        # Target CVC/CCVC words & high-frequency sight words (sat, pin, ship, the...)
├── prompt/      # Spoken instructions for each exercise & welcome screen
├── hint/        # Gentle audio hints when a child taps 💡
├── feedback/    # Shared 24-clip pool (praise-01..12, try-again-01..12) + quest-complete
├── object/      # Picture vocabulary & visual item labels (rocket, puffin, digger...)
├── number/      # Spoken numbers 0–20 for ten-frames, bonds & number lines
├── shape/       # 2D shapes (circle, square, triangle, rectangle, hexagon...)
├── coin/        # UK coins & pence totals (1p, 2p, 5p, 10p, 20p, 7p...)
├── sentence/    # Short context sentences for high-frequency words
├── sticker/     # Cheer lines for unlocked stickers in the Sticker Chest
└── precache-manifest.json  # Auto-generated list of bundled MP3s for the Service Worker
```

---

## 2. Checking Missing MP3s & Updating Offline Precache

From the repository root:

```bash
# Full report of every audioKey across all packs + UI, and which MP3s are missing
pnpm audit:audio

# Show only missing MP3s with their target file paths and script text
pnpm audit:audio -- --missing-only

# After adding MP3 recordings, refresh public/audio/precache-manifest.json
# so the Service Worker precaches every bundled audio file offline
pnpm audit:audio -- --write-manifest
```

---

## 3. Recording Guidelines (NI Accent & Pure Phonemes)

### Priority 1: Pure Phonemes — **No Added `"uh"` (Zero Schwa)**

In **Northern Ireland Linguistic Phonics**, children blend isolated sounds together to read words. Adding a trailing vowel (`"tuh"`, `"puh"`, `"suh"`) breaks blending (`c-a-t` sounds like *"cuh-a-tuh"* instead of *"cat"*).

| Sound Type | Phonemes | How to Record (Pure Sound) | Avoid |
| :--- | :--- | :--- | :--- |
| **Stretchy / Continuous** | `s`, `m`, `n`, `f`, `l`, `r`, `v`, `z`, `sh`, `th` | Hold a clean, steady breathy/voiced stream for ~0.5–0.7s: *ssss*, *mmmm*, *nnnn*, *ffff*, *shhh*, *thhh* | *"suh"*, *"muh"*, *"fuh"*, *"shuh"* |
| **Short Unvoiced Stops** | `t`, `p`, `c` / `k`, `h`, `ch` | Crisp, whispered release of air — almost no voice box vibration | *"tuh"*, *"puh"*, *"kuh"*, *"chuh"* |
| **Short Voiced Stops** | `b`, `d`, `g`, `j`, `w`, `y` | Quick, clipped onset cut off cleanly before a vowel forms | *"buh"*, *"duh"*, *"guh"* |
| **Short Vowels (NI)** | `a`, `e`, `i`, `o`, `u` | Natural Northern Ireland short vowels as in *cat*, *pet*, *pin*, *pot*, *cup* (~0.35–0.45s) | Letter names (*"ay"*, *"ee"*, *"eye"*) |
| **Nasal Digraph** | `ng` | Clean final sound from *ring* / *king* without a hard `"g"` release | *"nuh-guh"* |

### Voice & Northern Ireland Accent Style
- **Accent**: Natural, warm **Northern Ireland (Ulster English)** accent — conversational and familiar to P1–P2 children across NI.
- **Tone & Pace**: Friendly, calm, encouraging primary-teacher pace (~10–15% slower than adult conversation, never patronising).
- **Vocabulary**: Use UK/NI phrasing matching the packs (*pence / "five p"*, *colour*, *recognise*, *practise*).

### Technical Audio Specification
- **Format**: MP3 (`.mp3`), **Mono**, **44.1 kHz**, **96–128 kbps CBR** (keeps total offline pack size small for school tablets).
- **Loudness**: Normalize all clips to **-16 LUFS** (True Peak ≤ -1.5 dBTP) so prompts, phonemes, and praise match volume consistently.
- **Trimming**: Trim leading silence to **< 30 ms** (crucial for crisp phoneme taps and Elkonin blending sweeps!) and trailing silence to **< 80 ms**.
- **Environment**: Quiet room with soft furnishings, pop filter, 15–20 cm from microphone, zero background fan/AC hum.

#### Batch Normalize & Convert with `ffmpeg`
```bash
# Convert a WAV recording to trimmed, normalized mono MP3 ready for public/audio/
ffmpeg -i input.wav \
  -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ac 1 -ar 44100 -b:a 112k output.mp3
```

After placing new MP3 files into the matching subfolders, run:
```bash
pnpm audit:audio -- --write-manifest
```
so `public/audio/precache-manifest.json` includes every new file for offline Service Worker precaching.
