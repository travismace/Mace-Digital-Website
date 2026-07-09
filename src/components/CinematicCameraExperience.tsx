"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Group } from "three";
import { CameraRig } from "./camera/CameraRig";
import { createCameraPath } from "./camera/CameraPath";
import { SceneController } from "./camera/SceneController";
import { ScrollController, type ScrollState } from "./camera/ScrollController";
import { SpaceEnvironment } from "./SpaceEnvironment";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function CinematicCameraExperience() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<Group | null>(null);
  const path = useMemo(() => createCameraPath(), []);
  const scrollState = useRef<ScrollState>({
    progress: 0,
    targetProgress: 0,
    velocity: 0,
    direction: 1,
    isInteracting: false,
  });

  const updateScrollState = useCallback((next: ScrollState) => {
    scrollState.current = next;
  }, []);

  return (
    <main ref={rootRef} className="camera-architecture" aria-label="Cinematic camera architecture testbed">
      <ScrollController rootRef={rootRef} onChange={updateScrollState} scrollDistanceVh={260} />

      <div className="camera-architecture__journey">
        <div className="camera-architecture__stage">
          <div className="camera-architecture__canvas-shell">
            <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
              <color attach="background" args={["#000000"]} />
              <CameraRig path={path} scrollState={scrollState} reducedMotion={reducedMotion} />
              <SpaceEnvironment reducedMotion={reducedMotion} scrollState={scrollState} />
              <SceneController path={path} scrollState={scrollState} anchorRef={anchorRef} />
            </Canvas>
          </div>
        </div>
      </div>
    </main>
  );
}
