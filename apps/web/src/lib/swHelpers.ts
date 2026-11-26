import { createRequire } from "node:module";

export interface AudioPrecacheManifest {
  version?: number;
  generatedAt?: string;
  contentHash?: string;
  totalExpected?: number;
  cachedAudioUrls?: string[];
}

interface SwHelpersModule {
  extractNextStaticUrls: (htmlText: string) => string[];
  deriveAudioCacheVersion: (manifest?: AudioPrecacheManifest | null) => string;
  deriveAudioCacheName: (manifest?: AudioPrecacheManifest | null) => string;
}

const require = createRequire(import.meta.url);
const helpers = require("../../public/sw-helpers.js") as SwHelpersModule;

export const extractNextStaticUrls = helpers.extractNextStaticUrls;
export const deriveAudioCacheVersion = helpers.deriveAudioCacheVersion;
export const deriveAudioCacheName = helpers.deriveAudioCacheName;
