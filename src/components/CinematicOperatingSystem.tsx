"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, PerspectiveCamera, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type MessageBeat = {
  text: string;
  start: number;
  end: number;
};

type ActivationNode = {
  label: string;
  start: number;
  x: string;
  y: string;
};

const messages: MessageBeat[] = [
  { text: "Modern businesses run on technology.", start: 0.08, end: 0.2 },
  { text: "Every visitor is potential.", start: 0.19, end: 0.32 },
  { text: "Every enquiry has value.", start: 0.31, end: 0.45 },
  { text: "Automation never sleeps.", start: 0.44, end: 0.59 },
  { text: "Technology should work for you.", start: 0.58, end: 0.73 },
  { text: "We build systems that power business growth.", start: 0.72, end: 0.88 },
];

const activationNodes: ActivationNode[] = [
  { label: "Lead capture online", start: 0.18, x: "12%", y: "24%" },
  { label: "Customer data synchronised", start: 0.3, x: "76%", y: "27%" },
  { label: "Bookings flowing", start: 0.44, x: "18%", y: "68%" },
  { label: "Automations active", start: 0.58, x: "73%", y: "66%" },
  { label: "Growth system live", start: 0.76, x: "48%", y: "16%" },
];

const metricBeats = [
  { label: "Systems online", value: "06", start: 0.18 },
  { label: "Signal velocity", value: "24.7x", start: 0.42 },
  { label: "Automation uptime", value: "99.99%", start: 0.64 },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function smoothStep(start: number, end: number, value: number) {
  if (start === end) return value >= end ? 1 : 0;
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

function windowPresence(progress: number, start: number, end: number, feather = 0.04) {
  const fadeIn = smoothStep(start - feather, start + feather, progress);
  const fadeOut = 1 - smoothStep(end - feather, end + feather, progress);
  return clamp(fadeIn * fadeOut);
}

function curvePoint(points: THREE.Vector3[], t: number) {
  const clamped = clamp(t);
  const scaled = clamped * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const localT = scaled - index;
  return points[index].clone().lerp(points[index + 1], localT);
}

function useViewportFlags() {
  const [state, setState] = useState({ isMobile: false, reducedMotion: false });

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 900px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setState({ isMobile: mobile.matches, reducedMotion: reduced.matches });
    };

    update();
    mobile.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return state;
}

function useScrollProgress() {
  const rootRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const next = clamp(-rect.top / distance);
      progressRef.current = next;
      setProgressValue(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { rootRef, progressRef, progressValue };
}

function EnergyPulse({
  curve,
  offset,
  speed,
  radius,
  color,
  activation,
}: {
  curve: THREE.CatmullRomCurve3;
  offset: number;
  speed: number;
  radius: number;
  color: string;
  activation: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    const point = curve.getPointAt(t);
    ref.current.position.copy(point);
    const pulse = 0.8 + Math.sin(clock.elapsedTime * 6 + offset * 10) * 0.25;
    ref.current.scale.setScalar(Math.max(0.001, activation * pulse));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={5}
        transparent
        opacity={Math.max(0.08, activation)}
        toneMapped={false}
      />
    </mesh>
  );
}

function CoreChamber({
  progress,
  isMobile,
  reducedMotion,
}: {
  progress: React.MutableRefObject<number>;
  isMobile: boolean;
  reducedMotion: boolean;
}) {
  const coreRef = useRef<THREE.Group>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);

  const spineCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.05, 14),
        new THREE.Vector3(-0.2, 0.18, 4),
        new THREE.Vector3(0.28, -0.1, -14),
        new THREE.Vector3(-0.16, 0.2, -34),
        new THREE.Vector3(0.18, -0.04, -58),
        new THREE.Vector3(0.05, 0.08, -86),
        new THREE.Vector3(0, 0, -118),
      ]),
    []
  );

  const branchCurves = useMemo(
    () => [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-4.8, 1.4, -12),
        new THREE.Vector3(-6.4, 1.8, -28),
        new THREE.Vector3(-4.2, 0.8, -46),
        new THREE.Vector3(-2.3, 0.45, -66),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4.7, -1.2, -14),
        new THREE.Vector3(6.8, -1.6, -30),
        new THREE.Vector3(4.3, -0.7, -50),
        new THREE.Vector3(2.1, -0.25, -70),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-3.2, -1.1, -16),
        new THREE.Vector3(-4.4, -1.4, -36),
        new THREE.Vector3(-2.5, -0.55, -60),
        new THREE.Vector3(-1.2, -0.16, -90),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(3.1, 1.05, -18),
        new THREE.Vector3(4.8, 1.45, -40),
        new THREE.Vector3(2.7, 0.55, -62),
        new THREE.Vector3(1.3, 0.12, -92),
      ]),
    ],
    []
  );

  const cameraPath = useMemo(
    () => [
      new THREE.Vector3(0, 0.14, 15),
      new THREE.Vector3(0.18, 0.24, 7),
      new THREE.Vector3(-0.32, 0.06, -7),
      new THREE.Vector3(0.26, -0.12, -24),
      new THREE.Vector3(-0.18, 0.2, -44),
      new THREE.Vector3(0.22, -0.06, -68),
      new THREE.Vector3(0.06, 0.08, -97),
      new THREE.Vector3(0, 0.04, -122),
    ],
    []
  );

  const lookPath = useMemo(
    () => [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(0.1, 0.08, -24),
      new THREE.Vector3(-0.08, 0.04, -40),
      new THREE.Vector3(0.06, 0.1, -60),
      new THREE.Vector3(-0.04, 0.02, -84),
      new THREE.Vector3(0.02, 0.04, -108),
      new THREE.Vector3(0, 0, -132),
    ],
    []
  );

  const spinePoints = useMemo(() => spineCurve.getPoints(280), [spineCurve]);
  const branchPoints = useMemo(() => branchCurves.map((curve) => curve.getPoints(180)), [branchCurves]);
  const frames = useMemo(
    () =>
      Array.from({ length: isMobile ? 12 : 18 }, (_, index) => ({
        z: 9 - index * 9,
        x: (index % 2 === 0 ? -1 : 1) * (0.2 + index * 0.03),
        y: Math.sin(index * 0.8) * 0.3,
        w: 11.5 - index * 0.38,
        h: 7.4 - index * 0.25,
        rotation: (index % 2 === 0 ? 1 : -1) * (0.08 + index * 0.015),
      })),
    [isMobile]
  );

  const machineColumns = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        x: index % 2 === 0 ? -5.2 : 5.2,
        y: index < 6 ? 1.8 : -1.8,
        z: -6 - index * 10,
        height: 1.6 + (index % 3) * 0.7,
      })),
    []
  );

  useFrame(({ camera, clock }) => {
    const p = progress.current;
    const energy = smoothStep(0.04, 0.92, p);
    const camPos = curvePoint(cameraPath, p);
    const lookAt = curvePoint(lookPath, p);
    const driftX = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.28) * 0.12;
    const driftY = reducedMotion ? 0 : Math.cos(clock.elapsedTime * 0.22) * 0.08;

    camera.position.lerp(new THREE.Vector3(camPos.x + driftX, camPos.y + driftY, camPos.z), 0.07);
    camera.lookAt(lookAt);
    camera.rotation.z = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.15 + p * Math.PI) * 0.025;

    if (coreRef.current) {
      const beat = 1 + Math.sin(clock.elapsedTime * (1.2 + energy * 3.4)) * (0.05 + energy * 0.08);
      coreRef.current.scale.setScalar(beat);
      coreRef.current.rotation.y += 0.0025 + energy * 0.006;
    }

    if (ringARef.current) {
      ringARef.current.rotation.x += 0.005;
      ringARef.current.rotation.y += 0.009 + energy * 0.01;
    }

    if (ringBRef.current) {
      ringBRef.current.rotation.y -= 0.004;
      ringBRef.current.rotation.z += 0.006 + energy * 0.009;
    }
  });

  const energy = smoothStep(0.03, 0.96, progress.current);
  const finalEnergy = smoothStep(0.78, 1, progress.current);
  const branchActivation = branchCurves.map((_, index) => smoothStep(0.18 + index * 0.12, 0.45 + index * 0.12, progress.current));

  return (
    <>
      <color attach="background" args={["#010205"]} />
      <fog attach="fog" args={["#010205", 10, 150]} />
      <PerspectiveCamera makeDefault fov={isMobile ? 54 : 42} position={[0, 0.14, 15]} />
      <ambientLight intensity={0.18 + energy * 0.28} color="#6aa1ff" />
      <directionalLight position={[6, 8, 10]} intensity={0.55 + energy * 0.75} color="#f3fbff" />
      <pointLight position={[0, 0.3, 0.3]} intensity={3 + energy * 12} distance={18} color="#2fa3ff" />
      <pointLight position={[0, 0.2, -46]} intensity={energy * 10} distance={28} color="#72d7ff" />
      <pointLight position={[0, 0, -104]} intensity={finalEnergy * 24} distance={40} color="#c9ecff" />

      <group>
        {frames.map((frame, index) => {
          const opacity = 0.08 + energy * 0.16 + Math.max(0, 0.2 - index * 0.008);
          return (
            <group key={`frame-${index}`} position={[frame.x, frame.y, frame.z]} rotation={[0, 0, frame.rotation]}>
              <Line
                points={[
                  [-frame.w, frame.h, 0],
                  [frame.w, frame.h, 0],
                  [frame.w, -frame.h, 0],
                  [-frame.w, -frame.h, 0],
                  [-frame.w, frame.h, 0],
                ]}
                color="#17365f"
                lineWidth={0.8}
                transparent
                opacity={opacity}
              />
              <Line
                points={[
                  [-frame.w * 0.84, frame.h * 0.84, 0],
                  [frame.w * 0.84, frame.h * 0.84, 0],
                  [frame.w * 0.84, -frame.h * 0.84, 0],
                  [-frame.w * 0.84, -frame.h * 0.84, 0],
                  [-frame.w * 0.84, frame.h * 0.84, 0],
                ]}
                color="#58c7ff"
                lineWidth={0.55}
                transparent
                opacity={opacity * 0.9}
              />
            </group>
          );
        })}
      </group>

      <group>
        {machineColumns.map((column, index) => {
          const active = smoothStep(0.15 + index * 0.03, 0.5 + index * 0.03, progress.current);
          return (
            <group key={`column-${index}`} position={[column.x, column.y, column.z]}>
              <mesh>
                <boxGeometry args={[0.35, column.height, 0.35]} />
                <meshStandardMaterial
                  color="#091320"
                  emissive="#3cb6ff"
                  emissiveIntensity={0.14 + active * 0.9}
                  metalness={0.95}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[0, 0, 0.24]}>
                <boxGeometry args={[0.16, column.height * 0.74, 0.05]} />
                <meshBasicMaterial color={active > 0.08 ? "#d8fbff" : "#0d2238"} transparent opacity={0.08 + active * 0.82} />
              </mesh>
            </group>
          );
        })}
      </group>

      <group ref={coreRef}>
        <mesh>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#061220" metalness={0.86} roughness={0.18} emissive="#31a8ff" emissiveIntensity={0.9 + energy * 2.6} />
        </mesh>
        <mesh scale={0.6}>
          <octahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial color="#dbf6ff" emissive="#bfeeff" emissiveIntensity={2.4 + energy * 4.2} roughness={0.04} metalness={0.18} transparent opacity={0.88} />
        </mesh>
        <mesh ref={ringARef} rotation={[0.4, 0.2, 0.8]}>
          <torusGeometry args={[2, 0.05, 18, 120]} />
          <meshStandardMaterial color="#4db7ff" emissive="#4db7ff" emissiveIntensity={1.8 + energy * 2.2} toneMapped={false} />
        </mesh>
        <mesh ref={ringBRef} rotation={[1.2, 0.4, 0.2]}>
          <torusGeometry args={[2.65, 0.035, 16, 120]} />
          <meshStandardMaterial color="#7d7cff" emissive="#7d7cff" emissiveIntensity={0.7 + energy * 1.8} toneMapped={false} transparent opacity={0.72} />
        </mesh>
      </group>

      <group>
        <Line points={spinePoints} color="#11406c" lineWidth={2.4} transparent opacity={0.65} />
        <Line points={spinePoints} color="#42b7ff" lineWidth={1.45} transparent opacity={0.2 + energy * 0.82} />
        <Line points={spinePoints} color="#edfdff" lineWidth={0.55} transparent opacity={0.06 + energy * 0.9} />
        {branchPoints.map((points, index) => (
          <group key={`branch-${index}`}>
            <Line points={points} color="#12375e" lineWidth={1.5} transparent opacity={0.55} />
            <Line points={points} color={index % 2 === 0 ? "#56c8ff" : "#8c78ff"} lineWidth={0.8} transparent opacity={0.08 + branchActivation[index] * 0.82} />
            <Line points={points} color="#f3fcff" lineWidth={0.35} transparent opacity={branchActivation[index] * 0.55} />
          </group>
        ))}
      </group>

      <EnergyPulse curve={spineCurve} offset={0} speed={0.09} radius={0.2} color="#d8fbff" activation={0.2 + energy * 0.95} />
      <EnergyPulse curve={spineCurve} offset={0.42} speed={0.12} radius={0.15} color="#4cc1ff" activation={energy} />
      {branchCurves.map((curve, index) => (
        <EnergyPulse
          key={`pulse-${index}`}
          curve={curve}
          offset={index * 0.21}
          speed={0.08 + index * 0.015}
          radius={0.1 + (index % 2) * 0.04}
          color={index % 2 === 0 ? "#92e8ff" : "#8d8cff"}
          activation={branchActivation[index]}
        />
      ))}

      <Sparkles
        count={isMobile ? 48 : 96}
        speed={0.35 + energy * 0.5}
        size={1.8}
        scale={[18, 10, 130]}
        color="#7acfff"
        opacity={0.28 + energy * 0.3}
      />
      <Sparkles
        count={isMobile ? 28 : 52}
        speed={0.22 + finalEnergy * 0.9}
        size={2.6}
        scale={[10, 6, 42]}
        color="#f3fdff"
        opacity={0.08 + finalEnergy * 0.55}
        position={[0, 0, -108]}
      />
    </>
  );
}

