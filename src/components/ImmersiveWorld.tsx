"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Points,
  RGBAFormat,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  UnsignedByteType,
  Vector3,
} from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";

type QualityState = {
  isMobile: boolean;
  reducedMotion: boolean;
  dpr: [number, number];
};

type NebulaItem = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  rotation: number;
  driftX: number;
  driftY: number;
  speed: number;
};

type GalaxyItem = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  rotation: number;
  speed: number;
};

type ShootingStarState = {
  start: number;
  duration: number;
  from: Vector3;
  to: Vector3;
  scale: number;
  tilt: number;
};

const TAU = Math.PI * 2;

function pseudo(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createSoftTexture(size: number, power: number, noiseAmount: number) {
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const nx = (x / (size - 1)) * 2 - 1;
      const ny = (y / (size - 1)) * 2 - 1;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const base = Math.max(0, 1 - radius);
      const noise = 1 - noiseAmount + pseudo(x * 3.17 + y * 7.91 + size) * noiseAmount;
      const alpha = Math.pow(base, power) * noise;
      const value = Math.round(clamp(alpha, 0, 1) * 255);

      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = value;
    }
  }

  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  texture.needsUpdate = true;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  return texture;
}

function createTrailTexture(width: number, height: number) {
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const u = x / (width - 1);
      const v = (y / (height - 1)) * 2 - 1;
      const core = Math.exp(-Math.abs(v) * 10);
      const fade = Math.pow(1 - u, 1.6);
      const sparkle = 0.88 + pseudo(x * 1.71 + y * 6.41) * 0.12;
      const alpha = clamp(core * fade * sparkle, 0, 1);
      const value = Math.round(alpha * 255);

      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = value;
    }
  }

  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.needsUpdate = true;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  return texture;
}

function useQualityState(): QualityState {
  const [state, setState] = useState<QualityState>({
    isMobile: false,
    reducedMotion: false,
    dpr: [1, 1.75],
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 900px)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const isMobile = mobileQuery.matches;
      const reducedMotion = reducedQuery.matches;
      setState({
        isMobile,
        reducedMotion,
        dpr: isMobile ? [1, 1.35] : [1, 1.9],
      });
    };

    update();
    mobileQuery.addEventListener("change", update);
    reducedQuery.addEventListener("change", update);

    return () => {
      mobileQuery.removeEventListener("change", update);
      reducedQuery.removeEventListener("change", update);
    };
  }, []);

  return state;
}

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const drift = reducedMotion ? 0.08 : 0.16;
    const targetX = Math.sin(t * 0.025) * drift;
    const targetY = Math.cos(t * 0.02) * drift * 0.55;
    const targetZ = 7.6 + Math.sin(t * 0.018) * (reducedMotion ? 0.08 : 0.16);

    camera.position.x = MathUtils.damp(camera.position.x, targetX, 0.7, 1 / 60);
    camera.position.y = MathUtils.damp(camera.position.y, targetY, 0.7, 1 / 60);
    camera.position.z = MathUtils.damp(camera.position.z, targetZ, 0.7, 1 / 60);
    camera.rotation.z = MathUtils.damp(camera.rotation.z, Math.sin(t * 0.015) * 0.012, 0.5, 1 / 60);
    camera.lookAt(0, 0, -60);
  });

  return null;
}

