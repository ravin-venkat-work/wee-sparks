"use client";

import { useEffect } from "react";

/**
 * Registers the offline-first Service Worker (`/sw.js`) in production builds
 * (or when `NEXT_PUBLIC_ENABLE_SW_IN_DEV=1`) so the app shell, static bundles,
 * icons, and all bundled audio precache reliably on tablets.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const shouldRegister =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "1";

    if (!shouldRegister) {
      return;
    }

    const register = () => {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Never block child gameplay if SW registration is restricted (e.g. private mode).
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
