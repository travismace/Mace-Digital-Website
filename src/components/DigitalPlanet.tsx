"use client";

import { MutableRefObject, type RefObject, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  MathUtils,
  DirectionalLight,
  PointLight,
  PointsMaterial,
  ShaderMaterial,
  Vector3,
} from "three";
import type { ScrollState } from "./camera/ScrollController";

type DigitalPlanetProps = {
  reducedMotion: boolean;
  scrollState: MutableRefObject<ScrollState>;
};

type ElectricShellProps = {
  materialRef: RefObject<ShaderMaterial | null>;
  scale?: number;
  opacityBoost?: number;
};

type InteriorStormProps = {
  reducedMotion: boolean;
  intensityRef: RefObject<number>;
  travelRef: RefObject<number>;
};

type ExteriorEnergyProps = {
  reducedMotion: boolean;
  activityRef: RefObject<number>;
};

type ExteriorFieldProps = {
  materialRef: RefObject<ShaderMaterial | null>;
  scale?: number;
  opacityBoost?: number;
};

const PLANET_RADIUS = 46;
const PLANET_CENTER = new Vector3(0.04, -1.16, -820);
const SURFACE_START_DISTANCE = 900;
const SURFACE_END_DISTANCE = 118;
const ATMOSPHERE_START_DISTANCE = PLANET_RADIUS * 2.05;
const ATMOSPHERE_FULL_DISTANCE = PLANET_RADIUS * 0.78;
const INSIDE_START_DISTANCE = PLANET_RADIUS * 1.06;
const INSIDE_FULL_DISTANCE = PLANET_RADIUS * 0.22;

function remapClamped(value: number, inMin: number, inMax: number) {
  return MathUtils.clamp((value - inMin) / (inMax - inMin), 0, 1);
}

function pseudo(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function createParticleData() {
  const count = 180;
  const positions = new Float32Array(count * 2 * 3);
  const base = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const seed = i + 1;
    const radius = Math.pow(pseudo(seed * 1.37), 0.72) * PLANET_RADIUS * 0.82;
    const theta = pseudo(seed * 2.11) * Math.PI * 2;
    const phi = Math.acos(MathUtils.lerp(-1, 1, pseudo(seed * 3.17)));
    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.cos(phi) * radius;
    const z = Math.sin(phi) * Math.sin(theta) * radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    base[i * 3] = x;
    base[i * 3 + 1] = y;
    base[i * 3 + 2] = z;
    seeds[i] = pseudo(seed * 4.29) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, base, seeds };
}