function StarLayer({
  count,
  spread,
  depth,
  sizeRange,
  drift,
  colorA,
  colorB,
  density,
  rareBrightChance,
}: {
  count: number;
  spread: [number, number];
  depth: [number, number];
  sizeRange: [number, number];
  drift: number;
  colorA: string;
  colorB: string;
  density: number;
  rareBrightChance: number;
}) {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const pulses = new Float32Array(count);
    const drifts = new Float32Array(count);
    const highlights = new Float32Array(count);
    const colorStart = new Color(colorA);
    const colorEnd = new Color(colorB);

    for (let i = 0; i < count; i += 1) {
      const seed = i + count * 0.23;
      let x = 0;
      let y = 0;
      let accepted = false;

      for (let attempt = 0; attempt < 7; attempt += 1) {
        const attemptSeed = seed + attempt * 17.31;
        const candidateX = (pseudo(attemptSeed + 0.13) * 2 - 1) * spread[0];
        const candidateY = (pseudo(attemptSeed + 1.27) * 2 - 1) * spread[1];
        const nx = candidateX / spread[0];
        const ny = candidateY / spread[1];
        const radial = Math.sqrt(nx * nx + ny * ny);
        const band = Math.exp(-Math.pow((ny + Math.sin(nx * 3.2) * 0.12) / 0.26, 2));
        const fieldNoise = pseudo(attemptSeed + 8.71) * 0.45 + pseudo(attemptSeed * 1.91 + 2.07) * 0.55;
        const localDensity = clamp((0.16 + band * 0.28 + fieldNoise * 0.24 - radial * 0.18) * density, 0.035, 0.88);

        if (pseudo(attemptSeed + 4.47) < localDensity) {
          x = candidateX;
          y = candidateY;
          accepted = true;
          break;
        }
      }

      if (!accepted) {
        x = (pseudo(seed + 11.13) * 2 - 1) * spread[0];
        y = (pseudo(seed + 12.27) * 2 - 1) * spread[1];
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = -MathUtils.lerp(depth[0], depth[1], pseudo(seed + 2.91));

      const tone = pseudo(seed + 3.17);
      const mixed = colorStart.clone().lerp(colorEnd, tone);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;

      const sizeBias = Math.pow(pseudo(seed + 4.83), 2.8);
      const highlight = pseudo(seed + 9.91) > 1 - rareBrightChance ? 1 : 0;
      sizes[i] = MathUtils.lerp(sizeRange[0], sizeRange[1], highlight ? 0.85 + sizeBias * 0.15 : sizeBias);
      phases[i] = pseudo(seed + 5.61) * TAU;
      pulses[i] = MathUtils.lerp(0.025, 0.09, pseudo(seed + 6.47));
      drifts[i] = MathUtils.lerp(0.2, 0.7, pseudo(seed + 7.23));
      highlights[i] = highlight;
    }

    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(positions, 3));
    result.setAttribute("color", new BufferAttribute(colors, 3));
    result.setAttribute("aSize", new BufferAttribute(sizes, 1));
    result.setAttribute("aPhase", new BufferAttribute(phases, 1));
    result.setAttribute("aPulse", new BufferAttribute(pulses, 1));
    result.setAttribute("aDrift", new BufferAttribute(drifts, 1));
    result.setAttribute("aHighlight", new BufferAttribute(highlights, 1));
    return result;
  }, [colorA, colorB, count, density, depth, rareBrightChance, sizeRange, spread]);

  useFrame(({ clock, gl }) => {
    if (!materialRef.current || !pointsRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uPixelRatio.value = gl.getPixelRatio();
    pointsRef.current.position.x = Math.sin(clock.elapsedTime * 0.012 * drift) * drift * 0.08;
    pointsRef.current.position.y = Math.cos(clock.elapsedTime * 0.01 * drift) * drift * 0.05;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uDrift: { value: drift },
        }}
        vertexColors
        vertexShader={`
          attribute float aSize;
          attribute float aPhase;
          attribute float aPulse;
          attribute float aDrift;
          attribute float aHighlight;
          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uDrift;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vHighlight;

          void main() {
            vec3 pos = position;
            float depthFactor = clamp((-pos.z) / 120.0, 0.0, 1.0);
            pos.x += sin(uTime * 0.022 * aDrift * uDrift + aPhase) * (0.018 + (1.0 - depthFactor) * 0.08);
            pos.y += cos(uTime * 0.018 * aDrift * uDrift + aPhase * 1.3) * (0.012 + (1.0 - depthFactor) * 0.05);

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            float perspective = clamp(120.0 / -mvPosition.z, 0.0, 6.0);
            gl_PointSize = max(1.0, aSize * perspective * uPixelRatio);

            float pulse = 0.84 + sin(uTime * aPulse + aPhase) * (aHighlight > 0.5 ? 0.08 : 0.03);
            vAlpha = pulse * mix(0.52, 0.92, 1.0 - depthFactor);
            vColor = color;
            vHighlight = aHighlight;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          varying float vAlpha;
          varying float vHighlight;

          void main() {
            vec2 centered = gl_PointCoord - vec2(0.5);
            float dist = length(centered);
            float disc = smoothstep(0.5, 0.18, dist);
            float core = smoothstep(0.18, 0.0, dist);
            float sparkleX = exp(-abs(centered.x) * 32.0) * exp(-dist * 4.5);
            float sparkleY = exp(-abs(centered.y) * 32.0) * exp(-dist * 4.5);
            float sparkle = (sparkleX + sparkleY) * 0.16 * vHighlight;
            float alpha = disc * 0.72 + core * 0.28 + sparkle;

            if (alpha < 0.02) discard;
            gl_FragColor = vec4(vColor, alpha * vAlpha);
          }
        `}
      />
    </points>
  );
}

