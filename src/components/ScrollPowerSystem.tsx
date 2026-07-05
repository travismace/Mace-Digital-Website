const sections = [
  {
    key: "hero",
    index: "01",
    eyebrow: "System ignition",
    title: "Mace Digital",
    body: "We build premium websites and AI automations that help businesses grow.",
    button: "Start Your Project",
    className: "power-module--hero",
    icon: "Core",
  },
  {
    key: "problem",
    index: "02",
    eyebrow: "Fault detection",
    title: "Most businesses lose customers through slow websites, missed messages, and manual systems.",
    body: "Leads leak out when the machine is slow to respond, poorly connected, or forced through too many manual steps.",
    button: "See the Problem",
    className: "power-module--problem",
    icon: "Fault",
  },
  {
    key: "solution",
    index: "03",
    eyebrow: "Power routing",
    title: "We connect your website, enquiries, bookings, follow-ups, and customer data into one intelligent system.",
    body: "One structured cable run powers the front-end experience, the lead flow, and the automation behind it.",
    button: "View Solutions",
    className: "power-module--solution",
    icon: "Route",
  },
  {
    key: "web",
    index: "04",
    eyebrow: "Web development module",
    title: "High-converting websites built to look premium, load fast, and turn visitors into customers.",
    body: "Built with sharp design, reliable performance, and conversion-first structure.",
    button: "Web Development",
    className: "power-module--web",
    icon: "Web",
  },
  {
    key: "ai",
    index: "05",
    eyebrow: "Automation module",
    title: "AI systems that answer enquiries, capture leads, send follow-ups, and save hours every week.",
    body: "A digital operator that keeps your enquiries moving even when your team is offline.",
    button: "AI Automation",
    className: "power-module--ai",
    icon: "AI",
  },
  {
    key: "results",
    index: "06",
    eyebrow: "Output signal",
    title: "More leads. Faster responses. Better customer journeys. Less manual work.",
    body: "The result is a business system that feels switched on from the first click to the final follow-up.",
    button: "Our Results",
    className: "power-module--results",
    icon: "Gain",
  },
  {
    key: "final",
    index: "07",
    eyebrow: "Final activation",
    title: "Ready to power up your business?",
    body: "When the full system is connected, growth stops depending on luck and starts running like infrastructure.",
    button: "Book a Free Digital Growth Call",
    className: "power-module--final",
    icon: "Live",
  },
] as const;

