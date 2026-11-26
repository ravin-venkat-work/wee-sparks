(function (root, factory) {
  const exportsObj = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = exportsObj;
  }
  if (root && typeof root === "object") {
    root.WeeSparksSwHelpers = exportsObj;
  }
})(typeof self !== "undefined" ? self : globalThis, function () {
  /**
   * Extracts all unique same-origin `/_next/static/...` asset URLs referenced
   * in rendered Next.js HTML (chunks, CSS, webpack runtime, media/fonts).
   */
  function extractNextStaticUrls(htmlText) {
    if (typeof htmlText !== "string" || htmlText.length === 0) {
      return [];
    }
    const urls = new Set();
    const regex = /\/_next\/static\/[^"'\s<>)]+/g;
    let match = regex.exec(htmlText);
    while (match) {
      urls.add(match[0]);
      match = regex.exec(htmlText);
    }
    return Array.from(urls);
  }

  /**
   * Derives a safe cache version token from `precache-manifest.json`
   * (preferring `contentHash`, falling back to `generatedAt`, then `"v1"`).
   */
  function deriveAudioCacheVersion(manifest) {
    if (!manifest || typeof manifest !== "object") {
      return "v1";
    }
    const raw =
      typeof manifest.contentHash === "string" && manifest.contentHash.trim()
        ? manifest.contentHash.trim()
        : typeof manifest.generatedAt === "string" &&
          manifest.generatedAt.trim()
        ? manifest.generatedAt.trim()
        : "";

    if (!raw) return "v1";

    const sanitized = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return sanitized || "v1";
  }

  /**
   * Builds the versioned Cache Storage name for precached offline audio.
   * Changes whenever `precache-manifest.json` updates so re-recorded MP3s refresh.
   */
  function deriveAudioCacheName(manifest) {
    return `wee-sparks-audio-${deriveAudioCacheVersion(manifest)}`;
  }

  return {
    extractNextStaticUrls,
    deriveAudioCacheVersion,
    deriveAudioCacheName,
  };
});
