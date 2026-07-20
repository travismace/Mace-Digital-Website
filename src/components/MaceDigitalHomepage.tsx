"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./MaceDigitalHomepage.module.css";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Flagship websites",
    body: "Premium marketing sites and landing pages built to establish trust fast and make the business feel more valuable before a call even begins.",
  },
  {
    title: "AI-assisted enquiries",
    body: "Lead capture and qualification systems that turn interest into structured conversations instead of lost inbox messages.",
  },
  {
    title: "Operational automations",
    body: "Bookings, CRM updates, follow-ups, review requests, and reporting connected into one practical system for the business owner.",
  },
];

const selectedWork = [
  {
    title: "Service businesses",
    body: "Sharper positioning, clearer offers, and enquiry flows that move visitors from interest to action without friction.",
  },
  {
    title: "Premium operators",
    body: "Web experiences that look high-value, feel engineered, and reinforce authority through pacing, material language, and restraint.",
  },
  {
    title: "Automation-first rebuilds",
    body: "Sites restructured so sales, booking, CRM, and follow-up systems work as one connected machine instead of isolated tools.",
  },
];

const outcomes = [
  "Higher trust in the first 10 seconds",
  "Cleaner enquiries and better-qualified leads",
  "Less manual admin after a booking arrives",
  "Faster follow-up and review collection",
];

const processSteps = [
  {
    step: "01",
    title: "Diagnose the current funnel",
    body: "Map where trust drops, where enquiries stall, and where operational handoffs break down.",
  },
  {
    step: "02",
    title: "Design the commercial structure",
    body: "Clarify the offer, hierarchy, proof, and action path before visual polish takes over.",
  },
  {
    step: "03",
    title: "Build the website and connected systems",
    body: "Implement the site, lead capture, booking flow, CRM logic, follow-ups, and reporting as one delivery.",
  },
  {
    step: "04",
    title: "Launch, measure, refine",
    body: "Track what happens after launch and tune the system around actual enquiries, conversions, and operations.",
  },
];

const workshopSteps = [
  "Precision blueprint lines draw onto the screen",
  "A premium website interface assembles from those lines",
  "Navigation, headline, imagery and CTA lock into position",
  "A customer enquiry appears inside the website",
  "The enquiry connects to an AI assistant",
  "The assistant confirms the details",
  "A booking panel activates and confirms the appointment",
  "Customer information enters a CRM record",
  "A follow-up message and review request are scheduled",
  "A small analytics summary activates",
  "All components settle into one connected system",
];

type ConstructionVariant = "hero" | "intro" | "services" | "workshop" | "work" | "outcomes" | "process" | "contact";

type ConstructionNode = { cx: number; cy: number; r?: number };
type ConstructionModeConfig = {
  primary: string[];
  secondary: string[];
  nodes: ConstructionNode[];
};

const mobileConstructionPaths: ConstructionModeConfig = {
  primary: ["M 56 0 V 1000"],
  secondary: [
    "M 56 118 H 326",
    "M 56 262 H 300",
    "M 56 430 H 344",
    "M 56 628 H 316",
    "M 56 818 H 330",
  ],
  nodes: [
    { cx: 56, cy: 118 },
    { cx: 56, cy: 262 },
    { cx: 56, cy: 430 },
    { cx: 56, cy: 628 },
    { cx: 56, cy: 818 },
  ],
};

