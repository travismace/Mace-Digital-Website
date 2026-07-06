"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ScrollState = {
  progress: number;
  targetProgress: number;
  velocity: number;
  direction: number;
  isInteracting: boolean;
};

type ScrollControllerProps = {
  rootRef: RefObject<HTMLElement | null>;
  onChange?: (next: ScrollState) => void;
  scrollDistanceVh?: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const noop = () => {};

export function ScrollController({ rootRef, onChange = noop, scrollDistanceVh = 900 }: ScrollControllerProps) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.style.setProperty("--scroll-distance", `${scrollDistanceVh}vh`);

    let frame = 0;
    let settleTimer = 0;
    let lastProgress = 0;
    let lastSampleTime = performance.now();
    let lastDirection = 1;

    const sample = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const next = clamp01(-rect.top / distance);
      const now = performance.now();
      const elapsed = Math.max(16, now - lastSampleTime);
      const delta = next - lastProgress;
      const direction = delta === 0 ? lastDirection : delta > 0 ? 1 : -1;
      const velocity = Math.abs(delta) / (elapsed / 1000);

      onChange({
        progress: next,
        targetProgress: next,
        velocity,
        direction,
        isInteracting: velocity > 0.0008,
      });

      lastProgress = next;
      lastSampleTime = now;
      lastDirection = direction;

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        onChange({
          progress: lastProgress,
          targetProgress: lastProgress,
          velocity: 0,
          direction: lastDirection,
          isInteracting: false,
        });
      }, 120);
    };

    const requestSample = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sample);
    };

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => `+=${Math.max(1, root.offsetHeight - window.innerHeight)}`,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onRefresh: requestSample,
      onUpdate: requestSample,
    });

    sample();
    window.addEventListener("scroll", requestSample, { passive: true });
    window.addEventListener("resize", requestSample);
    ScrollTrigger.refresh();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("scroll", requestSample);
      window.removeEventListener("resize", requestSample);
      trigger.kill();
    };
  }, [onChange, rootRef, scrollDistanceVh]);

  return null;
}