export function CinematicOperatingSystem() {
  const { rootRef, progressRef, progressValue } = useScrollProgress();
  const { isMobile, reducedMotion } = useViewportFlags();

  const finalReveal = smoothStep(0.8, 0.98, progressValue);
  const chamberGlow = smoothStep(0.06, 0.92, progressValue);
  const introDim = 1 - smoothStep(0.72, 0.98, progressValue);

  return (
    <main className="machine-page">
      <section ref={rootRef} className="machine-journey">
        <div className="machine-stage">
          <div className="machine-vignette" />
          <div className="machine-grid" />
          <div className="machine-canvas-shell" aria-hidden="true">
            <Canvas dpr={[1, 1.8]} gl={{ antialias: true, alpha: false }}>
              <CoreChamber progress={progressRef} isMobile={isMobile} reducedMotion={reducedMotion} />
            </Canvas>
          </div>

          <div className="machine-overlay">
            <header className="machine-topbar">
              <div className="machine-chip">
                <span className="machine-chip__mark">MD</span>
                <div>
                  <p>Mace Digital</p>
                  <span>Premium websites + intelligent automation</span>
                </div>
              </div>
              <div className="machine-status">
                <span>System boot</span>
                <strong>{String(Math.round(progressValue * 100)).padStart(2, "0")}%</strong>
              </div>
            </header>

            <div className="machine-progress-rail" aria-hidden="true">
              <span>Powering the system</span>
              <div className="machine-progress-track">
                <div className="machine-progress-fill" style={{ transform: `scaleY(${progressValue})` }} />
              </div>
            </div>

            <div className="machine-copy">
              <div className="machine-intro" style={{ opacity: introDim }}>
                <span className="machine-kicker">Inside the machine</span>
                <h1>The operating core of a modern growth system.</h1>
                <p>
                  Scroll forward and watch Mace Digital bring a dormant digital machine to life — circuitry,
                  infrastructure, intelligence, and growth all activating in one continuous cinematic reveal.
                </p>
              </div>

              <div className="machine-message-stack" aria-live="polite">
                {messages.map((message) => {
                  const presence = windowPresence(progressValue, message.start, message.end, 0.05);
                  return (
                    <article
                      key={message.text}
                      className="machine-message"
                      style={{
                        opacity: presence,
                        transform: `translate3d(0, ${32 - presence * 32}px, 0) scale(${0.96 + presence * 0.04})`,
                        filter: `blur(${(1 - presence) * 12}px)`,
                      }}
                    >
                      <span>Signal unlocked</span>
                      <h2>{message.text}</h2>
                    </article>
                  );
                })}
              </div>

              <div className="machine-metrics">
                {metricBeats.map((metric) => {
                  const active = smoothStep(metric.start, metric.start + 0.16, progressValue);
                  return (
                    <div
                      key={metric.label}
                      className="machine-metric"
                      style={{
                        opacity: 0.2 + active * 0.8,
                        transform: `translateY(${24 - active * 24}px)`,
                      }}
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="machine-activations" aria-hidden="true">
              {activationNodes.map((node) => {
                const active = smoothStep(node.start, node.start + 0.14, progressValue);
                return (
                  <div
                    key={node.label}
                    className="machine-activation"
                    style={{
                      left: node.x,
                      top: node.y,
                      opacity: active,
                      transform: `translate3d(0, ${18 - active * 18}px, 0) scale(${0.92 + active * 0.08})`,
                    }}
                  >
                    <i />
                    <span>{node.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="machine-finale" style={{ opacity: finalReveal, pointerEvents: finalReveal > 0.35 ? "auto" : "none" }}>
              <div className="machine-finale__beam" style={{ opacity: chamberGlow }} />
              <div className="machine-finale__card">
                <span>System fully online</span>
                <h2>MACE DIGITAL</h2>
                <p>
                  Premium Websites.
                  <br />
                  Intelligent Automation.
                  <br />
                  Real Business Growth.
                </p>
                <div className="machine-actions">
                  <a href="#contact" className="machine-button machine-button--primary">
                    Book a Discovery Call
                  </a>
                  <a href="#work" className="machine-button machine-button--ghost">
                    View Our Work
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="machine-afterglow" id="work">
        <div>
          <span>What this is showing</span>
          <h3>Websites, systems, and automation should feel engineered — not assembled.</h3>
        </div>
        <p>
          This hero is designed as a proof-of-quality moment: a premium, scroll-driven launch experience that
          reflects the level of craft Mace Digital can bring to client websites, lead-generation funnels, and
          automation systems.
        </p>
      </section>

      <section className="machine-contact" id="contact">
        <div className="machine-contact__panel">
          <span>Next step</span>
          <h3>Ready to build your own high-performance digital system?</h3>
          <p>
            Turn your website, enquiry flow, and automation stack into one connected growth machine.
          </p>
          <div className="machine-actions">
            <a href="mailto:hello@macedigital.co.uk" className="machine-button machine-button--primary">
              Start Your Project
            </a>
            <a href="#work" className="machine-button machine-button--ghost">
              Rewatch the reveal
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