const enhancementScript = `
(() => {
  const section = document.querySelector('.power-machine');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothStep = (start, end, value) => {
    if (start === end) return value >= end ? 1 : 0;
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };
  const buttonPulse = (progress, start, end) => {
    const fadeIn = smoothStep(start, start + 0.035, progress);
    const fadeOut = 1 - smoothStep(end - 0.035, end, progress);
    return clamp(fadeIn * fadeOut);
  };
  const setDash = (node, amount) => {
    if (!node) return;
    node.style.strokeDashoffset = String(1 - clamp(amount));
    node.style.opacity = String(0.18 + clamp(amount) * 0.82);
  };

  section.classList.add('is-enhanced');

  const modules = [...section.querySelectorAll('.power-module')];
  const buttons = [...section.querySelectorAll('.power-button')];
  const legend = section.querySelector('.power-legend');
  const rail = section.querySelector('.power-machine__brand-rail');
  const current = section.querySelector('.power-cable__current');
  const branchA = section.querySelector('.power-cable__branch--a');
  const branchB = section.querySelector('.power-cable__branch--b');
  const branchC = section.querySelector('.power-cable__branch--c');
  const connectors = [...section.querySelectorAll('.power-cable__connector')];
  const sparks = [...section.querySelectorAll('.power-cable__spark')];

  const moduleRanges = [
    { start: 0.0, end: 0.18 },
    { start: 0.12, end: 0.28 },
    { start: 0.26, end: 0.42 },
    { start: 0.4, end: 0.56 },
    { start: 0.54, end: 0.7 },
    { start: 0.68, end: 0.84 },
    { start: 0.78, end: 1.0 },
  ];
  const buttonRanges = [
    { start: 0.04, end: 0.16, persist: false },
    { start: 0.18, end: 0.3, persist: false },
    { start: 0.32, end: 0.44, persist: false },
    { start: 0.46, end: 0.58, persist: false },
    { start: 0.6, end: 0.72, persist: false },
    { start: 0.74, end: 0.86, persist: false },
    { start: 0.82, end: 1.0, persist: true },
  ];

  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / total);
    section.style.setProperty('--power-progress', progress.toFixed(4));

    if (rail) {
      const glow = smoothStep(0, 1, progress);
      rail.style.boxShadow = '0 0 0 1px rgba(180, 220, 255, ' + (0.03 + glow * 0.05) + '), 0 0 ' + (18 + glow * 22) + 'px rgba(74, 185, 255, ' + (0.07 + glow * 0.08) + ')';
    }

    const isMobile = window.innerWidth <= 640;

    modules.forEach((module, index) => {
      const range = moduleRanges[index];
      const reveal = smoothStep(range.start, range.start + 0.05, progress);
      const dim = smoothStep(range.end - 0.04, range.end, progress);
      const isFinal = index === modules.length - 1;
      const lateFocus = smoothStep(0.8, 0.92, progress);
      const opacity = isFinal
        ? reveal
        : clamp(reveal * (1 - dim) + 0.06 * dim) * (1 - lateFocus * 0.72);
      const y = isFinal
        ? 42 * (1 - reveal)
        : 34 * (1 - reveal) - 14 * dim - 10 * lateFocus;
      const scale = isFinal ? 0.96 + reveal * 0.04 : 0.975 + reveal * 0.025;
      const glow = isFinal ? reveal : clamp(reveal - dim * 0.45);
      module.style.opacity = String(opacity);
      module.style.transform = isFinal
        ? (isMobile
            ? 'translate3d(0,' + y + 'px,0) scale(' + scale + ')'
            : 'translateX(-50%) translate3d(0,' + y + 'px,0) scale(' + scale + ')')
        : 'translate3d(0,' + y + 'px,0) scale(' + scale + ')';
      module.style.borderColor = 'rgba(145, 188, 240, ' + (isFinal ? 0.18 + glow * 0.32 : 0.14 + glow * 0.18) + ')';
      module.style.boxShadow = isFinal
        ? 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(158,196,235,' + (0.06 + glow * 0.12) + '), 0 22px 100px rgba(0,0,0,0.45), 0 0 ' + (28 + glow * 34) + 'px rgba(66,174,255,' + (glow * 0.18) + ')'
        : 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(158,196,235,' + (0.03 + glow * 0.08) + '), 0 18px 80px rgba(0,0,0,0.38), 0 0 ' + (18 + glow * 18) + 'px rgba(48,133,201,' + (glow * 0.08) + ')';
      module.style.filter = isFinal ? 'saturate(' + (0.9 + reveal * 0.35) + ')' : 'saturate(' + (0.82 + reveal * 0.2) + ')';
      const title = module.querySelector('.power-module__title');
      if (title) {
        title.style.textShadow = glow > 0.15
          ? '0 0 ' + (isFinal ? 18 + glow * 24 : 10 + glow * 18) + 'px rgba(130, 223, 255, ' + (isFinal ? glow * 0.34 : glow * 0.28) + ')'
          : 'none';
      }
    });

    buttons.forEach((button, index) => {
      const range = buttonRanges[index];
      const active = range.persist
        ? smoothStep(range.start, Math.min(range.end, range.start + 0.05), progress)
        : buttonPulse(progress, range.start, range.end);
      const y = 16 * (1 - active) - 8 * Math.max(0, progress - range.end);
      button.style.opacity = String(active);
      button.style.transform = 'translate3d(0,' + y + 'px,0)';
      button.style.pointerEvents = active > 0.55 ? 'auto' : 'none';
      button.style.boxShadow = active > 0
        ? 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 0 ' + (active * 6) + 'px rgba(74,185,255,' + (active * 0.08) + '), 0 10px 34px rgba(38,120,182,' + (0.18 + active * 0.16) + ')'
        : 'none';
    });

    if (legend) {
      const active = smoothStep(0.34, 0.45, progress) * (1 - smoothStep(0.76, 0.88, progress));
      legend.style.opacity = String(active);
      legend.style.transform = 'translate(-50%, calc(-50% + ' + ((1 - active) * 20) + 'px))';
    }

    setDash(current, smoothStep(0, 0.92, progress));
    setDash(branchA, smoothStep(0.18, 0.3, progress));
    setDash(branchB, smoothStep(0.42, 0.56, progress));
    setDash(branchC, smoothStep(0.62, 0.76, progress));

    connectors.forEach((connector, index) => {
      const start = [0.02, 0.18, 0.38, 0.56, 0.72, 0.88][index] || 0;
      const lock = smoothStep(start, start + 0.06, progress);
      connector.style.opacity = String(0.2 + lock * 0.8);
      connector.style.transform = 'scale(' + (0.9 + lock * 0.1) + ')';
    });

    sparks.forEach((spark, index) => {
      const start = [0.2, 0.46, 0.66][index] || 0;
      const hit = buttonPulse(progress, start, start + 0.08);
      spark.style.opacity = String(hit);
      spark.style.transform = 'scale(' + (0.5 + hit * 1.5) + ')';
    });
  };

  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
`;

