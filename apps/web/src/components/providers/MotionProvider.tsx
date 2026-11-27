"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import {
  isCalmModeEnabled,
  resolveMotionReductionMode,
  subscribeCalmMode,
} from "@/lib/sensory";

const CalmModeContext = createContext<boolean>(false);

export function useCalmMode(): boolean {
  return useContext(CalmModeContext);
}

/**
 * Root motion provider respecting both OS prefers-reduced-motion ("user")
 * and the in-app parent/calm-mode toggle ("always" + data-calm-mode CSS hook).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [calmMode, setCalmMode] = useState(false);

  useEffect(() => {
    const initial = isCalmModeEnabled();
    setCalmMode(initial);
    document.documentElement.dataset.calmMode = initial ? "true" : "false";

    return subscribeCalmMode((next) => {
      setCalmMode(next);
      document.documentElement.dataset.calmMode = next ? "true" : "false";
    });
  }, []);

  return (
    <CalmModeContext.Provider value={calmMode}>
      <MotionConfig reducedMotion={resolveMotionReductionMode(calmMode)}>
        {children}
      </MotionConfig>
    </CalmModeContext.Provider>
  );
}
