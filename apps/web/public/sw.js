importScripts("/sw-helpers.js");

const { extractNextStaticUrls, deriveAudioCacheName } =
  self.WeeSparksSwHelpers;

const SHELL_CACHE_VERSION = "v2";
const SHELL_CACHE = `wee-sparks-shell-${SHELL_CACHE_VERSION}`;
const ASSET_CACHE = `wee-sparks-assets-${SHELL_CACHE_VERSION}`;
const DEFAULT_AUDIO_CACHE = "wee-sparks-audio-v1";
const AUDIO_MANIFEST_URL = "/audio/precache-manifest.json";

const CORE_SHELL_URLS = [
  "/",
  "/sw-helpers.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
];

let activeAudioCacheName = DEFAULT_AUDIO_CACHE;

async function safeCacheUrl(cache, url) {
  try {
    const request = new Request(url, { cache: "reload" });
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(url, response.clone());
      return response;
    }
  } catch {
    // Fault-tolerant precaching: ignore unavailable optional files
  }
  return null;
}

async function resolveActiveAudioCacheName() {
  try {
    const shellCache = await caches.open(SHELL_CACHE);
    const cachedManifest = await shellCache.match(AUDIO_MANIFEST_URL);
    if (cachedManifest) {
      const manifest = await cachedManifest.json();
      activeAudioCacheName = deriveAudioCacheName(manifest);
    }
  } catch {
    // Keep current activeAudioCacheName
  }
  return activeAudioCacheName;
}

async function precacheShellAndAssets() {
  const shellCache = await caches.open(SHELL_CACHE);
  const assetCache = await caches.open(ASSET_CACHE);

  const rootResponse = await safeCacheUrl(shellCache, "/");
  await Promise.allSettled(
    CORE_SHELL_URLS.filter((u) => u !== "/").map((url) =>
      safeCacheUrl(shellCache, url)
    )
  );

  if (rootResponse) {
    try {
      const html = await rootResponse.text();
      const staticUrls = extractNextStaticUrls(html);
      await Promise.allSettled(
        staticUrls.map((url) => safeCacheUrl(assetCache, url))
      );
    } catch {
      // Ignore HTML parse errors
    }
  }
}

async function precacheAllAudio() {
  try {
    const manifestRes = await fetch(
      new Request(AUDIO_MANIFEST_URL, { cache: "no-store" })
    );
    if (!manifestRes || !manifestRes.ok) return;

    const manifest = await manifestRes.clone().json();
    const audioCacheName = deriveAudioCacheName(manifest);
    activeAudioCacheName = audioCacheName;

    const shellCache = await caches.open(SHELL_CACHE);
    await shellCache.put(AUDIO_MANIFEST_URL, manifestRes.clone());

    const audioCache = await caches.open(audioCacheName);
    const urls = Array.isArray(manifest?.cachedAudioUrls)
      ? manifest.cachedAudioUrls.filter(
          (u) => typeof u === "string" && u.startsWith("/audio/")
        )
      : [];

    await Promise.allSettled(urls.map((url) => safeCacheUrl(audioCache, url)));
  } catch {
    // App remains functional offline with Web Speech fallback when audio manifest is unavailable
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([precacheShellAndAssets(), precacheAllAudio()]).then(() =>
      self.skipWaiting()
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    resolveActiveAudioCacheName()
      .then((currentAudioCache) => {
        const keep = new Set([SHELL_CACHE, ASSET_CACHE, currentAudioCache]);
        return caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith("wee-sparks-") && !keep.has(key))
                .map((key) => caches.delete(key))
            )
          );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (data.type === "PRECACHE_AUDIO_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(
      resolveActiveAudioCacheName()
        .then((cacheName) => caches.open(cacheName))
        .then((cache) =>
          Promise.allSettled(
            data.urls
              .filter((u) => typeof u === "string" && u.startsWith("/audio/"))
              .map((url) => safeCacheUrl(cache, url))
          )
        )
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Offline audio files: Cache-First in the manifest-versioned audio cache
  if (url.pathname.startsWith("/audio/")) {
    event.respondWith(
      resolveActiveAudioCacheName()
        .then((cacheName) => caches.open(cacheName))
        .then(async (cache) => {
          const cached = await cache.match(url.pathname);
          if (cached) return cached;
          try {
            const networkRes = await fetch(request);
            if (networkRes && networkRes.ok) {
              cache.put(url.pathname, networkRes.clone());
            }
            return networkRes;
          } catch {
            return new Response("", {
              status: 404,
              statusText: "Offline Audio Missing",
            });
          }
        })
    );
    return;
  }

  // 2. Immutable static bundles, icons, SW helpers, and web manifest: Cache-First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/sw-helpers.js"
  ) {
    const targetCache = url.pathname.startsWith("/_next/static/")
      ? ASSET_CACHE
      : SHELL_CACHE;
    event.respondWith(
      caches.open(targetCache).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const networkRes = await fetch(request);
        if (networkRes && networkRes.ok) {
          cache.put(request, networkRes.clone());
        }
        return networkRes;
      })
    );
    return;
  }

  // 3. App shell navigations: Network-First with offline fallback to cached `/`
  if (request.mode === "navigate") {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (shellCache) => {
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.ok) {
            shellCache.put("/", networkRes.clone());
          }
          return networkRes;
        } catch {
          const fallback =
            (await shellCache.match(request)) || (await shellCache.match("/"));
          if (fallback) return fallback;
          return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })
    );
  }
});