function createArcData() {
  const arcCount = 14;
  const segmentsPerArc = 12;
  const positions = new Float32Array(arcCount * segmentsPerArc * 2 * 3);
  const seeds = new Float32Array(arcCount);

  for (let i = 0; i < arcCount; i += 1) {
    seeds[i] = pseudo((i + 1) * 5.73) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

function createTrailData() {
  const count = 72;
  const positions = new Float32Array(count * 2 * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const seed = i + 1;
    positions[i * 3] = (pseudo(seed * 3.2) - 0.5) * PLANET_RADIUS * 1.4;
    positions[i * 3 + 1] = (pseudo(seed * 4.1) - 0.5) * PLANET_RADIUS * 1.4;
    positions[i * 3 + 2] = (pseudo(seed * 5.3) - 0.5) * PLANET_RADIUS * 1.4;
    seeds[i] = pseudo(seed * 6.7) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

const PARTICLE_DATA = createParticleData();
const ARC_DATA = createArcData();
const TRAIL_DATA = createTrailData();

function createAtmosphereArcData() {
  const arcCount = 18;
  const segmentsPerArc = 12;
  const positions = new Float32Array(arcCount * segmentsPerArc * 2 * 3);
  const seeds = new Float32Array(arcCount);

  for (let i = 0; i < arcCount; i += 1) {
    seeds[i] = pseudo((i + 1) * 7.13) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

function createMagneticCurrentData() {
  const count = 72;
  const positions = new Float32Array(count * 2 * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    seeds[i] = pseudo((i + 1) * 8.91) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

function createChargedParticleData() {
  const count = 40;
  const positions = new Float32Array(count * 2 * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    seeds[i] = pseudo((i + 1) * 10.27) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

function createSpaceLightningData() {
  const arcCount = 8;
  const segmentsPerArc = 12;
  const positions = new Float32Array(arcCount * segmentsPerArc * 2 * 3);
  const seeds = new Float32Array(arcCount);

  for (let i = 0; i < arcCount; i += 1) {
    seeds[i] = pseudo((i + 1) * 12.43) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

function createFlareParticleData() {
  const count = 24;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    seeds[i] = pseudo((i + 1) * 14.77) * 100;
  }

  const geometry = new BufferGeometry();
  const attribute = new Float32BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  return { geometry, positions, seeds };
}

const ATMOSPHERE_ARC_DATA = createAtmosphereArcData();
const MAGNETIC_CURRENT_DATA = createMagneticCurrentData();
const CHARGED_PARTICLE_DATA = createChargedParticleData();
const SPACE_LIGHTNING_DATA = createSpaceLightningData();
const FLARE_PARTICLE_DATA = createFlareParticleData();

const sharedNoise = `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amplitude;
      p = p * 2.02 + vec3(3.1, 2.7, 1.9);
      amplitude *= 0.52;
    }
    return value;
  }
`;

function ElectricShell({ materialRef, scale = 1, opacityBoost = 1 }: ElectricShellProps) {
  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[PLANET_RADIUS, 160, 160]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uApproach: { value: 0 },
          uInside: { value: 0 },
          uOpacityBoost: { value: opacityBoost },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vNormalWorld;
          varying vec3 vLocalPosition;

          void main() {
            vLocalPosition = position;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vNormalWorld = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uApproach;
          uniform float uInside;
          uniform float uOpacityBoost;
          varying vec3 vWorldPosition;
          varying vec3 vNormalWorld;
          varying vec3 vLocalPosition;
          ${sharedNoise}

          void main() {
            vec3 normal = normalize(vNormalWorld);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            vec3 localDir = normalize(vLocalPosition);

            float facing = max(dot(normal, viewDir), -1.0);
            float frontFacing = pow(abs(facing), 1.35);
            float rim = pow(1.0 - abs(facing), 2.15);
            float internalRim = pow(1.0 - max(dot(-normal, viewDir), 0.0), 2.5);
            float fresnel = max(rim, internalRim * 0.45);

            vec3 flowCoord = localDir * 5.4;
            flowCoord += vec3(uTime * 0.08, -uTime * 0.06, uTime * 0.05);
            float flowA = fbm(flowCoord);
            float flowB = fbm(localDir * 10.0 + vec3(-uTime * 0.18, uTime * 0.12, uTime * 0.15));
            float flowC = fbm(localDir * 15.0 + vec3(uTime * 0.35, -uTime * 0.22, uTime * 0.28));

            float veinField = abs(flowB - 0.5);
            float veins = 1.0 - smoothstep(0.03, 0.12, veinField);
            float arcs = smoothstep(0.68, 0.96, flowC + flowA * 0.25);
            float electric = veins * (0.7 + flowA * 0.6) + arcs * 1.15;
            float frontalCharge = smoothstep(0.18, 0.88, flowA * 0.5 + flowB * 0.35 + flowC * 0.25);

            vec3 cyan = vec3(0.12, 0.82, 1.0);
            vec3 purple = vec3(0.62, 0.38, 1.0);
            vec3 electricColor = mix(cyan, purple, smoothstep(0.35, 0.95, flowC));
            vec3 glassTint = mix(vec3(0.02, 0.09, 0.18), vec3(0.04, 0.16, 0.34), flowA * 0.6 + 0.2);

            float opacity = (0.08 + fresnel * 0.54 + electric * 0.22) * uOpacityBoost;
            opacity *= mix(1.0, 0.6, uInside);
            opacity += (0.06 + uApproach * 0.1) * (1.0 - uInside);
            opacity += uInside * (0.16 + electric * 0.16 + arcs * 0.12);
            opacity += frontalCharge * frontFacing * (0.06 + uApproach * 0.16 + uInside * 0.08);

            vec3 color = glassTint * 0.5;
            color += electricColor * electric * (0.65 + uApproach * 0.85);
            color += electricColor * fresnel * (0.42 + uApproach * 0.5);
            color += vec3(0.14, 0.5, 1.0) * arcs * 0.35;
            color += electricColor * uInside * (0.28 + flowA * 0.34 + arcs * 0.42);
            color += cyan * frontalCharge * frontFacing * (0.16 + uApproach * 0.42 + uInside * 0.14);

            gl_FragColor = vec4(color, opacity);
          }
        `}
      />
    </mesh>
  );
}

function InteriorEnergyVolume({ materialRef }: { materialRef: RefObject<ShaderMaterial | null> }) {
  return (
    <mesh scale={[0.96, 0.96, 0.96]}>
      <sphereGeometry args={[PLANET_RADIUS, 160, 160]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={BackSide}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uTravel: { value: 0 },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;

          void main() {
            vLocalPosition = position;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uIntensity;
          uniform float uTravel;
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;
          ${sharedNoise}

          void main() {
            vec3 localDir = normalize(vLocalPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float wallFacing = 1.0 - abs(dot(localDir, viewDir));
            float wallWrap = smoothstep(0.02, 0.98, wallFacing);

            float chamberA = fbm(localDir * 5.4 + vec3(uTime * 0.05, -uTime * 0.04, uTime * 0.03));
            float chamberB = fbm(localDir * 11.0 + vec3(-uTime * 0.18, uTime * 0.12, -uTime * 0.1));
            float chamberC = fbm(localDir * 18.0 + vec3(uTime * 0.32, -uTime * 0.28, uTime * 0.22));
            float chamberD = fbm(localDir * 28.0 + vec3(-uTime * 0.74, uTime * 0.58, -uTime * 0.48));
            float chamberE = fbm(localDir * 46.0 + vec3(uTime * 1.2, -uTime * 1.0, uTime * 0.88));

            float wallShadow = smoothstep(0.18, 0.92, chamberA * 0.72 + chamberB * 0.28);
            float cavernBreakup = smoothstep(0.16, 0.9, chamberB * 0.55 + chamberC * 0.5 + wallWrap * 0.24);
            float electricVeins = 1.0 - smoothstep(0.018, 0.06, abs(chamberD - 0.52));
            float lightningArcs = 1.0 - smoothstep(0.012, 0.042, abs(chamberE - 0.5));
            float plasmaVeil = smoothstep(0.42, 0.96, chamberC * 0.68 + chamberD * 0.46 + chamberE * 0.24);
            float currentBands = smoothstep(0.2, 0.9, chamberB * 0.5 + chamberE * 0.44);
            float waveField = sin((localDir.y * 20.0) + chamberB * 7.0 + chamberD * 9.0 + uTime * (1.8 + uTravel * 1.2)) * 0.5 + 0.5;
            float pulseWave = smoothstep(0.48, 0.98, waveField + chamberC * 0.3 + uTravel * 0.12);
            float forwardEnergy = smoothstep(0.1, 0.95, chamberA * 0.32 + chamberD * 0.48 + waveField * 0.36 + uTravel * 0.18);

            vec3 darkCore = vec3(0.01, 0.02, 0.045);
            vec3 deepBlue = vec3(0.03, 0.09, 0.22);
            vec3 cyan = vec3(0.16, 0.84, 1.0);
            vec3 electricBlue = vec3(0.38, 0.9, 1.0);
            vec3 purple = vec3(0.6, 0.32, 1.0);
            vec3 whiteBlue = vec3(0.9, 0.98, 1.0);

            vec3 baseColor = mix(darkCore, deepBlue, wallShadow * 0.7 + cavernBreakup * 0.18);
            baseColor += purple * (currentBands * 0.1 + chamberC * 0.06);

            vec3 emissive = vec3(0.0);
            emissive += cyan * electricVeins * (0.62 + wallWrap * 0.42);
            emissive += electricBlue * lightningArcs * (0.82 + uTravel * 0.58);
            emissive += purple * plasmaVeil * 0.28;
            emissive += cyan * pulseWave * 0.48;
            emissive += whiteBlue * lightningArcs * 0.34;
            emissive += electricBlue * forwardEnergy * 0.34;

            vec3 color = baseColor + emissive;
            color *= 0.74 + wallWrap * 0.52 + uIntensity * 0.34;

            float alpha = (0.3 + wallWrap * 0.36 + cavernBreakup * 0.2 + electricVeins * 0.22 + plasmaVeil * 0.16 + pulseWave * 0.16) * uIntensity;
            alpha = clamp(alpha, 0.0, 0.97);

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function InteriorCoreField({ materialRef }: { materialRef: RefObject<ShaderMaterial | null> }) {
  return (
    <mesh scale={[0.58, 0.58, 0.58]}>
      <sphereGeometry args={[PLANET_RADIUS, 120, 120]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uTravel: { value: 0 },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;

          void main() {
            vLocalPosition = position;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uIntensity;
          uniform float uTravel;
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;
          ${sharedNoise}

          void main() {
            vec3 localPos = vLocalPosition / ${PLANET_RADIUS.toFixed(1)};
            vec3 localDir = normalize(vLocalPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float viewGlow = 0.45 + 0.55 * (1.0 - abs(dot(localDir, viewDir)));

            float flowA = fbm(localPos * 5.2 + vec3(uTime * 0.28, -uTime * 0.22, uTime * 0.16));
            float flowB = fbm(localPos * 9.8 + vec3(-uTime * 0.72, uTime * 0.54, -uTime * 0.4));
            float flowC = fbm(localPos * 15.6 + vec3(uTime * 1.1, -uTime * 0.96, uTime * 0.82));
            float streams = smoothstep(0.44, 0.96, flowA * 0.52 + flowB * 0.5 + uTravel * 0.18);
            float sparks = 1.0 - smoothstep(0.016, 0.05, abs(flowC - 0.5));
            float wave = sin(localPos.z * 18.0 - uTime * (3.2 + uTravel * 2.2) + flowA * 7.0) * 0.5 + 0.5;
            float wavePulse = smoothstep(0.48, 0.98, wave + flowB * 0.24);
            float purpleLift = smoothstep(0.36, 0.92, flowB * 0.44 + flowC * 0.34);

            vec3 cyan = vec3(0.15, 0.84, 1.0);
            vec3 whiteBlue = vec3(0.88, 0.97, 1.0);
            vec3 purple = vec3(0.56, 0.34, 1.0);
            vec3 color = cyan * streams * (0.52 + viewGlow * 0.42);
            color += whiteBlue * sparks * 0.32;
            color += cyan * wavePulse * 0.38;
            color += purple * purpleLift * 0.2;

            float alpha = (streams * 0.28 + sparks * 0.16 + wavePulse * 0.22 + purpleLift * 0.12) * viewGlow * uIntensity;
            alpha *= 0.78 + uTravel * 0.58;
            alpha = clamp(alpha, 0.0, 0.62);

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function InteriorStorm({ reducedMotion, intensityRef, travelRef }: InteriorStormProps) {
  const rootRef = useRef<Group>(null);
  const particlesRef = useRef(null);
  const particleMaterialRef = useRef<LineBasicMaterial>(null);
  const arcLinesRef = useRef(null);
  const arcMaterialRef = useRef<LineBasicMaterial>(null);
  const trailRef = useRef(null);
  const trailMaterialRef = useRef<LineBasicMaterial>(null);

  useFrame(({ clock }) => {
    const root = rootRef.current;
    const intensity = intensityRef.current ?? 0;
    const travel = travelRef.current ?? 0;
    if (!root) return;

    const time = clock.elapsedTime;
    const displayIntensity = MathUtils.smoothstep(intensity, 0.28, 0.96);
    const travelBoost = MathUtils.smoothstep(travel, 0.02, 1);
    root.visible = displayIntensity > 0.001;
    root.rotation.y = time * (reducedMotion ? 0.05 : 0.09 + travelBoost * 0.08);
    root.rotation.z = Math.sin(time * 0.23 + travelBoost * 0.6) * (0.08 + travelBoost * 0.05);
    root.scale.setScalar(1.18 + displayIntensity * 2.65 + travelBoost * 0.42);

    const particlePositions = PARTICLE_DATA.positions;
    const particleBase = PARTICLE_DATA.base;
    const particleSeeds = PARTICLE_DATA.seeds;
    const particleAttr = PARTICLE_DATA.geometry.getAttribute("position") as Float32BufferAttribute;

    for (let i = 0; i < particleSeeds.length; i += 1) {
      const seed = particleSeeds[i];
      const baseX = particleBase[i * 3];
      const baseY = particleBase[i * 3 + 1];
      const baseZ = particleBase[i * 3 + 2];
      const swirl = 0.8 + displayIntensity * 2.8;
      const centerX = baseX + Math.sin(time * (0.7 + pseudo(seed) * 1.6) + seed) * swirl;
      const centerY = baseY + Math.cos(time * (0.8 + pseudo(seed + 2.1) * 1.7) + seed * 1.4) * swirl;
      const centerZ = baseZ + Math.sin(time * (0.65 + pseudo(seed + 5.4) * 1.8) + seed * 0.9) * swirl - travelBoost * (10 + pseudo(seed + 14.2) * 20);
      const dirX = Math.sin(time * (1.6 + pseudo(seed + 8.1) * 1.8) + seed * 0.7);
      const dirY = Math.cos(time * (1.4 + pseudo(seed + 10.3) * 1.4) + seed * 0.3);
      const dirZ = Math.sin(time * (1.8 + pseudo(seed + 12.6) * 1.6) + seed * 0.5) - travelBoost * 2.4;
      const dirLength = Math.hypot(dirX, dirY, dirZ) || 1;
      const sparkLength = 0.6 + displayIntensity * 3.4 + travelBoost * 3.2;

      particlePositions[i * 6] = centerX - (dirX / dirLength) * sparkLength;
      particlePositions[i * 6 + 1] = centerY - (dirY / dirLength) * sparkLength;
      particlePositions[i * 6 + 2] = centerZ - (dirZ / dirLength) * sparkLength;
      particlePositions[i * 6 + 3] = centerX + (dirX / dirLength) * sparkLength;
      particlePositions[i * 6 + 4] = centerY + (dirY / dirLength) * sparkLength;
      particlePositions[i * 6 + 5] = centerZ + (dirZ / dirLength) * sparkLength;
    }

    particleAttr.needsUpdate = true;

    if (particleMaterialRef.current) {
      particleMaterialRef.current.opacity = 0.18 + displayIntensity * 0.9 + travelBoost * 0.18;
    }

    const arcPositions = ARC_DATA.positions;
    const arcSeeds = ARC_DATA.seeds;
    const arcAttr = ARC_DATA.geometry.getAttribute("position") as Float32BufferAttribute;

    let pointer = 0;
    const arcCount = arcSeeds.length;
    const steps = 14;

    for (let arc = 0; arc < arcCount; arc += 1) {
      const seed = arcSeeds[arc];
      const thetaA = pseudo(seed + 1.3 + time * 0.03) * Math.PI * 2;
      const phiA = Math.acos(MathUtils.lerp(-1, 1, pseudo(seed + 2.7)));
      const thetaB = pseudo(seed + 3.9 + time * 0.04) * Math.PI * 2;
      const phiB = Math.acos(MathUtils.lerp(-1, 1, pseudo(seed + 5.1)));

      const start = new Vector3(
        Math.sin(phiA) * Math.cos(thetaA),
        Math.cos(phiA),
        Math.sin(phiA) * Math.sin(thetaA)
      ).multiplyScalar(PLANET_RADIUS * MathUtils.lerp(0.15, 0.72, pseudo(seed + 6.2)));

      const end = new Vector3(
        Math.sin(phiB) * Math.cos(thetaB),
        Math.cos(phiB),
        Math.sin(phiB) * Math.sin(thetaB)
      ).multiplyScalar(PLANET_RADIUS * MathUtils.lerp(0.18, 0.78, pseudo(seed + 7.4)));

      const mid = start.clone().lerp(end, 0.5);
      mid.add(
        new Vector3(
          Math.sin(time * 1.8 + seed) * PLANET_RADIUS * 0.18,
          Math.cos(time * 1.4 + seed * 0.7) * PLANET_RADIUS * 0.18,
          Math.sin(time * 1.2 + seed * 1.1) * PLANET_RADIUS * 0.18
        )
      );

      let previous = start.clone();
      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        const curvePoint = start.clone().lerp(mid, t).lerp(mid.clone().lerp(end, t), t);
        curvePoint.x += (pseudo(seed + step * 1.7) - 0.5) * PLANET_RADIUS * 0.06 * displayIntensity;
        curvePoint.y += (pseudo(seed + step * 2.3) - 0.5) * PLANET_RADIUS * 0.06 * displayIntensity;
        curvePoint.z += (pseudo(seed + step * 2.9) - 0.5) * PLANET_RADIUS * 0.06 * displayIntensity;

        arcPositions[pointer++] = previous.x;
        arcPositions[pointer++] = previous.y;
        arcPositions[pointer++] = previous.z;
        arcPositions[pointer++] = curvePoint.x;
        arcPositions[pointer++] = curvePoint.y;
        arcPositions[pointer++] = curvePoint.z;
        previous = curvePoint;
      }
    }

    arcAttr.needsUpdate = true;

    if (arcMaterialRef.current) {
      arcMaterialRef.current.opacity = 0.08 + displayIntensity * 0.92 + travelBoost * 0.22;
    }

    const trailPositions = TRAIL_DATA.positions;
    const trailSeeds = TRAIL_DATA.seeds;
    const trailAttr = TRAIL_DATA.geometry.getAttribute("position") as Float32BufferAttribute;

    for (let i = 0; i < trailSeeds.length; i += 1) {
      const seed = trailSeeds[i];
      const orbitRadius = PLANET_RADIUS * MathUtils.lerp(0.12, 0.82, pseudo(seed + 0.7));
      const angle = time * (0.4 + pseudo(seed + 1.9) * 1.3) + seed;
      const wave = Math.sin(time * (0.9 + pseudo(seed + 2.7)) + seed * 0.4) * PLANET_RADIUS * 0.12;

      const centerX = Math.cos(angle) * orbitRadius;
      const centerY = Math.sin(angle * 1.3) * orbitRadius * 0.38 + wave;
      const centerZ = Math.sin(angle) * orbitRadius;
      const tangentX = -Math.sin(angle);
      const tangentY = Math.cos(angle * 1.3) * 0.52;
      const tangentZ = Math.cos(angle);
      const tangentLength = Math.hypot(tangentX, tangentY, tangentZ) || 1;
      const trailLength = 0.7 + displayIntensity * 2.1 + travelBoost * 1.6;

      trailPositions[i * 6] = centerX - (tangentX / tangentLength) * trailLength;
      trailPositions[i * 6 + 1] = centerY - (tangentY / tangentLength) * trailLength;
      trailPositions[i * 6 + 2] = centerZ - (tangentZ / tangentLength) * trailLength;
      trailPositions[i * 6 + 3] = centerX + (tangentX / tangentLength) * trailLength;
      trailPositions[i * 6 + 4] = centerY + (tangentY / tangentLength) * trailLength;
      trailPositions[i * 6 + 5] = centerZ + (tangentZ / tangentLength) * trailLength;
    }

    trailAttr.needsUpdate = true;

    if (trailMaterialRef.current) {
      trailMaterialRef.current.opacity = 0.1 + displayIntensity * 0.28 + travelBoost * 0.28;
    }
  });

  return (
    <group ref={rootRef} visible={false}>
      <lineSegments ref={particlesRef} geometry={PARTICLE_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={particleMaterialRef}
          color="#89e6ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <lineSegments ref={arcLinesRef} geometry={ARC_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={arcMaterialRef}
          color="#79d8ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <lineSegments ref={trailRef} geometry={TRAIL_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={trailMaterialRef}
          color="#68dfff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function ExteriorPlasmaField({ materialRef, scale = 1, opacityBoost = 1 }: ExteriorFieldProps) {
  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[PLANET_RADIUS, 144, 144]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uActivity: { value: 0 },
          uOpacityBoost: { value: opacityBoost },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;
          varying vec3 vNormalWorld;

          void main() {
            vLocalPosition = position;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vNormalWorld = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uActivity;
          uniform float uOpacityBoost;
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;
          varying vec3 vNormalWorld;
          ${sharedNoise}

          void main() {
            vec3 localDir = normalize(vLocalPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float rim = pow(1.0 - abs(dot(normalize(vNormalWorld), viewDir)), 2.4);
            float frontFacing = pow(abs(dot(normalize(vNormalWorld), viewDir)), 1.2);

            float cloud = fbm(localDir * 4.0 + vec3(uTime * 0.05, -uTime * 0.03, uTime * 0.04));
            float aurora = fbm(localDir * 8.4 + vec3(-uTime * 0.14, uTime * 0.09, -uTime * 0.08));
            float plasma = smoothstep(0.5, 0.92, cloud * 0.7 + aurora * 0.8);
            float haze = smoothstep(0.18, 0.86, cloud) * (0.32 + rim * 0.68);
            float frontalGlow = smoothstep(0.24, 0.94, cloud * 0.52 + aurora * 0.42);
            float pulse = 0.72 + sin(uTime * 0.6) * 0.08 + sin(uTime * 1.13) * 0.05;

            vec3 cyan = vec3(0.16, 0.82, 1.0);
            vec3 teal = vec3(0.1, 0.58, 0.98);
            vec3 violet = vec3(0.56, 0.36, 1.0);
            vec3 color = mix(teal, cyan, smoothstep(0.2, 0.8, cloud));
            color = mix(color, violet, smoothstep(0.62, 0.98, aurora) * 0.28);
            color *= pulse;
            color += cyan * plasma * (0.8 + uActivity * 0.8);
            color += vec3(0.7, 0.92, 1.0) * rim * 0.3;
            color += cyan * frontalGlow * frontFacing * (0.22 + uActivity * 0.46);

            float alpha = (plasma * 0.34 + haze * 0.28 + rim * 0.24) * (0.42 + uActivity * 0.95) * uOpacityBoost;
            alpha += frontalGlow * frontFacing * (0.08 + uActivity * 0.18) * uOpacityBoost;
            if (alpha < 0.004) discard;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function DistortionField({ materialRef, scale = 1, opacityBoost = 1 }: ExteriorFieldProps) {
  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[PLANET_RADIUS, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uActivity: { value: 0 },
          uOpacityBoost: { value: opacityBoost },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;
          varying vec3 vNormalWorld;

          void main() {
            vLocalPosition = position;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vNormalWorld = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uActivity;
          uniform float uOpacityBoost;
          varying vec3 vWorldPosition;
          varying vec3 vLocalPosition;
          varying vec3 vNormalWorld;
          ${sharedNoise}

          void main() {
            vec3 localDir = normalize(vLocalPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float rim = pow(1.0 - abs(dot(normalize(vNormalWorld), viewDir)), 3.0);
            float warp = fbm(localDir * 12.0 + vec3(uTime * 0.22, -uTime * 0.16, uTime * 0.14));
            float waves = sin((localDir.y + warp) * 18.0 + uTime * 0.9) * 0.5 + 0.5;
            float distortion = rim * smoothstep(0.28, 0.94, warp * 0.7 + waves * 0.5);
            vec3 color = mix(vec3(0.18, 0.48, 1.0), vec3(0.82, 0.95, 1.0), waves) * (0.35 + uActivity * 0.45);
            float alpha = distortion * 0.28 * uOpacityBoost;
            if (alpha < 0.015) discard;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function ExteriorStorm({ reducedMotion, activityRef }: ExteriorEnergyProps) {
  const rootRef = useRef<Group>(null);
  const atmosphereArcMaterialRef = useRef<LineBasicMaterial>(null);
  const spaceLightningMaterialRef = useRef<LineBasicMaterial>(null);
  const currentMaterialRef = useRef<LineBasicMaterial>(null);
  const chargedParticleMaterialRef = useRef<LineBasicMaterial>(null);
  const flareMaterialRef = useRef<PointsMaterial>(null);

  useFrame(({ clock }) => {
    const root = rootRef.current;
    if (!root) return;

    const time = clock.elapsedTime;
    const activity = activityRef.current ?? 0;
    root.rotation.y = time * (reducedMotion ? 0.014 : 0.025);
    root.rotation.z = Math.sin(time * 0.07) * 0.04;

    const atmospherePositions = ATMOSPHERE_ARC_DATA.positions;
    const atmosphereSeeds = ATMOSPHERE_ARC_DATA.seeds;
    const atmosphereAttr = ATMOSPHERE_ARC_DATA.geometry.getAttribute("position") as Float32BufferAttribute;
    let atmospherePointer = 0;

    for (let arc = 0; arc < atmosphereSeeds.length; arc += 1) {
      const seed = atmosphereSeeds[arc];
      const thetaA = pseudo(seed + time * 0.015) * Math.PI * 2;
      const thetaB = thetaA + MathUtils.lerp(0.35, 0.95, pseudo(seed + 4.6));
      const phiBand = MathUtils.lerp(0.35, 2.7, pseudo(seed + 2.3));
      const shellRadius = PLANET_RADIUS * MathUtils.lerp(1.02, 1.16, pseudo(seed + 7.1));

      const start = new Vector3(
        Math.sin(phiBand) * Math.cos(thetaA),
        Math.cos(phiBand),
        Math.sin(phiBand) * Math.sin(thetaA)
      ).multiplyScalar(shellRadius);
      const end = new Vector3(
        Math.sin(phiBand + MathUtils.lerp(-0.18, 0.18, pseudo(seed + 8.4))) * Math.cos(thetaB),
        Math.cos(phiBand + MathUtils.lerp(-0.18, 0.18, pseudo(seed + 8.4))),
        Math.sin(phiBand + MathUtils.lerp(-0.18, 0.18, pseudo(seed + 8.4))) * Math.sin(thetaB)
      ).multiplyScalar(shellRadius * MathUtils.lerp(0.98, 1.05, pseudo(seed + 9.2)));

      const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(shellRadius + 3 + activity * 6);
      mid.x += Math.sin(time * 0.9 + seed) * 4.2;
      mid.y += Math.cos(time * 0.7 + seed * 0.6) * 3.4;
      mid.z += Math.sin(time * 0.82 + seed * 1.4) * 3.7;

      let previous = start.clone();
      for (let step = 1; step <= 16; step += 1) {
        const t = step / 16;
        const curvePoint = start.clone().lerp(mid, t).lerp(mid.clone().lerp(end, t), t);
        curvePoint.x += (pseudo(seed + step * 1.7) - 0.5) * (0.9 + activity * 2.2);
        curvePoint.y += (pseudo(seed + step * 2.3) - 0.5) * (0.9 + activity * 2.2);
        curvePoint.z += (pseudo(seed + step * 2.9) - 0.5) * (0.9 + activity * 2.2);

        atmospherePositions[atmospherePointer++] = previous.x;
        atmospherePositions[atmospherePointer++] = previous.y;
        atmospherePositions[atmospherePointer++] = previous.z;
        atmospherePositions[atmospherePointer++] = curvePoint.x;
        atmospherePositions[atmospherePointer++] = curvePoint.y;
        atmospherePositions[atmospherePointer++] = curvePoint.z;
        previous = curvePoint;
      }
    }
    atmosphereAttr.needsUpdate = true;

    const spacePositions = SPACE_LIGHTNING_DATA.positions;
    const spaceSeeds = SPACE_LIGHTNING_DATA.seeds;
    const spaceAttr = SPACE_LIGHTNING_DATA.geometry.getAttribute("position") as Float32BufferAttribute;
    let spacePointer = 0;

    for (let arc = 0; arc < spaceSeeds.length; arc += 1) {
      const seed = spaceSeeds[arc];
      const eruption = MathUtils.smoothstep(0.74, 0.98, Math.sin(time * (0.32 + pseudo(seed + 0.4) * 0.22) + seed * 1.7));
      const theta = pseudo(seed + 5.8) * Math.PI * 2 + time * 0.03;
      const phi = Math.acos(MathUtils.lerp(-0.85, 0.85, pseudo(seed + 6.4)));
      const startRadius = PLANET_RADIUS * MathUtils.lerp(1.04, 1.1, pseudo(seed + 7.7));
      const start = new Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).multiplyScalar(startRadius);
      const direction = start.clone().normalize();
      const end = start.clone().add(direction.multiplyScalar(MathUtils.lerp(8, 28, pseudo(seed + 9.1)) * eruption));
      const mid = start.clone().lerp(end, 0.5);
      mid.x += Math.sin(time * 1.2 + seed) * 2.6 * eruption;
      mid.y += Math.cos(time * 1.1 + seed * 0.7) * 2.6 * eruption;
      mid.z += Math.sin(time * 1.05 + seed * 1.1) * 2.6 * eruption;

      let previous = start.clone();
      for (let step = 1; step <= 15; step += 1) {
        const t = step / 15;
        const curvePoint = start.clone().lerp(mid, t).lerp(mid.clone().lerp(end, t), t);
        curvePoint.x += (pseudo(seed + step * 1.4) - 0.5) * 1.9 * eruption;
        curvePoint.y += (pseudo(seed + step * 2.2) - 0.5) * 1.9 * eruption;
        curvePoint.z += (pseudo(seed + step * 2.8) - 0.5) * 1.9 * eruption;

        spacePositions[spacePointer++] = previous.x;
        spacePositions[spacePointer++] = previous.y;
        spacePositions[spacePointer++] = previous.z;
        spacePositions[spacePointer++] = curvePoint.x;
        spacePositions[spacePointer++] = curvePoint.y;
        spacePositions[spacePointer++] = curvePoint.z;
        previous = curvePoint;
      }
    }
    spaceAttr.needsUpdate = true;

    const currentPositions = MAGNETIC_CURRENT_DATA.positions;
    const currentSeeds = MAGNETIC_CURRENT_DATA.seeds;
    const currentAttr = MAGNETIC_CURRENT_DATA.geometry.getAttribute("position") as Float32BufferAttribute;
    for (let i = 0; i < currentSeeds.length; i += 1) {
      const seed = currentSeeds[i];
      const angle = time * (0.08 + pseudo(seed + 0.7) * 0.16) + seed;
      const radius = PLANET_RADIUS * MathUtils.lerp(1.08, 1.42, pseudo(seed + 1.9));
      const lat = Math.sin(angle * (1.2 + pseudo(seed + 2.6) * 0.5) + seed * 0.3) * MathUtils.lerp(0.22, 1.0, pseudo(seed + 3.4));
      const x = Math.cos(angle) * radius;
      const y = lat * PLANET_RADIUS * 0.72 + Math.sin(time * 0.35 + seed) * 1.6;
      const z = Math.sin(angle) * radius;
      const tangent = new Vector3(-Math.sin(angle), 0.2 * Math.cos(angle * 1.2 + seed), Math.cos(angle)).normalize();
      const length = 1.8 + activity * 3.8;
      currentPositions[i * 6] = x - tangent.x * length;
      currentPositions[i * 6 + 1] = y - tangent.y * length;
      currentPositions[i * 6 + 2] = z - tangent.z * length;
      currentPositions[i * 6 + 3] = x + tangent.x * length;
      currentPositions[i * 6 + 4] = y + tangent.y * length;
      currentPositions[i * 6 + 5] = z + tangent.z * length;
    }
    currentAttr.needsUpdate = true;

    const chargedPositions = CHARGED_PARTICLE_DATA.positions;
    const chargedSeeds = CHARGED_PARTICLE_DATA.seeds;
    const chargedAttr = CHARGED_PARTICLE_DATA.geometry.getAttribute("position") as Float32BufferAttribute;
    for (let i = 0; i < chargedSeeds.length; i += 1) {
      const seed = chargedSeeds[i];
      const theta = time * (0.1 + pseudo(seed + 0.8) * 0.18) + seed * 0.2;
      const phi = Math.acos(MathUtils.lerp(-0.92, 0.92, pseudo(seed + 2.4)));
      const radius = PLANET_RADIUS * MathUtils.lerp(1.14, 1.75, pseudo(seed + 3.8)) + Math.sin(time * (0.6 + pseudo(seed + 4.2)) + seed) * 0.9;
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.cos(phi) * radius + Math.sin(time * 0.18 + seed) * 0.8;
      const z = Math.sin(phi) * Math.sin(theta) * radius;
      const drift = new Vector3(
        Math.sin(time * (0.4 + pseudo(seed + 5.3)) + seed),
        Math.cos(time * (0.35 + pseudo(seed + 6.1)) + seed * 0.5),
        Math.sin(time * (0.44 + pseudo(seed + 7.2)) + seed * 0.8)
      ).normalize();
      const length = 0.42 + activity * 1.1;
      chargedPositions[i * 6] = x - drift.x * length;
      chargedPositions[i * 6 + 1] = y - drift.y * length;
      chargedPositions[i * 6 + 2] = z - drift.z * length;
      chargedPositions[i * 6 + 3] = x + drift.x * length;
      chargedPositions[i * 6 + 4] = y + drift.y * length;
      chargedPositions[i * 6 + 5] = z + drift.z * length;
    }
    chargedAttr.needsUpdate = true;

    const flarePositions = FLARE_PARTICLE_DATA.positions;
    const flareSeeds = FLARE_PARTICLE_DATA.seeds;
    const flareAttr = FLARE_PARTICLE_DATA.geometry.getAttribute("position") as Float32BufferAttribute;
    let flareEnergy = 0;
    for (let i = 0; i < flareSeeds.length; i += 1) {
      const seed = flareSeeds[i];
      const flarePhase = Math.max(0, Math.sin(time * (0.26 + pseudo(seed + 0.5) * 0.24) + seed * 1.9));
      const burst = Math.pow(flarePhase, 10);
      flareEnergy += burst;
      const theta = pseudo(seed + 5.6) * Math.PI * 2;
      const phi = Math.acos(MathUtils.lerp(-0.6, 0.6, pseudo(seed + 7.4)));
      const direction = new Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      const radius = PLANET_RADIUS * (1.03 + burst * MathUtils.lerp(0.18, 0.52, pseudo(seed + 9.7)));
      const offset = burst * MathUtils.lerp(3, 18, pseudo(seed + 10.9));
      flarePositions[i * 3] = direction.x * (radius + offset);
      flarePositions[i * 3 + 1] = direction.y * (radius + offset);
      flarePositions[i * 3 + 2] = direction.z * (radius + offset);
    }
    flareAttr.needsUpdate = true;

    if (atmosphereArcMaterialRef.current) {
      atmosphereArcMaterialRef.current.opacity = 0.26 + activity * 0.68;
    }
    if (spaceLightningMaterialRef.current) {
      spaceLightningMaterialRef.current.opacity = 0.1 + activity * 0.44;
    }
    if (currentMaterialRef.current) {
      currentMaterialRef.current.opacity = 0.12 + activity * 0.2;
    }
    if (chargedParticleMaterialRef.current) {
      chargedParticleMaterialRef.current.opacity = 0.06 + activity * 0.12;
    }
    if (flareMaterialRef.current) {
      flareMaterialRef.current.opacity = Math.min(0.22, 0.015 + flareEnergy / flareSeeds.length * 6 + activity * 0.04);
      flareMaterialRef.current.size = 0.08 + activity * 0.2;
    }
  });

  return (
    <group ref={rootRef}>
      <lineSegments geometry={ATMOSPHERE_ARC_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={atmosphereArcMaterialRef}
          color="#72dcff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <lineSegments geometry={SPACE_LIGHTNING_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={spaceLightningMaterialRef}
          color="#b0f4ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <lineSegments geometry={MAGNETIC_CURRENT_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={currentMaterialRef}
          color="#63d7ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <lineSegments geometry={CHARGED_PARTICLE_DATA.geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={chargedParticleMaterialRef}
          color="#d6f6ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <points geometry={FLARE_PARTICLE_DATA.geometry} frustumCulled={false}>
        <pointsMaterial
          ref={flareMaterialRef}
          color="#8ae4ff"
          transparent
          opacity={0}
          size={0.08}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function DigitalPlanet({ reducedMotion, scrollState }: DigitalPlanetProps) {
  const groupRef = useRef<Group>(null);
  const shellMaterialRef = useRef<ShaderMaterial>(null);
  const auraMaterialRef = useRef<ShaderMaterial>(null);
  const plasmaFieldMaterialRef = useRef<ShaderMaterial>(null);
  const distortionFieldMaterialRef = useRef<ShaderMaterial>(null);
  const interiorVolumeMaterialRef = useRef<ShaderMaterial>(null);
  const interiorCoreFieldMaterialRef = useRef<ShaderMaterial>(null);
  const directionalLightRef = useRef<DirectionalLight>(null);
  const cyanOuterLightRef = useRef<PointLight>(null);
  const purpleOuterLightRef = useRef<PointLight>(null);
  const innerStormLight = useRef<PointLight>(null);
  const center = useMemo(() => PLANET_CENTER.clone(), []);
  const interiorIntensityRef = useRef(0);
  const exteriorActivityRef = useRef(0.22);
  const deepCoreTravelRef = useRef(0);
  const approachMixRef = useRef(0);
  const atmosphereMixRef = useRef(0);
  const insideMixRef = useRef(0);
  const deepTravelMixRef = useRef(0);

  useFrame(({ camera, clock }, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta || 1 / 60, 1 / 30);
    const time = clock.elapsedTime;
    const progress = scrollState.current.progress;
    const distanceToCenter = camera.position.distanceTo(center);
    const rawApproach = 1 - remapClamped(distanceToCenter, SURFACE_START_DISTANCE, SURFACE_END_DISTANCE);
    const rawAtmosphere = MathUtils.clamp(
      (ATMOSPHERE_START_DISTANCE - distanceToCenter) / (ATMOSPHERE_START_DISTANCE - ATMOSPHERE_FULL_DISTANCE),
      0,
      1
    );
    const rawInside = MathUtils.clamp(
      (INSIDE_START_DISTANCE - distanceToCenter) / (INSIDE_START_DISTANCE - INSIDE_FULL_DISTANCE),
      0,
      1
    );
    const rawDeepCoreTravel = MathUtils.smoothstep(progress, 0.84, 1) * MathUtils.smoothstep(rawInside, 0.12, 0.98);
    const glowBoost = MathUtils.smoothstep(progress, 0.22, 0.92);
    const driftStrength = reducedMotion ? 0.45 : 1;

    approachMixRef.current = MathUtils.damp(approachMixRef.current, rawApproach, reducedMotion ? 8.2 : 6.6, dt);
    atmosphereMixRef.current = MathUtils.damp(atmosphereMixRef.current, rawAtmosphere, reducedMotion ? 8.2 : 6.6, dt);
    insideMixRef.current = MathUtils.damp(insideMixRef.current, rawInside, reducedMotion ? 8.4 : 6.9, dt);
    deepTravelMixRef.current = MathUtils.damp(deepTravelMixRef.current, rawDeepCoreTravel, reducedMotion ? 7.6 : 6.1, dt);

    const approachInverted = approachMixRef.current;
    const atmosphereProgress = atmosphereMixRef.current;
    const insideProgress = insideMixRef.current;
    const deepCoreTravel = deepTravelMixRef.current;
    const surfaceFade = 1 - MathUtils.smoothstep(insideProgress, 0.18, 0.94);
    const surfacePresence = MathUtils.clamp(0.34 + surfaceFade * 0.66, 0.34, 1);
    const atmosphereBridge = MathUtils.smoothstep(atmosphereProgress, 0.06, 0.98);
    const interiorReveal = MathUtils.clamp(atmosphereBridge * 0.28 + insideProgress * 0.88 + deepCoreTravel * 0.24, 0, 1);

    deepCoreTravelRef.current = deepCoreTravel;
    interiorIntensityRef.current = interiorReveal;
    exteriorActivityRef.current = MathUtils.clamp((0.26 + approachInverted * 0.5 + atmosphereProgress * 0.22 + glowBoost * 0.1) * (0.58 + surfacePresence * 0.42), 0.2, 1);

    groupRef.current.rotation.y = time * (reducedMotion ? 0.016 : 0.025);
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.024 * driftStrength;
    groupRef.current.rotation.z = Math.cos(time * 0.08) * 0.016 * driftStrength;

    if (shellMaterialRef.current) {
      shellMaterialRef.current.uniforms.uTime.value = time;
      shellMaterialRef.current.uniforms.uApproach.value = approachInverted + glowBoost * 0.22;
      shellMaterialRef.current.uniforms.uInside.value = insideProgress * 0.82;
      shellMaterialRef.current.uniforms.uOpacityBoost.value = 0.78 + surfacePresence * 0.34 + atmosphereProgress * 0.08;
    }

    if (auraMaterialRef.current) {
      auraMaterialRef.current.uniforms.uTime.value = time;
      auraMaterialRef.current.uniforms.uApproach.value = approachInverted + glowBoost * 0.18;
      auraMaterialRef.current.uniforms.uInside.value = insideProgress * 0.62;
      auraMaterialRef.current.uniforms.uOpacityBoost.value = 0.12 + surfacePresence * 0.14;
    }

    if (plasmaFieldMaterialRef.current) {
      plasmaFieldMaterialRef.current.uniforms.uTime.value = time;
      plasmaFieldMaterialRef.current.uniforms.uActivity.value = exteriorActivityRef.current;
      plasmaFieldMaterialRef.current.uniforms.uOpacityBoost.value = 0.54 + surfacePresence * 0.46;
    }

    if (distortionFieldMaterialRef.current) {
      distortionFieldMaterialRef.current.uniforms.uTime.value = time;
      distortionFieldMaterialRef.current.uniforms.uActivity.value = exteriorActivityRef.current;
      distortionFieldMaterialRef.current.uniforms.uOpacityBoost.value = 0.08 + surfacePresence * 0.14;
    }

    if (interiorVolumeMaterialRef.current) {
      interiorVolumeMaterialRef.current.uniforms.uTime.value = time;
      interiorVolumeMaterialRef.current.uniforms.uIntensity.value = interiorReveal;
      interiorVolumeMaterialRef.current.uniforms.uTravel.value = deepCoreTravel;
    }

    if (interiorCoreFieldMaterialRef.current) {
      interiorCoreFieldMaterialRef.current.uniforms.uTime.value = time;
      interiorCoreFieldMaterialRef.current.uniforms.uIntensity.value = MathUtils.clamp(atmosphereBridge * 0.18 + insideProgress * 0.74 + deepCoreTravel * 0.32, 0, 1);
      interiorCoreFieldMaterialRef.current.uniforms.uTravel.value = deepCoreTravel;
    }

    const directionalLight = directionalLightRef.current;
    if (directionalLight) {
      directionalLight.intensity = MathUtils.damp(
        directionalLight.intensity,
        0.78 + approachInverted * 0.18 - insideProgress * 0.06 + atmosphereProgress * 0.08,
        reducedMotion ? 8.2 : 6.2,
        dt
      );
    }

    const cyanOuterLight = cyanOuterLightRef.current;
    if (cyanOuterLight) {
      cyanOuterLight.intensity = MathUtils.damp(
        cyanOuterLight.intensity,
        8 + approachInverted * 6.2 + atmosphereProgress * 2.8 - insideProgress * 1.6,
        reducedMotion ? 8.4 : 6.4,
        dt
      );
    }

    const purpleOuterLight = purpleOuterLightRef.current;
    if (purpleOuterLight) {
      purpleOuterLight.intensity = MathUtils.damp(
        purpleOuterLight.intensity,
        3.8 + approachInverted * 3 + atmosphereProgress * 1.4 - insideProgress * 0.55,
        reducedMotion ? 8.4 : 6.4,
        dt
      );
    }

    const stormLight = innerStormLight.current;
    if (stormLight) {
      stormLight.position.set(
        Math.sin(time * 0.34) * 12,
        Math.cos(time * 0.28) * 9,
        Math.sin(time * 0.22) * 14
      );
      const targetStormIntensity = 5 + atmosphereProgress * 4 + insideProgress * 12 + deepCoreTravel * 8 + glowBoost * 2;
      stormLight.intensity = MathUtils.damp(stormLight.intensity, targetStormIntensity, reducedMotion ? 8 : 5.4, dt);
    }
  });

  const pointColor = new Color("#39daff");
  const purpleColor = new Color("#8b63ff");

  return (
    <group ref={groupRef} position={center.toArray()}>
      <directionalLight ref={directionalLightRef} position={[28, 16, 44]} intensity={0.86} color="#e7f5ff" />
      <pointLight ref={cyanOuterLightRef} position={[12, 8, 32]} intensity={12} distance={220} color={pointColor} />
      <pointLight ref={purpleOuterLightRef} position={[-20, -10, 24]} intensity={5.4} distance={180} color={purpleColor} />
      <pointLight ref={innerStormLight} position={[0, 0, 0]} intensity={5} distance={260} color="#49ddff" />

      <ExteriorPlasmaField materialRef={plasmaFieldMaterialRef} scale={1.11} opacityBoost={1} />
      <DistortionField materialRef={distortionFieldMaterialRef} scale={1.12} opacityBoost={0.3} />
      <ExteriorStorm reducedMotion={reducedMotion} activityRef={exteriorActivityRef} />
      <ElectricShell materialRef={shellMaterialRef} />
      <ElectricShell materialRef={auraMaterialRef} scale={1.01} opacityBoost={0.28} />
      <InteriorEnergyVolume materialRef={interiorVolumeMaterialRef} />
      <InteriorCoreField materialRef={interiorCoreFieldMaterialRef} />
      <InteriorStorm reducedMotion={reducedMotion} intensityRef={interiorIntensityRef} travelRef={deepCoreTravelRef} />
    </group>
  );
}
