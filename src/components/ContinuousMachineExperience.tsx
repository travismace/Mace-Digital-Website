"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Shape,
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

function createBonnetShape(side: -1 | 1) {
  const mirror = (value: number) => value * side;
  const shape = new Shape();

  shape.moveTo(mirror(0.65), -10.8);
  shape.quadraticCurveTo(mirror(4.4), -12.4, mirror(10.4), -8.6);
  shape.quadraticCurveTo(mirror(12.3), -4.3, mirror(10.1), -0.6);
  shape.quadraticCurveTo(mirror(12.6), 3.8, mirror(8.8), 10.6);
  shape.quadraticCurveTo(mirror(4.2), 12.2, mirror(0.65), 10.1);
  shape.quadraticCurveTo(mirror(0.15), 7.2, mirror(0.45), 3.8);
  shape.quadraticCurveTo(mirror(0.9), 0, mirror(0.4), -3.7);
  shape.quadraticCurveTo(mirror(0.1), -7.5, mirror(0.65), -10.8);

  return shape;
}

function BonnetPanel({ z, side, drift }: { z: number; side: -1 | 1; drift: number }) {
  const geometry = useMemo(
    () =>
      new ExtrudeGeometry(createBonnetShape(side), {
        depth: 0.72,
        bevelEnabled: true,
        bevelSegments: 5,
        bevelSize: 0.3,
        bevelThickness: 0.34,
        curveSegments: 36,
      }),
    [side]
  );
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#f1f5f8"),
        roughness: 0.16,
        metalness: 0.58,
        clearcoat: 1,
        clearcoatRoughness: 0.045,
        iridescence: 0.32,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [190, 520],
        side: DoubleSide,
      }),
    []
  );

  return (
    <group position={[0, 0.05, z]} rotation={[-Math.PI / 2 + drift * side, 0, side * 0.012]}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      <mesh position={[0, 0, -0.08]} geometry={geometry} scale={[1.005, 1.005, 0.18]} receiveShadow>
        <meshPhysicalMaterial color="#bac4ce" metalness={0.72} roughness={0.22} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function EnergyConduit({ start, bend }: { start: number; bend: number }) {
  const geometry = useMemo(() => {
    const points = [
      new Vector3(0.15, -0.72, start + 7),
      new Vector3(bend * 0.55, -0.88, start + 2),
      new Vector3(bend * 1.15, -0.95, start - 4.5),
      new Vector3(bend * 0.42, -0.84, start - 11),
    ];
    return new TubeGeometry(new CatmullRomCurve3(points), 72, 0.2, 18, false);
  }, [bend, start]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color="#06121d" metalness={0.9} roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh geometry={geometry} scale={0.46}>
        <meshBasicMaterial color="#18cfff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Machine({ progress }: { progress: React.MutableRefObject<number> }) {
  const root = useRef<Group>(null);
  const panelData = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) => ({
        z: 15 - index * 21.2,
        drift: 0.008 + (index % 4) * 0.004,
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
      <mesh position={[0, -1.9, -machineLength / 2]} receiveShadow>
        <boxGeometry args={[31, 2.4, machineLength + 70]} />
        <meshPhysicalMaterial color="#04080d" metalness={0.96} roughness={0.13} clearcoat={1} />
      </mesh>

      {panelData.flatMap((panel) => [
        <BonnetPanel key={`left-${panel.z}`} z={panel.z} side={-1} drift={panel.drift} />,
        <BonnetPanel key={`right-${panel.z}`} z={panel.z} side={1} drift={panel.drift} />,
      ])}

      <EnergyConduit start={-94} bend={-1} />
      <EnergyConduit start={-176} bend={1} />
      <EnergyConduit start={-252} bend={-1} />

      <pointLight position={[-0.6, 0.2, -99]} color="#16cfff" intensity={5.6} distance={14} />
      <pointLight position={[0.8, 0.2, -181]} color="#16cfff" intensity={6.2} distance={14} />
      <pointLight position={[-0.6, 0.2, -257]} color="#16cfff" intensity={6.2} distance={14} />
    </group>
  );
}

function Scene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#dfe3e8"]} />
      <fog attach="fog" args={["#dfe3e8", 15, 88]} />
      <ambientLight intensity={1.15} color="#f6fbff" />
      <directionalLight position={[8, 14, 6]} intensity={6.5} color="#ffffff" castShadow />
      <directionalLight position={[-8, 5, -45]} intensity={3.8} color="#cce5ff" />
      <CameraPilot progress={progress} />
      <Machine progress={progress} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.5} luminanceThreshold={0.76} luminanceSmoothing={0.82} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.3} />
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
