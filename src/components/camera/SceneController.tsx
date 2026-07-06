"use client";

import { MutableRefObject, useEffect } from "react";
import { Group } from "three";
import { CameraPath } from "./CameraPath";
import type { ScrollState } from "./ScrollController";

type SceneControllerProps = {
  path: CameraPath;
  scrollState: MutableRefObject<ScrollState>;
  anchorRef: MutableRefObject<Group | null>;
};

declare global {
  interface Window {
    __maceCameraDebug?: {
      getState: () => {
        progress: number;
        targetProgress: number;
        velocity: number;
        direction: number;
        anchorPosition: { x: number; y: number; z: number } | null;
      };
    };
  }
}

export function SceneController({ path, scrollState, anchorRef }: SceneControllerProps) {
  useEffect(() => {
    window.__maceCameraDebug = {
      getState: () => {
        const anchor = anchorRef.current;
        const pose = window.__maceCameraPose;
        return {
          progress: scrollState.current.progress,
          targetProgress: scrollState.current.targetProgress,
          velocity: scrollState.current.velocity,
          direction: scrollState.current.direction,
          anchorPosition: anchor
            ? {
                x: Number(anchor.position.x.toFixed(4)),
                y: Number(anchor.position.y.toFixed(4)),
                z: Number(anchor.position.z.toFixed(4)),
              }
            : null,
          cameraPosition: pose?.position ?? null,
          lookAt: pose?.lookAt ?? null,
          smoothedProgress: pose?.progress ?? 0,
        };
      },
    };

    return () => {
      delete window.__maceCameraDebug;
    };
  }, [anchorRef, scrollState]);

  const firstPose = path.getPose(0);

  return <group ref={anchorRef} position={firstPose.target} visible={false} />;
}
