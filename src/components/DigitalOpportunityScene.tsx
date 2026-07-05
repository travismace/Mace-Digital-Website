"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ParticleKind = "visitor" | "enquiry" | "booking" | "customer";

type Particle = {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  glow: number;
  kind: ParticleKind;
  lane: number;
  drift: number;
  offset: number;
  escaped: boolean;
};

type ScreenPoint = {
  x: number;
  y: number;
  scale: number;
  visible: boolean;
};

type NodeItem = {
  label: string;
  z: number;
  x: number;
  y: number;
};

type DashboardItem = {
  title: string;
  subtitle: string;
  tone: string;
};

const depth = 24;
const baseParticleCount = 180;
const particleKinds: ParticleKind[] = ["visitor", "enquiry", "booking", "customer"];

const nodes: NodeItem[] = [
  { label: "Website", z: 3.5, x: -1.55, y: 0.92 },
  { label: "AI Assistant", z: 6.2, x: 1.35, y: -0.95 },
  { label: "WhatsApp", z: 8.7, x: -1.1, y: 0.56 },
  { label: "Booking System", z: 11.5, x: 1.55, y: -0.15 },
  { label: "CRM", z: 14.3, x: -1.35, y: -0.72 },
  { label: "Follow-up Automation", z: 17.1, x: 1.25, y: 0.76 },
  { label: "Returning Customer", z: 20.8, x: 0.18, y: 0.1 },
];

const storyLines = [
  "Every visitor is an opportunity.",
  "But without the right systems...",
  "Opportunities disappear.",
  "Mace Digital builds websites and automation that capture every enquiry, every booking, and every customer.",
  "Technology that works while you sleep.",
];

const stats = [
  "+42% More Enquiries",
  "3x Faster Responses",
  "24/7 Customer Support",
  "Automated Bookings",
  "Higher Customer Retention",
];

