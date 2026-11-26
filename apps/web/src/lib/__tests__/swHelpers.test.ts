import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveAudioCacheName,
  deriveAudioCacheVersion,
  extractNextStaticUrls,
} from "../swHelpers";

test("extractNextStaticUrls extracts full Next.js chunks, CSS, webpack, and media URLs without truncating on 's'", () => {
  const sampleHtml = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <link rel="stylesheet" href="/_next/static/css/9a8b7c6d5e4f.css" data-precedence="next"/>
  <link rel="preload" as="script" href="/_next/static/chunks/webpack-4a2b1c99.js"/>
  <link rel="preload" as="font" href='/_next/static/media/sparks-sans-latin.woff2' crossorigin=""/>
  <style>@font-face{src:url(/_next/static/media/extra-symbols.woff2)}</style>
</head>
<body>
  <script src="/_next/static/chunks/fd9d1056-1234abcd.js" async=""></script>
  <script src="/_next/static/chunks/main-app-99887766.js" async=""></script>
  <script src="/_next/static/chunks/app/page-55667788.js" async=""></script>
  <script src="/_next/static/chunks/webpack-4a2b1c99.js" async=""></script>
  <script src="/_next/static/build123/_ssgManifest.js" async=""></script>
  <img src="/icons/icon-192.png" alt="ignored"/>
</body>
</html>`;

  const urls = extractNextStaticUrls(sampleHtml);

  assert.deepEqual(urls, [
    "/_next/static/css/9a8b7c6d5e4f.css",
    "/_next/static/chunks/webpack-4a2b1c99.js",
    "/_next/static/media/sparks-sans-latin.woff2",
    "/_next/static/media/extra-symbols.woff2",
    "/_next/static/chunks/fd9d1056-1234abcd.js",
    "/_next/static/chunks/main-app-99887766.js",
    "/_next/static/chunks/app/page-55667788.js",
    "/_next/static/build123/_ssgManifest.js",
  ]);
});

test("extractNextStaticUrls handles empty or non-string input safely", () => {
  assert.deepEqual(extractNextStaticUrls(""), []);
  assert.deepEqual(extractNextStaticUrls("<html><body>Hello</body></html>"), []);
});

test("deriveAudioCacheName derives version from contentHash or generatedAt so re-recorded MP3s refresh", () => {
  const fromHashA = deriveAudioCacheName({
    contentHash: "a1b2c3d4e5f6",
    generatedAt: "2026-11-26T21:00:00.000Z",
  });
  const fromHashB = deriveAudioCacheName({
    contentHash: "99ff88ee77dd",
    generatedAt: "2026-11-26T21:00:00.000Z",
  });
  assert.equal(fromHashA, "wee-sparks-audio-a1b2c3d4e5f6");
  assert.equal(fromHashB, "wee-sparks-audio-99ff88ee77dd");
  assert.notEqual(fromHashA, fromHashB);

  // Falls back to sanitized generatedAt when contentHash is omitted
  const fromTimestamp = deriveAudioCacheName({
    generatedAt: "2026-11-26T21:55:12.345Z",
  });
  assert.equal(
    fromTimestamp,
    "wee-sparks-audio-2026-11-26t21-55-12-345z"
  );

  // Falls back cleanly to v1 when manifest is missing or empty
  assert.equal(deriveAudioCacheVersion(null), "v1");
  assert.equal(deriveAudioCacheName({}), "wee-sparks-audio-v1");
});