const constructionPaths: Record<ConstructionVariant, { desktop: ConstructionModeConfig; mobile: ConstructionModeConfig }> = {
  hero: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 168 H 412",
        "M 112 236 H 454 V 420 H 828",
        "M 454 420 V 784",
        "M 454 620 H 288",
        "M 828 420 V 690 H 970",
      ],
      nodes: [
        { cx: 112, cy: 168 },
        { cx: 112, cy: 236, r: 4.2 },
        { cx: 454, cy: 420, r: 4.2 },
        { cx: 454, cy: 620 },
        { cx: 828, cy: 420 },
        { cx: 828, cy: 690 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
  intro: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 214 H 478",
        "M 112 284 H 354",
        "M 478 214 V 582",
        "M 478 434 H 924",
        "M 478 694 H 708",
      ],
      nodes: [
        { cx: 112, cy: 214 },
        { cx: 112, cy: 284 },
        { cx: 478, cy: 214, r: 4.2 },
        { cx: 478, cy: 434 },
        { cx: 478, cy: 694 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
  services: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 182 H 450",
        "M 112 262 H 356",
        "M 112 372 H 970",
        "M 324 372 V 562",
        "M 622 372 V 562",
        "M 112 562 H 970",
        "M 452 562 V 830",
        "M 452 676 H 780",
        "M 780 676 V 830",
      ],
      nodes: [
        { cx: 112, cy: 182 },
        { cx: 112, cy: 262 },
        { cx: 112, cy: 372, r: 4.4 },
        { cx: 324, cy: 372 },
        { cx: 622, cy: 372 },
        { cx: 452, cy: 562, r: 4.4 },
        { cx: 780, cy: 676, r: 4.2 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
  workshop: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: ["M 112 220 H 452", "M 452 220 V 810", "M 452 610 H 968"],
      nodes: [{ cx: 112, cy: 220 }, { cx: 452, cy: 220 }, { cx: 452, cy: 610 }],
    },
    mobile: mobileConstructionPaths,
  },
  work: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 188 H 442",
        "M 112 260 H 332",
        "M 112 532 H 968",
        "M 338 532 V 822",
        "M 638 532 V 770",
        "M 850 532 V 790",
      ],
      nodes: [
        { cx: 112, cy: 188 },
        { cx: 112, cy: 260 },
        { cx: 112, cy: 532, r: 4.3 },
        { cx: 338, cy: 532 },
        { cx: 638, cy: 532 },
        { cx: 850, cy: 532 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
  outcomes: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 200 H 474",
        "M 112 272 H 340",
        "M 474 200 V 748",
        "M 474 400 H 938",
        "M 474 520 H 938",
        "M 474 640 H 938",
      ],
      nodes: [
        { cx: 112, cy: 200 },
        { cx: 112, cy: 272 },
        { cx: 474, cy: 200, r: 4.3 },
        { cx: 474, cy: 400 },
        { cx: 474, cy: 520 },
        { cx: 474, cy: 640 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
  process: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 206 H 446",
        "M 112 282 H 348",
        "M 112 538 H 968",
        "M 304 538 V 842",
        "M 540 538 V 820",
        "M 776 538 V 828",
      ],
      nodes: [
        { cx: 112, cy: 206 },
        { cx: 112, cy: 282 },
        { cx: 112, cy: 538, r: 4.3 },
        { cx: 304, cy: 538 },
        { cx: 540, cy: 538 },
        { cx: 776, cy: 538 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
  contact: {
    desktop: {
      primary: ["M 112 0 V 1000"],
      secondary: [
        "M 112 216 H 462",
        "M 112 286 H 348",
        "M 462 216 V 742",
        "M 462 598 H 968",
        "M 462 736 H 968",
      ],
      nodes: [
        { cx: 112, cy: 216 },
        { cx: 112, cy: 286 },
        { cx: 462, cy: 216, r: 4.3 },
        { cx: 462, cy: 598 },
        { cx: 462, cy: 736, r: 4.3 },
      ],
    },
    mobile: mobileConstructionPaths,
  },
};

function SectionConstructionLines({ variant }: { variant: ConstructionVariant }) {
  const config = constructionPaths[variant];

  const renderSvg = (mode: "desktop" | "mobile") => {
    const paths = config[mode];
    return (
      <svg
        className={`${styles.constructionSvg} ${mode === "desktop" ? styles.constructionSvgDesktop : styles.constructionSvgMobile}`}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {paths.nodes.map(({ cx, cy, r = 3.2 }) => (
          <g key={`${mode}-node-${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={r * 1.9} className={styles.constructionNodeAura} data-construction-node-aura data-node-y={cy} />
            <circle cx={cx} cy={cy} r={r} className={styles.constructionNode} data-construction-node data-node-y={cy} />
          </g>
        ))}
        {paths.secondary.map((d) => (
          <g key={`${mode}-secondary-${d}`}>
            <path d={d} pathLength="1" className={styles.constructionChannel} data-construction-channel data-branch-y={getPathStartY(d)} />
            <path d={d} pathLength="1" className={styles.constructionSecondary} data-construction-secondary data-branch-y={getPathStartY(d)} />
            <path d={d} pathLength="1" className={styles.constructionPulseSoft} data-construction-pulse-soft data-path-role="secondary" data-branch-y={getPathStartY(d)} />
            <path d={d} pathLength="1" className={styles.constructionPulseHot} data-construction-pulse-hot data-path-role="secondary" data-branch-y={getPathStartY(d)} />
          </g>
        ))}
        {paths.primary.map((d) => (
          <g key={`${mode}-primary-${d}`}>
            <path d={d} pathLength="1" className={styles.constructionChannel} data-construction-channel data-path-role="primary" />
            <path d={d} pathLength="1" className={styles.constructionPrimary} data-construction-primary />
            <path d={d} pathLength="1" className={styles.constructionPulseSoft} data-construction-pulse-soft data-path-role="primary" />
            <path d={d} pathLength="1" className={styles.constructionPulseHot} data-construction-pulse-hot data-path-role="primary" />
          </g>
        ))}
      </svg>
    );
  };

  return <div className={styles.constructionLayer}>{renderSvg("desktop")}{renderSvg("mobile")}</div>;
}

function getPathStartY(path: string) {
  const match = path.match(/M\s*[-\d.]+\s+([\d.-]+)/i);
  return match ? Number(match[1]) : 0;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

const sectionTimingProfiles: Record<string, {
  activationOffset: number;
  frameStart: number;
  frameWindow: number;
  labelStart: number;
  labelWindow: number;
  titleStart: number;
  titleWindow: number;
  copyStart: number;
  copyWindow: number;
  detailStart: number;
  detailStep: number;
  detailWindow: number;
  visualStart: number;
  visualWindow: number;
  visualItemStart: number;
  visualItemStep: number;
  visualItemWindow: number;
  actionStart: number;
  actionStep: number;
  actionWindow: number;
}> = {
  hero: {
    activationOffset: 0.08,
    frameStart: 0.02,
    frameWindow: 0.11,
    labelStart: 0.05,
    labelWindow: 0.075,
    titleStart: 0.075,
    titleWindow: 0.09,
    copyStart: 0.115,
    copyWindow: 0.095,
    detailStart: 0.16,
    detailStep: 0.026,
    detailWindow: 0.09,
    visualStart: 0.2,
    visualWindow: 0.11,
    visualItemStart: 0.2,
    visualItemStep: 0.024,
    visualItemWindow: 0.095,
    actionStart: 0.28,
    actionStep: 0.03,
    actionWindow: 0.085,
  },
  introduction: {
    activationOffset: 0.34,
    frameStart: 0.01,
    frameWindow: 0.1,
    labelStart: 0.04,
    labelWindow: 0.07,
    titleStart: 0.06,
    titleWindow: 0.085,
    copyStart: 0.095,
    copyWindow: 0.09,
    detailStart: 0.15,
    detailStep: 0.025,
    detailWindow: 0.09,
    visualStart: 0.18,
    visualWindow: 0.1,
    visualItemStart: 0.18,
    visualItemStep: 0.024,
    visualItemWindow: 0.09,
    actionStart: 0.27,
    actionStep: 0.03,
    actionWindow: 0.08,
  },
  services: {
    activationOffset: 0.42,
    frameStart: 0,
    frameWindow: 0.1,
    labelStart: 0.03,
    labelWindow: 0.065,
    titleStart: 0.045,
    titleWindow: 0.08,
    copyStart: 0.08,
    copyWindow: 0.085,
    detailStart: 0.135,
    detailStep: 0.024,
    detailWindow: 0.085,
    visualStart: 0.155,
    visualWindow: 0.1,
    visualItemStart: 0.16,
    visualItemStep: 0.022,
    visualItemWindow: 0.09,
    actionStart: 0.235,
    actionStep: 0.03,
    actionWindow: 0.08,
  },
  work: {
    activationOffset: 0.34,
    frameStart: 0.01,
    frameWindow: 0.1,
    labelStart: 0.04,
    labelWindow: 0.07,
    titleStart: 0.055,
    titleWindow: 0.085,
    copyStart: 0.09,
    copyWindow: 0.09,
    detailStart: 0.15,
    detailStep: 0.025,
    detailWindow: 0.09,
    visualStart: 0.18,
    visualWindow: 0.1,
    visualItemStart: 0.18,
    visualItemStep: 0.024,
    visualItemWindow: 0.09,
    actionStart: 0.26,
    actionStep: 0.03,
    actionWindow: 0.08,
  },
  outcomes: {
    activationOffset: 0.3,
    frameStart: 0.01,
    frameWindow: 0.1,
    labelStart: 0.045,
    labelWindow: 0.07,
    titleStart: 0.06,
    titleWindow: 0.085,
    copyStart: 0.1,
    copyWindow: 0.09,
    detailStart: 0.16,
    detailStep: 0.024,
    detailWindow: 0.09,
    visualStart: 0.19,
    visualWindow: 0.1,
    visualItemStart: 0.19,
    visualItemStep: 0.022,
    visualItemWindow: 0.09,
    actionStart: 0.27,
    actionStep: 0.03,
    actionWindow: 0.08,
  },
  process: {
    activationOffset: 0.36,
    frameStart: 0.005,
    frameWindow: 0.1,
    labelStart: 0.035,
    labelWindow: 0.07,
    titleStart: 0.05,
    titleWindow: 0.082,
    copyStart: 0.085,
    copyWindow: 0.088,
    detailStart: 0.14,
    detailStep: 0.024,
    detailWindow: 0.088,
    visualStart: 0.165,
    visualWindow: 0.1,
    visualItemStart: 0.17,
    visualItemStep: 0.022,
    visualItemWindow: 0.09,
    actionStart: 0.24,
    actionStep: 0.03,
    actionWindow: 0.08,
  },
  contact: {
    activationOffset: 0.34,
    frameStart: 0.01,
    frameWindow: 0.1,
    labelStart: 0.04,
    labelWindow: 0.07,
    titleStart: 0.055,
    titleWindow: 0.085,
    copyStart: 0.09,
    copyWindow: 0.09,
    detailStart: 0.15,
    detailStep: 0.024,
    detailWindow: 0.09,
    visualStart: 0.18,
    visualWindow: 0.1,
    visualItemStart: 0.18,
    visualItemStep: 0.022,
    visualItemWindow: 0.09,
    actionStart: 0.235,
    actionStep: 0.028,
    actionWindow: 0.08,
  },
};

export function MaceDigitalHomepage() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-reveal-section]");

      const sectionData = sections.map((section) => {
        const frame = section.querySelector<HTMLElement>("[data-reveal-frame]");
        const label = section.querySelector<HTMLElement>("[data-reveal-label]");
        const title = section.querySelector<HTMLElement>("[data-reveal-title]");
        const copy = section.querySelector<HTMLElement>("[data-reveal-copy]");
        const visual = section.querySelector<HTMLElement>("[data-reveal-visual]");
        const action = section.querySelector<HTMLElement>("[data-reveal-action]");
        const primaryPaths = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll("[data-construction-primary]"));
        const secondaryPaths = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll("[data-construction-secondary]"));
        const pulseSoftPaths = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll("[data-construction-pulse-soft]"));
        const pulseHotPaths = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll("[data-construction-pulse-hot]"));
        const nodes = gsap.utils.toArray<SVGCircleElement>(section.querySelectorAll("[data-construction-node]"));
        const nodeAuras = gsap.utils.toArray<SVGCircleElement>(section.querySelectorAll("[data-construction-node-aura]"));
        const guideLines = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-guide-line], [data-connector-line]"));
        const blueprintPaths = gsap.utils.toArray<SVGPathElement>(section.querySelectorAll("[data-blueprint-path]"));
        const line = section.querySelector<HTMLElement>("[data-reveal-line]");
        const visualItems = gsap
          .utils.toArray<HTMLElement>(section.querySelectorAll("[data-reveal-visual-item]"))
          .filter((item) => item !== visual);
        const detailItems = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-reveal-detail]"));
        const actionItems = action ? gsap.utils.toArray<HTMLElement>(action.querySelectorAll("a, button")) : [];

        primaryPaths.forEach((path) => {
          gsap.set(path, { strokeDasharray: "0 1", strokeDashoffset: 0, opacity: 0.22 });
        });

        secondaryPaths.forEach((path) => {
          gsap.set(path, { strokeDasharray: "0 1", strokeDashoffset: 0, opacity: 0.16 });
        });

        pulseSoftPaths.forEach((path) => {
          gsap.set(path, { strokeDasharray: "0 1", strokeDashoffset: 1, opacity: 0 });
        });

        pulseHotPaths.forEach((path) => {
          gsap.set(path, { strokeDasharray: "0 1", strokeDashoffset: 1, opacity: 0 });
        });

        gsap.set(nodes, { opacity: 0.28, scale: 0.9, transformOrigin: "center center" });
        gsap.set(nodeAuras, { opacity: 0.06, scale: 0.84, transformOrigin: "center center" });
        gsap.set(guideLines, { scaleX: 0.08, opacity: 0.16, transformOrigin: "left center" });
        gsap.set(blueprintPaths, { strokeDasharray: "0 1", strokeDashoffset: 0, opacity: 0.08 });
        if (line) gsap.set(line, { scaleX: 0.14, opacity: 0.24, transformOrigin: "left center" });
        if (frame) gsap.set(frame, { opacity: 0.34, y: 14, filter: "brightness(0.68) saturate(0.84)" });
        if (label) gsap.set(label, { opacity: 0.16, y: 10, color: "rgba(255,255,255,0.22)" });
        if (title) gsap.set(title, { opacity: 0.08, y: 18, color: "rgba(245,247,251,0.28)", textShadow: "0 0 0 rgba(255,255,255,0)" });
        if (copy) gsap.set(copy, { opacity: 0.08, y: 16, color: "rgba(255,255,255,0.2)" });
        if (visual) gsap.set(visual, { opacity: 0.14, y: 16, filter: "brightness(0.48) saturate(0.72)" });
        gsap.set(visualItems, { opacity: 0.12, y: 16, filter: "brightness(0.5) saturate(0.72)" });
        gsap.set(detailItems, { opacity: 0.12, scaleX: 0.08, transformOrigin: "left center", filter: "brightness(0.7)" });
        if (actionItems.length) {
          gsap.set(actionItems, { opacity: 0.12, y: 10, filter: "brightness(0.56) saturate(0.78)", pointerEvents: "none" });
        } else if (action) {
          gsap.set(action, { opacity: 0.12, y: 10, filter: "brightness(0.56) saturate(0.78)", pointerEvents: "none" });
        }

        return {
          id: section.id,
          section,
          frame,
          label,
          title,
          copy,
          visual,
          action,
          primaryPaths,
          secondaryPaths,
          pulseSoftPaths,
          pulseHotPaths,
          nodes,
          nodeAuras,
          guideLines,
          blueprintPaths,
          line,
          visualItems,
          detailItems,
          actionItems,
          timing: sectionTimingProfiles[section.id] ?? sectionTimingProfiles.work,
          top: 0,
          height: 1,
          bottom: 1,
        };
      });

      const currentSoft = 0.09;
      const currentHot = 0.028;
      const branchWindow = 0.18;
      const nodeWindow = 0.05;
      const lead = 0.012;
      const contentLead = 0.014;

      const updateMetrics = () => {
        sectionData.forEach((item) => {
          item.top = item.section.offsetTop;
          item.height = item.section.offsetHeight;
          item.bottom = item.top + item.height;
        });
      };

      const paintPath = (path: SVGPathElement, progress: number, opacity: number) => {
        const safe = clamp01(progress);
        const visible = safe > 0.001;
        path.style.strokeDasharray = `${Math.max(safe, 0.0001)} 1`;
        path.style.strokeDashoffset = "0";
        path.style.opacity = visible ? `${opacity}` : "0";
      };

      const paintCurrent = (path: SVGPathElement, position: number, length: number, opacity: number) => {
        const p = clamp01(position);
        const seg = Math.max(0.0001, Math.min(length, 0.24));
        path.style.strokeDasharray = `${seg} 1`;
        path.style.strokeDashoffset = `${1 - p}`;
        path.style.opacity = p > 0.001 && p < 0.999 ? `${opacity}` : "0";
      };

      const powerStep = (progress: number, start: number, window: number) => clamp01((progress - start) / window);

      const updateNetwork = (progress: number) => {
        if (!sectionData.length) return;

        const first = sectionData[0];
        const last = sectionData[sectionData.length - 1];
        const networkStart = first.top;
        const networkEnd = last.bottom;
        const networkSpan = Math.max(1, networkEnd - networkStart);
        const travel = clamp01(progress + lead);
        const globalY = networkStart + networkSpan * travel;

        sectionData.forEach((item) => {
          const local = clamp01((globalY - item.top) / Math.max(item.height, 1));
          const sectionTravel = clamp01(local);
          const activationY = globalY + window.innerHeight * item.timing.activationOffset;
          const activationTravel = clamp01((activationY - item.top) / Math.max(item.height, 1));
          const contentTravel = clamp01(activationTravel - contentLead);

          item.primaryPaths.forEach((path) => {
            paintPath(path, sectionTravel, 0.94);
          });

          item.secondaryPaths.forEach((path) => {
            const branchY = Number(path.dataset.branchY || 0) / 1000;
            const branchProgress = clamp01((activationTravel - branchY) / branchWindow);
            paintPath(path, branchProgress, 0.72);
          });

          item.pulseSoftPaths.forEach((path) => {
            const role = path.dataset.pathRole;
            if (role === "primary") {
              paintCurrent(path, sectionTravel, currentSoft, 0.78);
            } else {
              const branchY = Number(path.dataset.branchY || 0) / 1000;
              const branchProgress = clamp01((activationTravel - branchY) / branchWindow);
              paintCurrent(path, branchProgress, currentSoft * 0.8, branchProgress > 0 ? 0.52 : 0);
            }
          });

          item.pulseHotPaths.forEach((path) => {
            const role = path.dataset.pathRole;
            if (role === "primary") {
              paintCurrent(path, sectionTravel, currentHot, 1);
            } else {
              const branchY = Number(path.dataset.branchY || 0) / 1000;
              const branchProgress = clamp01((activationTravel - branchY) / branchWindow);
              paintCurrent(path, branchProgress, currentHot * 0.92, branchProgress > 0 ? 0.82 : 0);
            }
          });

          item.nodes.forEach((node) => {
            const nodeY = Number(node.dataset.nodeY || 0) / 1000;
            const nodeProgress = clamp01((activationTravel - nodeY) / nodeWindow);
            node.style.opacity = `${0.22 + nodeProgress * 0.72}`;
            node.style.transform = `scale(${0.9 + nodeProgress * 0.16})`;
          });

          item.nodeAuras.forEach((node) => {
            const nodeY = Number(node.dataset.nodeY || 0) / 1000;
            const nodeProgress = clamp01((activationTravel - nodeY) / nodeWindow);
            node.style.opacity = `${0.04 + nodeProgress * 0.34}`;
            node.style.transform = `scale(${0.84 + nodeProgress * 0.36})`;
          });

          item.blueprintPaths.forEach((path, index) => {
            const branchProgress = clamp01((activationTravel - 0.3 - index * 0.028) / 0.3);
            paintPath(path, branchProgress, 0.52);
          });

          item.guideLines.forEach((lineEl, index) => {
            const guideProgress = clamp01((activationTravel - 0.26 - index * 0.04) / 0.26);
            lineEl.style.opacity = `${0.12 + guideProgress * 0.72}`;
            lineEl.style.transform = `scaleX(${0.08 + guideProgress * 0.92})`;
          });

          if (item.line) {
            const lineProgress = clamp01((activationTravel - 0.06) / 0.22);
            item.line.style.opacity = `${0.18 + lineProgress * 0.82}`;
            item.line.style.transform = `scaleX(${0.14 + lineProgress * 0.86})`;
            item.line.style.boxShadow = lineProgress > 0.02 ? "0 0 14px rgba(244, 247, 252, 0.16)" : "0 0 0 rgba(244, 247, 252, 0)";
          }

          const framePower = powerStep(contentTravel, item.timing.frameStart, item.timing.frameWindow);
          const labelPower = powerStep(contentTravel, item.timing.labelStart, item.timing.labelWindow);
          const titlePower = powerStep(contentTravel, item.timing.titleStart, item.timing.titleWindow);
          const copyPower = powerStep(contentTravel, item.timing.copyStart, item.timing.copyWindow);
          const visualPower = powerStep(contentTravel, item.timing.visualStart, item.timing.visualWindow);

          if (item.frame) {
            item.frame.style.opacity = `${0.34 + framePower * 0.66}`;
            item.frame.style.transform = `translate3d(0, ${14 - framePower * 14}px, 0)`;
            item.frame.style.filter = `brightness(${0.68 + framePower * 0.32}) saturate(${0.84 + framePower * 0.16})`;
          }

          if (item.label) {
            item.label.style.opacity = `${0.16 + labelPower * 0.84}`;
            item.label.style.transform = `translate3d(0, ${10 - labelPower * 10}px, 0)`;
            item.label.style.color = `rgba(255,255,255,${0.22 + labelPower * 0.4})`;
          }

          if (item.title) {
            item.title.style.opacity = `${0.08 + titlePower * 0.92}`;
            item.title.style.transform = `translate3d(0, ${18 - titlePower * 18}px, 0)`;
            item.title.style.color = `rgba(245,247,251,${0.28 + titlePower * 0.72})`;
            item.title.style.textShadow = titlePower > 0.05 ? `0 0 ${Math.round(titlePower * 18)}px rgba(244,247,252,${0.06 + titlePower * 0.06})` : "0 0 0 rgba(255,255,255,0)";
          }

          if (item.copy) {
            item.copy.style.opacity = `${0.08 + copyPower * 0.92}`;
            item.copy.style.transform = `translate3d(0, ${16 - copyPower * 16}px, 0)`;
            item.copy.style.color = `rgba(255,255,255,${0.2 + copyPower * 0.52})`;
          }

          item.detailItems.forEach((detail, index) => {
            const detailPower = powerStep(contentTravel, item.timing.detailStart + index * item.timing.detailStep, item.timing.detailWindow);
            detail.style.opacity = `${0.12 + detailPower * 0.88}`;
            detail.style.transform = `scaleX(${0.08 + detailPower * 0.92}) translate3d(0, ${10 - detailPower * 10}px, 0)`;
            detail.style.filter = `brightness(${0.7 + detailPower * 0.3})`;
          });

          if (item.visual) {
            item.visual.style.opacity = `${0.14 + visualPower * 0.86}`;
            item.visual.style.transform = `translate3d(0, ${16 - visualPower * 16}px, 0)`;
            item.visual.style.filter = `brightness(${0.48 + visualPower * 0.52}) saturate(${0.72 + visualPower * 0.28})`;
          }

          item.visualItems.forEach((visualItem, index) => {
            const itemPower = powerStep(contentTravel, item.timing.visualItemStart + index * item.timing.visualItemStep, item.timing.visualItemWindow);
            visualItem.style.opacity = `${0.12 + itemPower * 0.88}`;
            visualItem.style.transform = `translate3d(0, ${16 - itemPower * 16}px, 0)`;
            visualItem.style.filter = `brightness(${0.5 + itemPower * 0.5}) saturate(${0.72 + itemPower * 0.28})`;
          });

          const actionTargets = item.actionItems.length ? item.actionItems : item.action ? [item.action] : [];
          actionTargets.forEach((actionItem, index) => {
            const itemPower = powerStep(contentTravel, item.timing.actionStart + index * item.timing.actionStep, item.timing.actionWindow);
            actionItem.style.opacity = `${0.12 + itemPower * 0.88}`;
            actionItem.style.transform = `translate3d(0, ${10 - itemPower * 10}px, 0)`;
            actionItem.style.filter = `brightness(${0.56 + itemPower * 0.44}) saturate(${0.78 + itemPower * 0.22})`;
            actionItem.style.pointerEvents = itemPower > 0.92 ? "auto" : "none";
          });
        });
      };

      updateMetrics();

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.08,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          updateMetrics();
          updateNetwork(self.progress);
        },
        onUpdate: (self) => {
          updateNetwork(self.progress);
        },
      });

      updateNetwork(trigger.progress);

      const refresh = () => {
        updateMetrics();
        ScrollTrigger.refresh();
      };
      const delayedRefresh = window.setTimeout(refresh, 120);

      window.addEventListener("load", refresh);
      window.addEventListener("resize", refresh);
      window.addEventListener("pageshow", refresh);
      document.fonts?.ready.then(refresh).catch(() => undefined);

      const assets = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
      assets.forEach((asset) => {
        if (!asset.complete) {
          asset.addEventListener("load", refresh, { once: true });
          asset.addEventListener("error", refresh, { once: true });
        }
      });

      return () => {
        window.clearTimeout(delayedRefresh);
        window.removeEventListener("load", refresh);
        window.removeEventListener("resize", refresh);
        window.removeEventListener("pageshow", refresh);
        assets.forEach((asset) => {
          asset.removeEventListener("load", refresh);
          asset.removeEventListener("error", refresh);
        });
        trigger.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = pageRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lightSurfaces = Array.from(root.querySelectorAll<HTMLElement>("[data-light-surface]"));
    const magneticTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]"));

    const onSurfaceMove = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const pointer = event as PointerEvent;
      const rect = target.getBoundingClientRect();
      const x = ((pointer.clientX - rect.left) / rect.width) * 100;
      const y = ((pointer.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
      target.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
      target.style.setProperty("--pointer-opacity", "1");
    };

    const resetSurface = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      target.style.setProperty("--pointer-x", "50%");
      target.style.setProperty("--pointer-y", "50%");
      target.style.setProperty("--pointer-opacity", "0");
    };

    const onMagneticMove = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const pointer = event as PointerEvent;
      const rect = target.getBoundingClientRect();
      const x = (pointer.clientX - rect.left) / rect.width - 0.5;
      const y = (pointer.clientY - rect.top) / rect.height - 0.5;
      gsap.to(target, {
        x: x * 8,
        y: y * 8,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const resetMagnetic = (event: Event) => {
      gsap.to(event.currentTarget as HTMLElement, {
        x: 0,
        y: 0,
        duration: 0.34,
        ease: "power3.out",
        overwrite: true,
      });
    };

    lightSurfaces.forEach((surface) => {
      surface.style.setProperty("--pointer-x", "50%");
      surface.style.setProperty("--pointer-y", "50%");
      surface.style.setProperty("--pointer-opacity", "0");
      surface.addEventListener("pointermove", onSurfaceMove);
      surface.addEventListener("pointerleave", resetSurface);
    });

    magneticTargets.forEach((target) => {
      target.addEventListener("pointermove", onMagneticMove);
      target.addEventListener("pointerleave", resetMagnetic);
    });

    return () => {
      lightSurfaces.forEach((surface) => {
        surface.removeEventListener("pointermove", onSurfaceMove);
        surface.removeEventListener("pointerleave", resetSurface);
      });

      magneticTargets.forEach((target) => {
        target.removeEventListener("pointermove", onMagneticMove);
        target.removeEventListener("pointerleave", resetMagnetic);
      });
    };
  }, []);

  return (
    <main ref={pageRef} className={styles.page}>
      <div className={styles.backgroundGrid} aria-hidden="true" />
      <div className={styles.backgroundGlow} aria-hidden="true" />

      <header className={styles.topbar}>
        <a href="#hero" className={styles.brandLockup}>
          <span className={styles.brandTag}>Mace Digital</span>
          <strong className={styles.brandWord}>Mace</strong>
        </a>
        <nav className={styles.nav}>
          <a href="#services"><span>01</span><strong>Services</strong></a>
          <a href="#work"><span>02</span><strong>Work</strong></a>
          <a href="#process"><span>03</span><strong>Process</strong></a>
          <a href="#contact"><span>04</span><strong>Contact</strong></a>
        </nav>
        <a href="#contact" className={styles.topbarCta} data-magnetic data-light-surface><span>Open channel</span><strong>Strategy call</strong></a>
      </header>

      <section id="hero" className={`${styles.section} ${styles.heroSection}`} data-reveal-section>
        <SectionConstructionLines variant="hero" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.heroFrame}`} data-reveal-frame>
          <div className={styles.heroCopy}>
            <span className={styles.sectionLabel} data-reveal-label>Hero</span>
            <h1 className={styles.heroTitle} data-reveal-title>
              Websites and automation systems engineered to make premium businesses feel sharper, faster, and more trusted.
            </h1>
            <p className={styles.heroBody} data-reveal-copy>
              Mace Digital builds high-trust websites, enquiry systems, booking flows, CRM connections, and follow-up automations that operate as one business machine instead of disconnected tools.
            </p>
            <div className={styles.heroActions} data-reveal-action>
              <a href="#services" className={styles.primaryButton} data-magnetic data-light-surface><span>Follow</span><strong>The system power-on</strong></a>
              <a href="#work" className={styles.secondaryButton} data-magnetic data-light-surface><span>Inspect</span><strong>Connected work</strong></a>
            </div>
          </div>

          <div className={styles.heroVisual} data-reveal-visual>
            <div className={styles.wordmarkMonolith} data-reveal-visual-item data-light-surface>
              <div className={styles.wordmarkHeader} data-reveal-detail>
                <span>machined identity</span>
                <span>brushed aluminium wordmark</span>
              </div>
              <div className={styles.wordmarkDisplay} data-engraved-wordmark>Mace</div>
              <div className={styles.wordmarkBase} data-reveal-detail />
            </div>
            <div className={styles.heroStatRail}>
              <div className={styles.metricCard} data-reveal-visual-item data-light-surface>
                <span>Build focus</span>
                <strong>Websites + AI automation</strong>
              </div>
              <div className={styles.metricCard} data-reveal-visual-item data-light-surface>
                <span>Commercial role</span>
                <strong>Trust, enquiries, operations</strong>
              </div>
              <div className={styles.metricCard} data-reveal-visual-item data-light-surface>
                <span>Delivery style</span>
                <strong>Premium, clear, engineered</strong>
              </div>
            </div>
            <div className={styles.heroSignalStrip} data-reveal-visual-item>
              <div className={styles.signalCell} data-light-surface>
                <span>Signal path</span>
                <strong>Impression → enquiry → response</strong>
              </div>
              <div className={styles.signalCell} data-light-surface>
                <span>Surface logic</span>
                <strong>Machined, calm, high-trust</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="introduction" className={styles.section} data-reveal-section>
        <SectionConstructionLines variant="intro" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.introFrame}`} data-reveal-frame>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionLabel} data-reveal-label>Introduction</span>
            <h2 className={styles.sectionTitle} data-reveal-title>
              The website should not stop at presentation. It should organise how the business responds after someone raises a hand.
            </h2>
          </div>
          <div className={styles.introManifesto} data-reveal-visual>
            <p className={styles.sectionBody} data-reveal-copy>
              That means the first impression, the enquiry path, the booking logic, the CRM handoff, and the follow-up sequence all need to feel like parts of the same system. The homepage now unfolds as one conductive build instead of stacking isolated website sections.
            </p>
            <div className={`${styles.editorialPanel} ${styles.splitPanel}`} data-reveal-visual-item data-light-surface>
              <div className={styles.editorialLine} data-reveal-detail />
              <p>
                Clear hierarchy first. Mechanical polish second. No hidden content, no dead scroll zones, and no decorative sequence that leaves the visitor staring at a blank screen.
              </p>
            </div>
            <div className={styles.introCalibration} data-reveal-visual-item data-light-surface>
              <span>Calibration</span>
              <strong>Every visible surface must justify its place in the system.</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className={styles.section} data-reveal-section>
        <SectionConstructionLines variant="services" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.systemSectionFrame}`} data-reveal-frame>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionLabel} data-reveal-label>Services</span>
            <h2 className={styles.sectionTitle} data-reveal-title>What Mace Digital builds</h2>
            <p className={styles.sectionBody} data-reveal-copy>
              Each delivery combines positioning, front-end trust, and practical operations. The result is not just a prettier site — it is a business system that moves from attention to response cleanly.
            </p>
          </div>
          <div className={styles.serviceGrid} data-reveal-visual>
            {services.map((service) => (
              <article key={service.title} className={styles.serviceCard} data-reveal-visual-item data-light-surface>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </article>
            ))}
          </div>

          <div className={styles.inlineSystemStage} data-reveal-visual data-reveal-visual-item data-light-surface>
            <div className={styles.workshopGlow} />
            <div className={styles.workshopBlueprintField}>
              <span className={styles.workshopGuideHorizontal} data-guide-line />
              <span className={styles.workshopGuideVertical} data-guide-line />
              <span className={styles.workshopGuideVerticalAlt} data-guide-line />
              <svg className={styles.workshopBlueprintSvg} viewBox="0 0 900 560" aria-hidden="true">
                <path data-blueprint-path d="M72 116 H406" pathLength="1" />
                <path data-blueprint-path d="M72 154 H438" pathLength="1" />
                <path data-blueprint-path d="M72 192 H352" pathLength="1" />
                <path data-blueprint-path d="M84 240 H428 V468 H84 Z" pathLength="1" />
                <path data-blueprint-path d="M114 276 H398" pathLength="1" />
                <path data-blueprint-path d="M114 318 H364" pathLength="1" />
                <path data-blueprint-path d="M114 352 H330" pathLength="1" />
                <path data-blueprint-path d="M486 170 H816 V468 H486 Z" pathLength="1" />
                <path data-blueprint-path d="M520 212 H782" pathLength="1" />
                <path data-blueprint-path d="M520 258 H752" pathLength="1" />
                <path data-blueprint-path d="M520 304 H734" pathLength="1" />
                <path data-blueprint-path d="M428 352 H486" pathLength="1" />
                <path data-blueprint-path d="M428 420 H486" pathLength="1" />
              </svg>
            </div>

            <div className={styles.inlineSystemHeader}>
              <span className={styles.cardIndex} data-reveal-detail>Powered system flow</span>
              <p className={styles.inlineSystemCopy} data-reveal-copy>
                The same conductive pathway that powers the homepage also powers the product: website, enquiry capture, assistant routing, booking, CRM, follow-up, and analytics.
              </p>
            </div>

            <div className={styles.workshopPrimaryRow}>
              <div className={styles.workshopWebsite} data-reveal-visual-item data-interface-frame data-light-surface>
                <div className={styles.workshopWebsiteChrome}>
                  <div className={styles.workshopWebsiteDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.workshopWebsiteMeta}>Continuous build / live system</div>
                </div>

                <div className={styles.workshopWebsiteNav}>
                  <span data-interface-bar>Home</span>
                  <span data-interface-bar>Services</span>
                  <span data-interface-bar>Consultation</span>
                </div>

                <div className={styles.workshopWebsiteBody}>
                  <div className={styles.workshopWebsiteCopy}>
                    <div className={styles.workshopKicker} data-interface-bar>Premium business website</div>
                    <h3 className={styles.workshopInterfaceHeadline} data-interface-headline>
                      Clarify the offer. Build trust quickly. Make the next step obvious.
                    </h3>
                    <p className={styles.workshopInterfaceText} data-interface-bar>
                      The interface forms as the pathway energises it, then hands the visitor directly into the next operational layer.
                    </p>
                    <div className={styles.workshopInterfaceCta} data-interface-cta data-magnetic data-light-surface>
                      Book a consultation
                    </div>
                  </div>

                  <div className={styles.workshopInterfaceMedia} data-interface-media>
                    <div className={styles.workshopMediaSurface} />
                    <div className={styles.workshopMediaCaption}>Imagery and proof lock into position</div>
                  </div>
                </div>

                <div className={styles.workshopEnquiryCard} data-reveal-visual-item data-light-surface>
                  <span>Customer enquiry</span>
                  <strong>“I would like to book a consultation for Thursday.”</strong>
                  <p>Website enquiry captured and routed into the active system.</p>
                </div>
              </div>

              <div className={styles.workshopSystemsColumn}>
                <article className={styles.workshopSystemCard} data-reveal-visual-item data-light-surface>
                  <span>AI assistant</span>
                  <strong>Thursday consultation requested</strong>
                  <p>Understood. Confirming the right time and preparing the booking.</p>
                </article>

                <div className={styles.workshopConnector} data-connector-line />

                <article className={styles.workshopSystemCard} data-reveal-visual-item data-light-surface>
                  <span>Booking panel</span>
                  <strong>Consultation confirmed</strong>
                  <p>Thursday / 2:30 PM secured and added to the calendar.</p>
                </article>

                <div className={styles.workshopConnector} data-connector-line />

                <article className={styles.workshopSystemCard} data-reveal-visual-item data-light-surface>
                  <span>CRM record</span>
                  <strong>Customer profile created</strong>
                  <p>Name, enquiry source, service interest, booking time, and notes stored automatically.</p>
                </article>
              </div>
            </div>

            <div className={styles.workshopOperationsRow}>
              <article className={styles.workshopMiniCard} data-reveal-visual-item data-light-surface>
                <span>Follow-up</span>
                <strong>Confirmation and review request scheduled</strong>
                <p>Next-step email and post-consultation review workflow queued.</p>
              </article>

              <article className={styles.workshopMiniCard} data-reveal-visual-item data-light-surface>
                <span>Analytics</span>
                <strong>Conversion summary active</strong>
                <p>Enquiry source, booking conversion, and response timing now measurable.</p>
              </article>
            </div>

            <div className={styles.workshopFooterRail}>
              {workshopSteps.map((step, index) => (
                <div key={step} className={styles.timelineStep} data-reveal-visual-item data-light-surface>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>

            <p className={styles.workshopCaption} data-reveal-title>
              One connected system, built around your business.
            </p>
          </div>
        </div>
      </section>

      <section id="work" className={styles.section} data-reveal-section>
        <SectionConstructionLines variant="work" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.workFrame}`} data-reveal-frame>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionLabel} data-reveal-label>Selected work</span>
            <h2 className={styles.sectionTitle} data-reveal-title>Built for businesses that need the site to sell, not just exist.</h2>
            <p className={styles.sectionBody} data-reveal-copy>
              The work focus is commercial clarity: stronger positioning, a sharper first impression, and cleaner handoff into the systems that run after the visitor gets in touch.
            </p>
          </div>
          <div className={styles.caseStudyRail} data-reveal-visual>
            {selectedWork.map((item, index) => (
              <article key={item.title} className={styles.caseStudyCard} data-reveal-visual-item data-case-study-index={index + 1} data-light-surface>
                <div className={`${styles.caseStudyVisual} ${styles.specimenBay}`} data-reveal-detail />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="outcomes" className={styles.section} data-reveal-section>
        <SectionConstructionLines variant="outcomes" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.outcomesFrame}`} data-reveal-frame>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionLabel} data-reveal-label>Business outcomes</span>
            <h2 className={styles.sectionTitle} data-reveal-title>What changes when the website and response system work together</h2>
            <p className={styles.sectionBody} data-reveal-copy>
              The visitor gets a stronger first impression, the business gets cleaner information, and the follow-up no longer depends on someone manually stitching tools together behind the scenes.
            </p>
          </div>
          <div className={styles.outcomesPanel} data-reveal-visual data-light-surface>
            {outcomes.map((outcome, index) => (
              <div key={outcome} className={styles.outcomeRow} data-reveal-visual-item>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong data-engraved-copy>{outcome}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className={styles.section} data-reveal-section>
        <SectionConstructionLines variant="process" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.processFrame}`} data-reveal-frame>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionLabel} data-reveal-label>Process</span>
            <h2 className={styles.sectionTitle} data-reveal-title>How the engagement moves from diagnosis to launch</h2>
            <p className={styles.sectionBody} data-reveal-copy>
              The process is structured to stop the homepage from becoming decoration detached from the business. Strategy, system design, build, and refinement stay connected all the way through.
            </p>
          </div>
          <div className={styles.processGrid} data-reveal-visual>
            {processSteps.map((item) => (
              <article key={item.step} className={styles.processCard} data-reveal-visual-item data-light-surface>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={`${styles.section} ${styles.ctaSection}`} data-reveal-section>
        <SectionConstructionLines variant="contact" />
        <div className={styles.sectionRail} data-reveal-line />
        <div className={`${styles.sectionFrame} ${styles.ctaFrame} ${styles.contactFrame}`} data-reveal-frame>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionLabel} data-reveal-label>Final CTA</span>
            <h2 className={styles.sectionTitle} data-reveal-title>When the business needs a sharper first impression and a better response system, build both together.</h2>
            <p className={styles.sectionBody} data-reveal-copy>
              Mace Digital is for businesses that want the site to look premium, explain value clearly, and push real operational work forward after the enquiry arrives.
            </p>
          </div>
          <div className={styles.ctaActions} data-reveal-action>
            <a href="mailto:hello@macedigital.co" className={styles.primaryButton} data-magnetic data-light-surface><span>Transmit</span><strong>hello@macedigital.co</strong></a>
            <a href="#hero" className={styles.secondaryButton} data-magnetic data-light-surface><span>Reset</span><strong>Back to top</strong></a>
          </div>
        </div>
      </section>
    </main>
  );
}
