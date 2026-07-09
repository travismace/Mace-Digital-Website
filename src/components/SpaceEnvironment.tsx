"use client";

import { MutableRefObject, useMemo, useRef } from "react";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
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
  RGBAFormat,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  UnsignedByteType,
  Vector3,
} from "three";
import type { ScrollState } from "./camera/ScrollController";
import { DigitalPlanet } from "./DigitalPlanet";

type SpaceEnvironmentProps = {
  reducedMotion: boolean;
  scrollState: MutableRefObject<ScrollState>;
};

type StarfieldLayerProps = {
  count: number;
  spread: [number, number];
  forwardSpan: number;
  sizeRange: [number, number];
  colorA: string;
  colorB: string;
  rareBrightChance: number;
  layerBias: number;
  streakStrength: number;
  scrollState: MutableRefObject<ScrollState>;
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
      const core = Math.exp(-Math.abs(v) * 14);
      const fade = Math.pow(1 - u, 1.8);
      const sparkle = 0.92 + pseudo(x * 1.71 + y * 6.41) * 0.08;
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

function StarfieldLayer({
  count,
  spread,
  forwardSpan,
  sizeRange,
  colorA,
  colorB,
  rareBrightChance,
  layerBias,
  streakStrength,
  scrollState,
}: StarfieldLayerProps) {
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
      const seed = i + count * (0.23 + layerBias * 0.13);
      const spiral = pseudo(seed + 0.87) * TAU;
      const radial = Math.pow(pseudo(seed + 1.33), 0.78);
      const offsetX = Math.sin((pseudo(seed + 2.07) - 0.5) * Math.PI * 3.2 + layerBias * 5.4) * spread[0] * 0.08;
      const offsetY = Math.cos((pseudo(seed + 2.81) - 0.5) * Math.PI * 2.7 + layerBias * 4.2) * spread[1] * 0.08;

      positions[i * 3] = Math.cos(spiral) * spread[0] * radial + offsetX;
      positions[i * 3 + 1] = Math.sin(spiral * 1.13 + layerBias * 0.6) * spread[1] * radial + offsetY;
      positions[i * 3 + 2] = -pseudo(seed + 2.91) * forwardSpan;

      const tone = pseudo(seed + 3.17);
      const mixed = colorStart.clone().lerp(colorEnd, tone);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;

      const sizeRoll = pseudo(seed + 4.83);
      const sizeBias = Math.pow(sizeRoll, 4.6);
      const mediumChance = pseudo(seed + 8.27);
      const highlight = pseudo(seed + 9.91) > 1 - rareBrightChance ? 1 : 0;
      const medium = highlight ? 0 : mediumChance > 0.84 ? 1 : 0;

      sizes[i] = highlight
        ? MathUtils.lerp(Math.max(sizeRange[0] * 1.35, sizeRange[1] * 0.82), sizeRange[1] * 1.12, Math.pow(sizeRoll, 1.18))
        : medium
          ? MathUtils.lerp(sizeRange[0] * 1.04, sizeRange[1] * 0.76, Math.pow(sizeRoll, 1.55))
          : MathUtils.lerp(sizeRange[0], sizeRange[0] + (sizeRange[1] - sizeRange[0]) * 0.34, sizeBias);

      phases[i] = pseudo(seed + 5.61) * TAU;
      pulses[i] = MathUtils.lerp(0.012, 0.035, pseudo(seed + 6.47));
      drifts[i] = MathUtils.lerp(0.12, 0.48, pseudo(seed + 7.23));
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
  }, [colorA, colorB, count, forwardSpan, layerBias, rareBrightChance, sizeRange, spread]);

  useFrame(({ clock, camera, gl }) => {
    if (!materialRef.current) return;

    const time = clock.elapsedTime;
    const velocity = MathUtils.clamp(Math.abs(scrollState.current.velocity) / 2600, 0, 1);
    const scrollProgress = scrollState.current.progress;

    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uPixelRatio.value = gl.getPixelRatio();
    materialRef.current.uniforms.uVelocity.value = velocity;
    materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
    materialRef.current.uniforms.uCameraPosition.value.copy(camera.position);
    materialRef.current.uniforms.uForwardSpan.value = forwardSpan;
    materialRef.current.uniforms.uLayerBias.value = layerBias;
    materialRef.current.uniforms.uStreakStrength.value = streakStrength;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uVelocity: { value: 0 },
          uScrollProgress: { value: 0 },
          uCameraPosition: { value: new Vector3() },
          uForwardSpan: { value: forwardSpan },
          uLayerBias: { value: layerBias },
          uStreakStrength: { value: streakStrength },
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
          uniform float uVelocity;
          uniform float uScrollProgress;
          uniform vec3 uCameraPosition;
          uniform float uForwardSpan;
          uniform float uLayerBias;
          uniform float uStreakStrength;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vHighlight;
          varying float vStretch;

          void main() {
            float wrappedForward = mod((uCameraPosition.z - position.z) + uForwardSpan * 4.0, uForwardSpan);
            vec3 pos = vec3(position.x, position.y, uCameraPosition.z - wrappedForward);

            float distanceAhead = max(0.0, wrappedForward);
            float normalizedDepth = clamp(distanceAhead / uForwardSpan, 0.0, 1.0);
            float proximity = 1.0 - normalizedDepth;
            float parallaxDepth = proximity * proximity;
            float travelPhase = uScrollProgress * 2.0 - 1.0;

            pos.x += sin(uTime * (0.01 + aDrift * 0.012) + aPhase) * (0.004 + proximity * 0.012);
            pos.y += cos(uTime * (0.008 + aDrift * 0.01) + aPhase * 1.17) * (0.003 + proximity * 0.009);
            pos.x += travelPhase * (aDrift - 0.3) * (0.18 + uLayerBias * 0.52) * parallaxDepth;
            pos.y += sin(aPhase * 1.7) * travelPhase * (0.08 + uLayerBias * 0.2) * parallaxDepth;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            float distanceToCamera = max(0.001, -mvPosition.z);
            float perspective = clamp(86.0 / distanceToCamera, 0.0, 6.2);
            gl_PointSize = max(0.9, aSize * perspective * uPixelRatio);

            float pulse = 0.94 + sin(uTime * aPulse + aPhase) * (aHighlight > 0.5 ? 0.05 : 0.015);
            float farFade = 1.0 - smoothstep(uForwardSpan * 0.7, uForwardSpan * 0.98, distanceAhead);
            float nearFade = smoothstep(1.4, 7.0, distanceToCamera);
            float travelLift = 1.0 + uVelocity * mix(0.02, 0.18, proximity);
            vAlpha = pulse * farFade * nearFade * travelLift * mix(0.42, 0.98, proximity);
            vColor = color;
            vHighlight = aHighlight;
            vStretch = (0.08 + proximity * 0.8) * uVelocity * uStreakStrength;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          varying float vAlpha;
          varying float vHighlight;
          varying float vStretch;

          void main() {
            vec2 centered = gl_PointCoord - vec2(0.5);
            float dist = length(centered);
            float core = smoothstep(0.2, 0.0, dist);
            float body = smoothstep(0.42, 0.06, dist);
            float halo = smoothstep(0.5, 0.18, dist) * 0.05 * vHighlight;
            float sparkleX = exp(-abs(centered.x) * 42.0) * exp(-dist * 6.0);
            float sparkleY = exp(-abs(centered.y) * 42.0) * exp(-dist * 6.0);
            float sparkle = (sparkleX + sparkleY) * 0.09 * vHighlight;
            float streak = exp(-abs(centered.y) * 28.0) * exp(-abs(centered.x) * (12.0 - vStretch * 6.0)) * vStretch * 0.32;
            float alpha = body * 0.72 + core * 0.28 + halo + sparkle + streak;

            if (alpha < 0.03) discard;
            gl_FragColor = vec4(vColor, alpha * vAlpha);
          }
        `}
      />
    </points>
  );
}

function ShootingStar({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Sprite>(null);
  const trailRef = useRef<Mesh>(null);
  const particleRefs = useRef<Sprite[]>([]);
  const headTexture = useMemo(() => createSoftTexture(64, 3.6, 0.1), []);
  const trailTexture = useMemo(() => createTrailTexture(128, 24), []);
  const nextEventRef = useRef(reducedMotion ? 28 : 20);
  const sequenceRef = useRef(0);
  const activeRef = useRef<ShootingStarState | null>(null);
  const xAxis = useMemo(() => new Vector3(1, 0, 0), []);

  const schedule = (time: number) => {
    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;

    const side = Math.floor(pseudo(sequence * 4.21) * 4);
    const startY = MathUtils.lerp(-9, 9, pseudo(sequence * 5.31));
    const startZ = -MathUtils.lerp(40, 120, pseudo(sequence * 6.13));

    let from = new Vector3();
    let to = new Vector3();

    if (side === 0) {
      from = new Vector3(-26, startY, startZ);
      to = new Vector3(20, startY - 4, startZ + 8);
    } else if (side === 1) {
      from = new Vector3(26, startY, startZ);
      to = new Vector3(-20, startY - 3, startZ + 9);
    } else if (side === 2) {
      from = new Vector3(MathUtils.lerp(-14, 14, pseudo(sequence * 8.41)), 15, startZ);
      to = new Vector3(from.x + MathUtils.lerp(-8, 8, pseudo(sequence * 9.11)), -8, startZ + 7);
    } else {
      from = new Vector3(MathUtils.lerp(-12, 12, pseudo(sequence * 8.93)), -15, startZ);
      to = new Vector3(from.x + MathUtils.lerp(-8, 8, pseudo(sequence * 9.77)), 8, startZ + 6);
    }

    activeRef.current = {
      start: time,
      duration: reducedMotion ? 1.5 : MathUtils.lerp(1.15, 1.5, pseudo(sequence * 3.19)),
      from,
      to,
      scale: MathUtils.lerp(0.42, 0.78, pseudo(sequence * 10.63)),
      tilt: MathUtils.lerp(-0.04, 0.04, pseudo(sequence * 11.37)),
    };

    nextEventRef.current = time + MathUtils.lerp(14, 24, pseudo(sequence * 2.17));
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
    groupRef.current.quaternion.setFromUnitVectors(xAxis, direction);
    groupRef.current.rotateZ(active.tilt);
    groupRef.current.scale.setScalar(active.scale);

    const headMaterial = headRef.current?.material as SpriteMaterial | undefined;
    if (headMaterial) {
      headMaterial.opacity = 0.48 + Math.sin(progress * Math.PI) * 0.18;
    }

    const trailMaterial = trailRef.current.material as MeshBasicMaterial;
    trailMaterial.opacity = 0.06 + Math.sin(progress * Math.PI) * 0.08;

    particleRefs.current.forEach((sprite, index) => {
      if (!sprite) return;
      const local = index / Math.max(1, particleRefs.current.length - 1);
      sprite.position.set(-1.1 - local * 3.4, (pseudo(index + sequenceRef.current) - 0.5) * 0.12, 0);
      const material = sprite.material as SpriteMaterial;
      material.opacity = (0.025 + (1 - local) * 0.04) * Math.sin(progress * Math.PI);
      sprite.scale.setScalar((0.08 + (1 - local) * 0.1) * active.scale);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={trailRef} position={[-1.7, 0, 0]}>
        <planeGeometry args={[4.4, 0.12]} />
        <meshBasicMaterial
          map={trailTexture}
          color="#f4f8ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <sprite ref={headRef} scale={[0.5, 0.5, 0.5]}>
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
      {Array.from({ length: 5 }, (_, index) => (
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
            color={index % 2 === 0 ? "#edf6ff" : "#d4e1ff"}
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

export function SpaceEnvironment({ reducedMotion, scrollState }: SpaceEnvironmentProps) {
  return (
    <>
      <fog attach="fog" args={[new Color("#000000"), 80, 640]} />
      <ambientLight intensity={0.03} color="#dbe6f6" />
      <pointLight position={[-18, 12, 40]} intensity={1.4} color="#cfdfff" distance={280} />
      <pointLight position={[16, -10, -20]} intensity={0.65} color="#5d6887" distance={180} />

      <StarfieldLayer
        count={2600}
        spread={[220, 168]}
        forwardSpan={1500}
        sizeRange={[0.16, 0.28]}
        colorA="#dfe9fb"
        colorB="#afbdd3"
        rareBrightChance={0.0002}
        layerBias={0}
        streakStrength={0.08}
        scrollState={scrollState}
      />
      <StarfieldLayer
        count={3200}
        spread={[176, 124]}
        forwardSpan={920}
        sizeRange={[0.2, 0.38]}
        colorA="#e8f0ff"
        colorB="#c8d4e5"
        rareBrightChance={0.0008}
        layerBias={0.01}
        streakStrength={0.14}
        scrollState={scrollState}
      />
      <StarfieldLayer
        count={2500}
        spread={[132, 92]}
        forwardSpan={480}
        sizeRange={[0.28, 0.62]}
        colorA="#eef4ff"
        colorB="#cfd8e6"
        rareBrightChance={0.003}
        layerBias={0.18}
        streakStrength={0.32}
        scrollState={scrollState}
      />
      <StarfieldLayer
        count={840}
        spread={[58, 42]}
        forwardSpan={132}
        sizeRange={[0.54, 1.22]}
        colorA="#ffffff"
        colorB="#e9eef8"
        rareBrightChance={0.018}
        layerBias={0.62}
        streakStrength={0.88}
        scrollState={scrollState}
      />

      <DigitalPlanet reducedMotion={reducedMotion} scrollState={scrollState} />
      <ShootingStar reducedMotion={reducedMotion} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.2} luminanceThreshold={0.34} luminanceSmoothing={0.72} mipmapBlur />
        <Noise opacity={0.005} premultiply />
        <Vignette eskil={false} offset={0.18} darkness={0.64} />
      </EffectComposer>
    </>
  );
}
