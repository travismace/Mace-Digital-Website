"use client";

import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Quaternion, Vector3 } from "three";
import { CameraPath } from "./CameraPath";
import type { ScrollState } from "./ScrollController";

declare global {
  interface Window {
    __maceCameraPose?: {
      position: { x: number; y: number; z: number };
      lookAt: { x: number; y: number; z: number };
      progress: number;
    };
  }
}

type CameraRigProps = {
  path: CameraPath;
  scrollState: MutableRefObject<ScrollState>;
  reducedMotion: boolean;
};

const FIXED_DELTA = 1 / 60;

export function CameraRig({ path, scrollState, reducedMotion }: CameraRigProps) {
  const desiredLook = useRef(new Vector3());
  const desiredUp = useRef(new Vector3(0, 1, 0));
  const smoothedLook = useRef(new Vector3());
  const smoothedUp = useRef(new Vector3(0, 1, 0));
  const targetQuaternion = useRef(new Quaternion());
  const baseQuaternion = useRef(new Quaternion());
  const bankQuaternion = useRef(new Quaternion());
  const smoothedProgress = useRef(0);

  const origin = useMemo(() => new Vector3(), []);

  useEffect(() => {
    window.__maceCameraPose = {
      position: { x: 0, y: 0, z: 8 },
      lookAt: { x: 0, y: 0, z: -12 },
      progress: 0,
    };

    return () => {
      delete window.__maceCameraPose;
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta || FIXED_DELTA, 1 / 30);
    const state = scrollState.current;

    smoothedProgress.current = MathUtils.damp(
      smoothedProgress.current,
      state.targetProgress,
      reducedMotion ? 8.4 : 6.8,
      dt
    );

    const pose = path.getPose(smoothedProgress.current);
    const idleStrength = reducedMotion ? 0.16 : 1;
    const time = clock.elapsedTime;
    const velocityInfluence = MathUtils.clamp(state.velocity / 2800, 0, 1);

    const idleDrift = new Vector3(
      Math.sin(time * 0.28) * 0.02,
      Math.cos(time * 0.22) * 0.016,
      Math.sin(time * 0.16) * 0.028
    ).multiplyScalar(idleStrength);

    const stabilizer = new Vector3(
      Math.sin(time * 0.46 + state.progress * Math.PI * 1.1) * 0.006,
      Math.cos(time * 0.38 + state.progress * Math.PI * 0.74) * 0.005,
      0
    ).multiplyScalar(idleStrength * (1 - Math.min(1, velocityInfluence * 1.35)));

    const desiredPosition = pose.position.clone().add(idleDrift).add(stabilizer);

    camera.position.x = MathUtils.damp(camera.position.x, desiredPosition.x, reducedMotion ? 9 : 7.4, dt);
    camera.position.y = MathUtils.damp(camera.position.y, desiredPosition.y, reducedMotion ? 9 : 7.4, dt);
    camera.position.z = MathUtils.damp(camera.position.z, desiredPosition.z, reducedMotion ? 9 : 7.4, dt);

    desiredLook.current.copy(pose.target).add(
      origin.set(
        Math.sin(time * 0.18) * 0.016 * idleStrength,
        Math.cos(time * 0.15) * 0.012 * idleStrength,
        0
      )
    );

    desiredUp.current.copy(pose.up);

    smoothedLook.current.lerp(desiredLook.current, 1 - Math.exp(-dt * (reducedMotion ? 8.6 : 7.2)));
    smoothedUp.current.lerp(desiredUp.current, 1 - Math.exp(-dt * (reducedMotion ? 8.6 : 6.8))).normalize();

    camera.up.copy(smoothedUp.current);
    camera.lookAt(smoothedLook.current);

    baseQuaternion.current.copy(camera.quaternion);
    bankQuaternion.current.setFromAxisAngle(
      pose.tangent,
      pose.bank * 0.55 + Math.sin(time * 0.14 + state.progress * Math.PI * 2) * 0.003 * idleStrength
    );
    targetQuaternion.current.copy(baseQuaternion.current).multiply(bankQuaternion.current);

    camera.quaternion.slerp(targetQuaternion.current, 1 - Math.exp(-dt * (reducedMotion ? 8.8 : 7.4)));

    if (window.__maceCameraPose) {
      window.__maceCameraPose = {
        position: {
          x: Number(camera.position.x.toFixed(4)),
          y: Number(camera.position.y.toFixed(4)),
          z: Number(camera.position.z.toFixed(4)),
        },
        lookAt: {
          x: Number(smoothedLook.current.x.toFixed(4)),
          y: Number(smoothedLook.current.y.toFixed(4)),
          z: Number(smoothedLook.current.z.toFixed(4)),
        },
        progress: Number(smoothedProgress.current.toFixed(4)),
      };
    }
  });

  return <PerspectiveCamera makeDefault fov={42} position={[0, 0.12, 8]} />;
}