function StarClusters() {
  return null;
}

function NebulaClouds({ isMobile, reducedMotion }: { isMobile: boolean; reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);
  const spriteTexture = useMemo(() => createSoftTexture(160, 2.8, 0.32), []);
  const clouds = useMemo<NebulaItem[]>(
    () => [
      {
        position: [-18, 8, -88],
        scale: [48, 22, 1],
        color: "#182032",
        opacity: 0.045,
        rotation: 0.3,
        driftX: 1.2,
        driftY: -0.4,
        speed: 0.018,
      },
      {
        position: [16, -5, -72],
        scale: [36, 18, 1],
        color: "#161e30",
        opacity: 0.05,
        rotation: -0.45,
        driftX: -0.8,
        driftY: 0.35,
        speed: 0.02,
      },
      {
        position: [4, 12, -116],
        scale: [66, 28, 1],
        color: "#141b2b",
        opacity: 0.036,
        rotation: 0.12,
        driftX: 0.6,
        driftY: 0.2,
        speed: 0.014,
      },
      {
        position: [-6, -12, -98],
        scale: [54, 20, 1],
        color: "#20182c",
        opacity: 0.034,
        rotation: -0.2,
        driftX: -0.5,
        driftY: -0.25,
        speed: 0.016,
      },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, index) => {
      const config = clouds[index];
      const t = clock.elapsedTime * config.speed;
      child.position.x = config.position[0] + Math.sin(t) * config.driftX;
      child.position.y = config.position[1] + Math.cos(t * 0.8) * config.driftY;
      child.rotation.z = config.rotation + Math.sin(t * 0.6) * (reducedMotion ? 0.015 : 0.03);
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, index) => (
        <sprite
          key={index}
          position={cloud.position}
          scale={isMobile ? [cloud.scale[0] * 0.8, cloud.scale[1] * 0.8, 1] : cloud.scale}
          rotation={[0, 0, cloud.rotation]}
        >
          <spriteMaterial
            map={spriteTexture}
            color={cloud.color}
            opacity={cloud.opacity}
            depthWrite={false}
            transparent
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function DistantGalaxies({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<Group>(null);
  const texture = useMemo(() => createSoftTexture(128, 3.6, 0.18), []);
  const galaxies = useMemo<GalaxyItem[]>(
    () => [
      {
        position: [-24, 14, -132],
        scale: [12, 3.4, 1],
        color: "#c7d0df",
        opacity: 0.024,
        rotation: -0.45,
        speed: 0.008,
      },
      {
        position: [26, -10, -118],
        scale: [9, 2.8, 1],
        color: "#cad1dd",
        opacity: 0.018,
        rotation: 0.2,
        speed: 0.01,
      },
      {
        position: [8, 18, -142],
        scale: [6, 2.1, 1],
        color: "#eef2f8",
        opacity: 0.012,
        rotation: 0.5,
        speed: 0.006,
      },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, index) => {
      const galaxy = galaxies[index];
      child.rotation.z = galaxy.rotation + clock.elapsedTime * galaxy.speed;
    });
  });

  return (
    <group ref={groupRef}>
      {galaxies.map((galaxy, index) => (
        <sprite
          key={index}
          position={galaxy.position}
          scale={isMobile ? [galaxy.scale[0] * 0.8, galaxy.scale[1] * 0.8, 1] : galaxy.scale}
          rotation={[0, 0, galaxy.rotation]}
        >
          <spriteMaterial
            map={texture}
            color={galaxy.color}
            opacity={galaxy.opacity}
            depthWrite={false}
            transparent
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function AtmosphericHaze() {
  const texture = useMemo(() => createSoftTexture(128, 2.9, 0.24), []);
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.01) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0, -24]}>
      <sprite scale={[38, 18, 1]}>
        <spriteMaterial
          map={texture}
          color="#101826"
          opacity={0.028}
          depthWrite={false}
          transparent
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <sprite position={[10, -4, -16]} scale={[28, 14, 1]}>
        <spriteMaterial
          map={texture}
          color="#12192a"
          opacity={0.018}
          depthWrite={false}
          transparent
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

function ShootingStar({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Sprite>(null);
  const trailRef = useRef<Mesh>(null);
  const particleRefs = useRef<Sprite[]>([]);
  const headTexture = useMemo(() => createSoftTexture(64, 3.5, 0.12), []);
  const trailTexture = useMemo(() => createTrailTexture(128, 24), []);
  const nextEventRef = useRef(reducedMotion ? 24 : 18);
  const sequenceRef = useRef(0);
  const activeRef = useRef<ShootingStarState | null>(null);

  const schedule = (time: number) => {
    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;

    const side = Math.floor(pseudo(sequence * 4.21) * 4);
    const startY = MathUtils.lerp(-8, 10, pseudo(sequence * 5.31));
    const startZ = -MathUtils.lerp(18, 44, pseudo(sequence * 6.13));
    const span = MathUtils.lerp(16, 28, pseudo(sequence * 7.17));

    let from = new Vector3();
    let to = new Vector3();

    if (side === 0) {
      from = new Vector3(-24, startY, startZ);
      to = new Vector3(18, startY - span * 0.28, startZ + 8);
    } else if (side === 1) {
      from = new Vector3(24, startY, startZ);
      to = new Vector3(-18, startY - span * 0.22, startZ + 10);
    } else if (side === 2) {
      from = new Vector3(MathUtils.lerp(-14, 14, pseudo(sequence * 8.41)), 14, startZ);
      to = new Vector3(from.x + MathUtils.lerp(-12, 12, pseudo(sequence * 9.11)), -10, startZ + 8);
    } else {
      from = new Vector3(MathUtils.lerp(-12, 12, pseudo(sequence * 8.93)), -14, startZ);
      to = new Vector3(from.x + MathUtils.lerp(-16, 16, pseudo(sequence * 9.77)), 10, startZ + 6);
    }

    activeRef.current = {
      start: time,
      duration: reducedMotion ? 1.45 : MathUtils.lerp(1.1, 1.65, pseudo(sequence * 3.19)),
      from,
      to,
      scale: MathUtils.lerp(0.8, 1.3, pseudo(sequence * 10.63)),
      tilt: MathUtils.lerp(-0.08, 0.08, pseudo(sequence * 11.37)),
    };

    nextEventRef.current = time + MathUtils.lerp(15, 30, pseudo(sequence * 2.17));
  };

  useFrame(({ clock }) => {
    if (!groupRef.current || !trailRef.current) return;

    const time = clock.elapsedTime;
    if (!activeRef.current && time >= nextEventRef.current) {
      schedule(time);
    }

    const active = activeRef.current;
    if (!active) {
      groupRef.current.visible = false;
      return;
    }

    const progress = (time - active.start) / active.duration;
    if (progress >= 1) {
      activeRef.current = null;
      groupRef.current.visible = false;
      return;
    }

    const eased = MathUtils.smootherstep(progress, 0, 1);
    const position = active.from.clone().lerp(active.to, eased);
    const direction = active.to.clone().sub(active.from).normalize();

    groupRef.current.visible = true;
    groupRef.current.position.copy(position);
    groupRef.current.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), direction);
    groupRef.current.rotateZ(active.tilt);
    groupRef.current.scale.setScalar(active.scale);

    const headMaterial = headRef.current?.material as SpriteMaterial | undefined;
    if (headMaterial) {
      headMaterial.opacity = 0.75 + Math.sin(progress * Math.PI) * 0.25;
    }

    const trailMaterial = trailRef.current.material as MeshBasicMaterial;
    trailMaterial.opacity = 0.16 + Math.sin(progress * Math.PI) * 0.16;

    particleRefs.current.forEach((sprite, index) => {
      if (!sprite) return;
      const local = index / Math.max(1, particleRefs.current.length - 1);
      sprite.position.set(-1.8 - local * 5.5, (pseudo(index + sequenceRef.current) - 0.5) * 0.2, 0);
      const material = sprite.material as SpriteMaterial;
      material.opacity = (0.06 + (1 - local) * 0.1) * Math.sin(progress * Math.PI);
      sprite.scale.setScalar((0.18 + (1 - local) * 0.22) * active.scale);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={trailRef} position={[-3.2, 0, 0]}>
        <planeGeometry args={[7.8, 0.26]} />
        <meshBasicMaterial
          map={trailTexture}
          color="#f7fbff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <sprite ref={headRef}>
        <spriteMaterial
          map={headTexture}
          color="#ffffff"
          transparent
          opacity={1}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      {Array.from({ length: 7 }, (_, index) => (
        <sprite
          key={index}
          ref={(node) => {
            if (node) {
              particleRefs.current[index] = node;
            }
          }}
        >
          <spriteMaterial
            map={headTexture}
            color={index % 2 === 0 ? "#edf6ff" : "#cfdfff"}
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function SpaceScene({ isMobile, reducedMotion }: { isMobile: boolean; reducedMotion: boolean }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={[new Color("#000000"), 52, 190]} />
      <PerspectiveCamera makeDefault fov={isMobile ? 52 : 46} position={[0, 0, 7.6]} />
      <CameraRig reducedMotion={reducedMotion} />

      <ambientLight intensity={0.025} color="#cad6e8" />
      <pointLight position={[-18, 12, 20]} intensity={4.5} color="#d7e3ff" distance={220} />
      <pointLight position={[14, -10, 4]} intensity={2.2} color="#7582a1" distance={90} />

      <NebulaClouds isMobile={isMobile} reducedMotion={reducedMotion} />
      <AtmosphericHaze />
      <DistantGalaxies isMobile={isMobile} />
      <StarClusters />

      <StarLayer
        count={isMobile ? 240 : 420}
        spread={[92, 56]}
        depth={[56, 150]}
        sizeRange={[0.5, 0.95]}
        drift={0.18}
        colorA="#edf3ff"
        colorB="#d5ddea"
        density={0.18}
        rareBrightChance={0.003}
      />
      <StarLayer
        count={isMobile ? 95 : 180}
        spread={[56, 34]}
        depth={[22, 68]}
        sizeRange={[0.58, 1.08]}
        drift={0.24}
        colorA="#ffffff"
        colorB="#dde5f0"
        density={0.14}
        rareBrightChance={0.007}
      />
      <StarLayer
        count={isMobile ? 24 : 42}
        spread={[24, 15]}
        depth={[8, 22]}
        sizeRange={[0.75, 1.22]}
        drift={0.34}
        colorA="#f8fbff"
        colorB="#d8dfeb"
        density={0.1}
        rareBrightChance={0.018}
      />

      <ShootingStar reducedMotion={reducedMotion} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.28} luminanceThreshold={0.24} luminanceSmoothing={0.5} mipmapBlur />
        <DepthOfField focusDistance={0.014} focalLength={0.018} bokehScale={isMobile ? 0.45 : 0.65} />
        <Noise opacity={0.006} premultiply />
        <Vignette eskil={false} offset={0.24} darkness={0.82} />
      </EffectComposer>
    </>
  );
}

export function ImmersiveWorld() {
  const { isMobile, reducedMotion, dpr } = useQualityState();

  return (
    <main className="world-page" aria-label="Immersive deep space environment">
      <div className="world-fallback" aria-hidden="true">
        <div className="world-fallback__stars world-fallback__stars--far" />
        <div className="world-fallback__stars world-fallback__stars--mid" />
        <div className="world-fallback__stars world-fallback__stars--near" />
        <div className="world-fallback__haze world-fallback__haze--a" />
        <div className="world-fallback__haze world-fallback__haze--b" />
      </div>

      <div className="world-canvas">
        <Canvas dpr={dpr} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
          <SpaceScene isMobile={isMobile} reducedMotion={reducedMotion} />
        </Canvas>
      </div>
    </main>
  );
}
