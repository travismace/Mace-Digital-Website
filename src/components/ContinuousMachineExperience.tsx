"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import styles from "./ContinuousMachineExperience.module.css";

type CameraPilotProps = {
  progress: React.MutableRefObject<number>;
};

const machineLength = 310;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function CameraPilot({ progress }: CameraPilotProps) {
  useFrame(({ camera }) => {
    const p = progress.current;
    const z = MathUtils.lerp(18, -machineLength + 30, p);
    const side = Math.sin(p * Math.PI * 3.4) * 0.56;
    const lift = 5.7 + Math.sin(p * Math.PI * 2.1) * 0.34;
    const look = new Vector3(side * 0.15, 0.1, z - 18);

    camera.position.lerp(new Vector3(side, lift, z), 0.06);
    camera.lookAt(look);
  });

  return null;
}

function Panel({ z, side, turn }: { z: number; side: -1 | 1; turn: number }) {
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#edf1f5"),
        roughness: 0.2,
        metalness: 0.72,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.22,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [180, 460],
      }),
    []
  );

  return (
    <group position={[side * 5.5, 0.48, z]} rotation={[turn * side, side * 0.018, side * -0.008]}>
      <mesh material={material} castShadow receiveShadow>
        <boxGeometry args={[11.3, 0.78, 15.8, 8, 2, 8]} />
      </mesh>
      <mesh position={[-side * 0.02, -0.42, 0]} rotation={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[11.36, 0.06, 15.84]} />
        <meshPhysicalMaterial color="#c5ccd4" metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}

function EnergyConduit({ start, bend }: { start: number; bend: number }) {
  const geometry = useMemo(() => {
    const points = [
      new Vector3(0.1, -0.2, start + 6),
      new Vector3(bend * 0.1, -0.32, start + 1.5),
      new Vector3(bend * 0.18, -0.42, start - 4.5),
      new Vector3(bend * 0.1, -0.35, start - 10),
    ];
    return new TubeGeometry(new CatmullRomCurve3(points), 36, 0.23, 10, false);
  }, [bend, start]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color="#06121d" metalness={0.9} roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh geometry={geometry} scale={0.56}>
        <meshBasicMaterial color="#18cfff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Machine({ progress }: { progress: React.MutableRefObject<number> }) {
  const root = useRef<Group>(null);
  const panelData = useMemo(
    () =>
      Array.from({ length: 25 }, (_, index) => ({
        z: 12 - index * 13,
        turn: 0.016 + (index % 4) * 0.006,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!root.current) return;
    root.current.rotation.z = Math.sin(progress.current * Math.PI * 2) * 0.012;
    root.current.position.y = Math.sin(clock.elapsedTime * 0.13) * 0.025;
  });

  return (
    <group ref={root}>
      <mesh position={[0, -1.7, -machineLength / 2]} receiveShadow>
        <boxGeometry args={[28, 2.2, machineLength + 70]} />
        <meshPhysicalMaterial color="#060a0e" metalness={0.95} roughness={0.17} />
      </mesh>

      {panelData.flatMap((panel) => [
        <Panel key={`left-${panel.z}`} z={panel.z} side={-1} turn={panel.turn} />,
        <Panel key={`right-${panel.z}`} z={panel.z} side={1} turn={panel.turn} />,
      ])}

      <EnergyConduit start={-68} bend={-1} />
      <EnergyConduit start={-145} bend={1} />
      <EnergyConduit start={-220} bend={-1} />

      {[-76, -153, -228].map((z) => (
        <mesh key={z} position={[0, -0.18, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.05, 48]} />
          <meshBasicMaterial color="#0bd6ff" transparent opacity={0.5} toneMapped={false} side={DoubleSide} />
        </mesh>
      ))}

      <pointLight position={[0, 0.8, -73]} color="#16cfff" intensity={10} distance={22} />
      <pointLight position={[0, 0.8, -150]} color="#16cfff" intensity={11} distance={24} />
      <pointLight position={[0, 0.8, -225]} color="#16cfff" intensity={11} distance={24} />
    </group>
  );
}

function Scene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#dfe3e8"]} />
      <fog attach="fog" args={["#dfe3e8", 18, 112]} />
      <ambientLight intensity={1.35} color="#f6fbff" />
      <directionalLight position={[8, 14, 6]} intensity={5.4} color="#ffffff" castShadow />
      <directionalLight position={[-8, 5, -45]} intensity={3.2} color="#cce5ff" />
      <CameraPilot progress={progress} />
      <Machine progress={progress} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.72} luminanceThreshold={0.68} luminanceSmoothing={0.8} mipmapBlur />
        <Vignette eskil={false} offset={0.16} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export function ContinuousMachineExperience() {
  const progress = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const root = rootRef.current;
      if (!root) return;
      const top = root.offsetTop;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      progress.current = clamp01((window.scrollY - top) / travel);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <main ref={rootRef} className={styles.journey} aria-label="Mace Digital's continuous machine experience">
      <div className={styles.stage}>
        <Canvas
          dpr={[1, 2]}
          shadows
          camera={{ fov: 33, position: [0, 5.7, 18], near: 0.1, far: 500 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Scene progress={progress} />
        </Canvas>
      </div>
      <span className={styles.accessibleHint}>Scroll to travel through the machine.</span>
    </main>
  );
}
