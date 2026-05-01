"use client";

import { useCallback, useEffect } from "react";

export function useEscapeKey(enabled: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [enabled, onEscape]);
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}

export function useReducedMotionScroll() {
  return useCallback((element: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);
}