const dashboards: DashboardItem[] = [
  { title: "Live bookings", subtitle: "12 new appointments routed this hour", tone: "blue" },
  { title: "Customer messages", subtitle: "AI triage active • zero missed conversations", tone: "purple" },
  { title: "Calendar sync", subtitle: "Bookings auto-placed into the right slots", tone: "cyan" },
  { title: "CRM cards", subtitle: "Returning-customer journeys reactivated instantly", tone: "white" },
  { title: "Sales graph", subtitle: "Recovered opportunities accelerating conversion", tone: "blue" },
  { title: "Website analytics", subtitle: "Traffic, enquiries, and automation all in flow", tone: "purple" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function projectPoint(x: number, y: number, z: number, width: number, height: number): ScreenPoint {
  const perspective = 1 / Math.max(0.18, z * 0.16);
  return {
    x: width * 0.5 + x * width * 0.19 * perspective,
    y: height * 0.5 + y * height * 0.19 * perspective,
    scale: perspective,
    visible: z > 0.18,
  };
}

function createParticles(count: number) {
  return Array.from({ length: count }, (_, index): Particle => {
    const lane = index % 7;
    const seed = index + 1;
    return {
      id: index,
      x: mix(-2.2, 2.2, seededRandom(seed * 1.17)),
      y: mix(-1.45, 1.45, seededRandom(seed * 1.97)),
      z: mix(0.4, depth, seededRandom(seed * 2.31)),
      size: mix(1.1, 3.4, seededRandom(seed * 3.73)),
      speed: mix(0.011, 0.03, seededRandom(seed * 4.71)),
      glow: mix(0.45, 1, seededRandom(seed * 5.93)),
      kind: particleKinds[index % particleKinds.length],
      lane,
      drift: mix(-1, 1, seededRandom(seed * 6.21)),
      offset: seededRandom(seed * 7.91),
      escaped: seededRandom(seed * 8.17) > 0.74,
    };
  });
}

export function DigitalOpportunityScene() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(false);
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const [progress, setProgress] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [activeStat, setActiveStat] = useState(0);

  const nodeActivation = useMemo(
    () => nodes.map((_, index) => clamp((progress - (0.19 + index * 0.085)) / 0.09, 0, 1)),
    [progress],
  );

  useEffect(() => {
    particlesRef.current = createParticles(baseParticleCount);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = clamp(window.devicePixelRatio || 1, 1, 1.8);
      sizeRef.current = { width: rect.width, height: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updateProgress = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const denominator = Math.max(1, rect.height - viewportHeight);
      const next = clamp(-rect.top / denominator, 0, 1);
      progressRef.current = next;
      setProgress(next);
      setActiveLine(Math.min(storyLines.length - 1, Math.floor(next * storyLines.length)));
      setActiveStat(Math.min(stats.length - 1, Math.floor(clamp((next - 0.18) / 0.68, 0, 0.999) * stats.length)));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );

    observer.observe(section);
    resize();
    updateProgress();

    let lastTime = performance.now();

    const render = (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const { width, height } = sizeRef.current;

      rafRef.current = window.requestAnimationFrame(render);

      if (!canvas || !ctx || !width || !height || !visibleRef.current) {
        lastTime = now;
        return;
      }

      const dt = Math.min(32, now - lastTime) / 16.666;
      lastTime = now;
      if (!reduceMotion.matches) {
        timeRef.current += dt;
      }

      const t = timeRef.current;
      const p = progressRef.current;
      const forwardSpeed = reduceMotion.matches ? 0.45 : mix(0.85, 2.5, p);
      const ambientStrength = mix(0.18, 0.4, smoothstep(0, 1, p));
      const redirectStrength = smoothstep(0.34, 0.52, p);
      const convergence = smoothstep(0.82, 1, p);

      ctx.clearRect(0, 0, width, height);

      const background = ctx.createRadialGradient(width * 0.5, height * 0.44, width * 0.02, width * 0.5, height * 0.52, width * 0.7);
      background.addColorStop(0, "rgba(10, 18, 42, 0.95)");
      background.addColorStop(0.4, "rgba(4, 10, 22, 0.97)");
      background.addColorStop(1, "rgba(1, 3, 9, 1)");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < 7; i += 1) {
        const y = height * (0.13 + i * 0.12 + Math.sin(t * 0.012 + i) * 0.004);
        const glow = ctx.createLinearGradient(0, y, width, y);
        glow.addColorStop(0, "rgba(34, 211, 238, 0)");
        glow.addColorStop(0.25, `rgba(64, 156, 255, ${0.045 + p * 0.03})`);
        glow.addColorStop(0.5, `rgba(130, 96, 255, ${0.08 + p * 0.04})`);
        glow.addColorStop(0.75, `rgba(64, 156, 255, ${0.04 + p * 0.03})`);
        glow.addColorStop(1, "rgba(34, 211, 238, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, y - 1, width, 2);
      }

      const activationFor = (index: number) =>
        clamp((p - (0.19 + index * 0.085)) / 0.09, 0, 1);

      const nodePoints = nodes.map((node) =>
        projectPoint(node.x, node.y, node.z - p * depth * 0.92 + 1.4, width, height),
      );

      ctx.lineWidth = 1.2;
      nodes.forEach((node, index) => {
        const next = nodes[index + 1];
        if (!next) return;
        const start = nodePoints[index];
        const end = nodePoints[index + 1];
        if (!start.visible || !end.visible) return;
        const startActivation = activationFor(index);
        const endActivation = activationFor(index + 1);
        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, `rgba(90, 184, 255, ${0.14 + startActivation * 0.5})`);
        gradient.addColorStop(0.5, `rgba(151, 71, 255, ${0.1 + endActivation * 0.42})`);
        gradient.addColorStop(1, `rgba(79, 224, 255, ${0.12 + endActivation * 0.4})`);
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "rgba(77, 163, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        const midX = (start.x + end.x) * 0.5;
        const midY = (start.y + end.y) * 0.5 + Math.sin(index + p * Math.PI * 2) * 28;
        ctx.quadraticCurveTo(midX, midY, end.x, end.y);
        ctx.stroke();
      });

      particlesRef.current.forEach((particle, index) => {
        particle.z -= particle.speed * dt * forwardSpeed;
        if (particle.z < 0.18) {
          particle.z = depth + seededRandom(index * 9.13 + t) * 2.6;
        }

        const routeIndex = particle.lane % nodes.length;
        const routeNode = nodes[routeIndex];
        const routeNodeNext = nodes[(routeIndex + 1) % nodes.length];
        const laneProgress = ((particle.offset + p * 1.5 + t * particle.speed * 0.32) % 1 + 1) % 1;
        const targetX = mix(routeNode.x, routeNodeNext.x, laneProgress);
        const targetY = mix(routeNode.y, routeNodeNext.y, laneProgress);
        const driftX = Math.sin(t * 0.015 + particle.drift * 6 + index) * 0.18;
        const driftY = Math.cos(t * 0.018 + particle.drift * 4 + index) * 0.11;
        const lostPull = particle.escaped ? mix(1.9, 0, redirectStrength) : 0;
        const convergePull = convergence * 0.92;

        particle.x = mix(particle.x, mix(targetX, 0, convergePull) + driftX + lostPull, 0.024 + redirectStrength * 0.02 + convergence * 0.03);
        particle.y = mix(particle.y, mix(targetY, 0, convergePull) + driftY + (particle.escaped ? 0.45 * (1 - redirectStrength) : 0), 0.028 + redirectStrength * 0.018 + convergence * 0.04);

        const point = projectPoint(particle.x, particle.y, particle.z - p * depth * 0.88 + 1.2, width, height);
        if (!point.visible) return;

        const radius = particle.size * point.scale * 11;
        const alpha = clamp(0.18 + point.scale * 0.72 + ambientStrength, 0, 1);
        const color = particle.kind === "booking"
          ? `rgba(168, 120, 255, ${alpha})`
          : particle.kind === "customer"
            ? `rgba(235, 248, 255, ${alpha})`
            : `rgba(79, 214, 255, ${alpha})`;

        ctx.fillStyle = color;
        ctx.shadowBlur = 14 + radius * 3;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.55})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(0.7, radius * 0.35), 0, Math.PI * 2);
        ctx.fill();
      });

      nodePoints.forEach((point, index) => {
        if (!point.visible) return;
        const activation = activationFor(index);
        const outer = 16 * point.scale + activation * 14;
        const ringColor = `rgba(110, 198, 255, ${0.18 + activation * 0.7})`;
        ctx.strokeStyle = ringColor;
        ctx.fillStyle = `rgba(8, 18, 40, ${0.45 + activation * 0.25})`;
        ctx.lineWidth = 1.2 + activation * 1.4;
        ctx.shadowBlur = 30;
        ctx.shadowColor = `rgba(101, 164, 255, ${0.35 + activation * 0.35})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, outer, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = `rgba(184, 142, 255, ${0.08 + activation * 0.55})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, outer + 8 + Math.sin(t * 0.03 + index) * 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      if (convergence > 0.02) {
        const beamWidth = mix(0, width * 0.18, convergence);
        const beam = ctx.createLinearGradient(width * 0.5 - beamWidth, 0, width * 0.5 + beamWidth, 0);
        beam.addColorStop(0, "rgba(79, 214, 255, 0)");
        beam.addColorStop(0.35, `rgba(79, 214, 255, ${0.14 + convergence * 0.4})`);
        beam.addColorStop(0.5, `rgba(255,255,255, ${0.38 + convergence * 0.4})`);
        beam.addColorStop(0.65, `rgba(164, 104, 255, ${0.14 + convergence * 0.35})`);
        beam.addColorStop(1, "rgba(79, 214, 255, 0)");
        ctx.fillStyle = beam;
        ctx.shadowBlur = 40;
        ctx.shadowColor = "rgba(108, 176, 255, 0.55)";
        ctx.fillRect(width * 0.5 - beamWidth, height * 0.12, beamWidth * 2, height * 0.76);
      }

      ctx.restore();
    };

    rafRef.current = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateProgress);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className="opportunity-scene" aria-labelledby="opportunity-title">
      <div className="opportunity-scene__sticky">
        <canvas
          ref={canvasRef}
          className="opportunity-scene__canvas"
          aria-hidden="true"
        />

        <div className="opportunity-scene__vignette" aria-hidden="true" />
        <div className="opportunity-scene__grid" aria-hidden="true" />

        <div className="opportunity-scene__content">
          <div className="opportunity-scene__intro">
            <span className="eyebrow">Scroll-driven automation story</span>
            <h2 id="opportunity-title">Every Click Is an Opportunity.</h2>
            <p>
              A cinematic data journey showing how Mace Digital turns traffic,
              conversations, bookings, and follow-up into one connected revenue system.
            </p>
          </div>

          <div className="opportunity-storyboard" aria-live="polite">
            {storyLines.map((line, index) => {
              const distance = Math.abs(index - activeLine);
              const isActive = index === activeLine;
              return (
                <p
                  key={line}
                  className={`opportunity-storyboard__line ${isActive ? "is-active" : ""}`}
                  style={{
                    opacity: distance > 1 ? 0.12 : isActive ? 1 : 0.38,
                    transform: `translate3d(0, ${(index - activeLine) * 16}px, 0) scale(${isActive ? 1 : 0.98})`,
                  }}
                >
                  {line}
                </p>
              );
            })}
          </div>

          <div className="opportunity-stats" aria-hidden="true">
            {stats.map((stat, index) => {
              const isActive = index === activeStat;
              return (
                <div key={stat} className={`opportunity-stat ${isActive ? "is-active" : ""}`}>
                  <span>{stat}</span>
                </div>
              );
            })}
          </div>

          <div className="opportunity-node-stack">
            {nodes.map((node, index) => (
              <div
                key={node.label}
                className={`opportunity-node ${nodeActivation[index] > 0.14 ? "is-active" : ""}`}
                style={{
                  opacity: 0.24 + nodeActivation[index] * 0.76,
                  transform: `translate3d(0, ${index * 4}px, 0)`,
                }}
              >
                <span className="opportunity-node__dot" />
                <span>{node.label}</span>
              </div>
            ))}
          </div>

          <div className="opportunity-dashboards" aria-hidden="true">
            {dashboards.map((dashboard, index) => (
              <article
                key={dashboard.title}
                className={`opportunity-dashboard opportunity-dashboard--${dashboard.tone}`}
                style={{
                  transform: `translate3d(0, ${Math.sin(progress * Math.PI * 5 + index) * 8}px, 0)`,
                  opacity: clamp(0.2 + smoothstep(0.16, 0.88, progress) * 0.8 - Math.abs(activeStat - (index % stats.length)) * 0.08, 0.2, 1),
                }}
              >
                <div className="opportunity-dashboard__header">
                  <span className="opportunity-dashboard__pulse" />
                  <span>{dashboard.title}</span>
                </div>
                <p>{dashboard.subtitle}</p>
                <div className="opportunity-dashboard__bars">
                  <span style={{ width: `${48 + ((index * 13) % 36)}%` }} />
                  <span style={{ width: `${72 - ((index * 9) % 28)}%` }} />
                  <span style={{ width: `${58 + ((index * 7) % 22)}%` }} />
                </div>
              </article>
            ))}
          </div>

          <div className={`opportunity-logo ${progress > 0.87 ? "is-visible" : ""}`}>
            <span className="opportunity-logo__beam" />
            <span className="opportunity-logo__wordmark">Mace Digital</span>
          </div>
        </div>
      </div>
    </section>
  );
}