export function ScrollPowerSystem() {
  return (
    <section className="power-machine" aria-labelledby="power-machine-title">
      <div className="power-machine__sticky">
        <div className="power-machine__scanlines" aria-hidden="true" />
        <div className="power-machine__backplate" aria-hidden="true" />
        <div className="power-machine__brand-rail" aria-hidden="true">
          <span>Mace Digital</span>
          <span>Powering websites + automation</span>
        </div>

        <svg
          className="power-cable"
          viewBox="0 0 1400 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="connectorMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eef6ff" />
              <stop offset="18%" stopColor="#7b8ca5" />
              <stop offset="48%" stopColor="#c7d2df" />
              <stop offset="74%" stopColor="#5c6980" />
              <stop offset="100%" stopColor="#edf6ff" />
            </linearGradient>
            <linearGradient id="cableSkin" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#11151d" />
              <stop offset="35%" stopColor="#202735" />
              <stop offset="70%" stopColor="#171d28" />
              <stop offset="100%" stopColor="#0e1218" />
            </linearGradient>
            <linearGradient id="currentGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3cb6ff" />
              <stop offset="35%" stopColor="#9ef8ff" />
              <stop offset="72%" stopColor="#56c5ff" />
              <stop offset="100%" stopColor="#89a3ff" />
            </linearGradient>
            <filter id="electricBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0.42  0 0 1 0 0.88  0 0 0 1 0"
              />
            </filter>
            <filter id="microBloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0.58  0 0 1 0 1  0 0 0 1 0"
              />
            </filter>
          </defs>

          <path
            className="power-cable__shadow"
            d="M112 132 C262 132 300 212 368 254 C468 316 554 302 656 388 C742 460 748 585 852 628 C953 670 1080 615 1186 700 C1254 754 1281 824 1316 878"
          />
          <path
            className="power-cable__outer"
            d="M112 132 C262 132 300 212 368 254 C468 316 554 302 656 388 C742 460 748 585 852 628 C953 670 1080 615 1186 700 C1254 754 1281 824 1316 878"
          />
          <path
            className="power-cable__inner"
            d="M112 132 C262 132 300 212 368 254 C468 316 554 302 656 388 C742 460 748 585 852 628 C953 670 1080 615 1186 700 C1254 754 1281 824 1316 878"
          />
          <path
            className="power-cable__current"
            d="M112 132 C262 132 300 212 368 254 C468 316 554 302 656 388 C742 460 748 585 852 628 C953 670 1080 615 1186 700 C1254 754 1281 824 1316 878"
            pathLength={1}
          />

          <path
            className="power-cable__branch power-cable__branch--a"
            d="M366 254 C307 315 268 365 228 430"
            pathLength={1}
          />
          <path
            className="power-cable__branch power-cable__branch--b"
            d="M654 388 C590 448 540 512 510 592"
            pathLength={1}
          />
          <path
            className="power-cable__branch power-cable__branch--c"
            d="M852 628 C920 564 1000 514 1089 486"
            pathLength={1}
          />

          <g className="power-cable__connector power-cable__connector--1">
            <circle cx="112" cy="132" r="28" />
            <circle cx="112" cy="132" r="13" className="power-cable__connector-core" />
          </g>
          <g className="power-cable__connector power-cable__connector--2">
            <circle cx="368" cy="254" r="26" />
            <circle cx="368" cy="254" r="11" className="power-cable__connector-core" />
          </g>
          <g className="power-cable__connector power-cable__connector--3">
            <circle cx="656" cy="388" r="26" />
            <circle cx="656" cy="388" r="11" className="power-cable__connector-core" />
          </g>
          <g className="power-cable__connector power-cable__connector--4">
            <circle cx="852" cy="628" r="26" />
            <circle cx="852" cy="628" r="11" className="power-cable__connector-core" />
          </g>
          <g className="power-cable__connector power-cable__connector--5">
            <circle cx="1186" cy="700" r="26" />
            <circle cx="1186" cy="700" r="11" className="power-cable__connector-core" />
          </g>
          <g className="power-cable__connector power-cable__connector--6">
            <circle cx="1316" cy="878" r="32" />
            <circle cx="1316" cy="878" r="14" className="power-cable__connector-core" />
          </g>

          <circle cx="228" cy="430" r="6" className="power-cable__spark power-cable__spark--a" filter="url(#microBloom)" />
          <circle cx="510" cy="592" r="6" className="power-cable__spark power-cable__spark--b" filter="url(#microBloom)" />
          <circle cx="1089" cy="486" r="6" className="power-cable__spark power-cable__spark--c" filter="url(#microBloom)" />
        </svg>

        <div className="power-stage">
          {sections.map((section) => (
            <article key={section.key} className={`power-module ${section.className}`}>
              <div className="power-module__topline">
                <span className="power-module__index">{section.index}</span>
                <span className="power-module__icon">{section.icon}</span>
              </div>
              <p className="power-module__eyebrow">{section.eyebrow}</p>
              {section.key === "hero" ? (
                <h1 id="power-machine-title" className="power-module__title">
                  {section.title}
                </h1>
              ) : (
                <h2 className="power-module__title">{section.title}</h2>
              )}
              <p className="power-module__body">{section.body}</p>
              <a href="#" className="power-button">
                <span>{section.button}</span>
              </a>
            </article>
          ))}

          <aside className="power-legend" aria-label="Powered systems">
            <p className="power-legend__label">System stack</p>
            <ul>
              <li>Website</li>
              <li>Enquiries</li>
              <li>Bookings</li>
              <li>CRM</li>
              <li>Follow-up</li>
            </ul>
          </aside>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: enhancementScript }} />
    </section>
  );
}
