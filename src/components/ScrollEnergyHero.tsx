type ServiceCard = {
  title: string;
  className: string;
};

type BranchNode = {
  label: string;
  className: string;
  x: number;
  y: number;
};

const serviceCards: ServiceCard[] = [
  { title: "Premium Website Design", className: "service-card--1" },
  { title: "AI WhatsApp Assistants", className: "service-card--2" },
  { title: "Booking & Reservation Systems", className: "service-card--3" },
  { title: "Website Audits", className: "service-card--4" },
  { title: "Customer Retention Systems", className: "service-card--5" },
  { title: "CRM & Business Automation", className: "service-card--6" },
];

const branchNodes: BranchNode[] = [
  { label: "Enquiries", className: "energy-node--1", x: 38, y: 28 },
  { label: "Bookings", className: "energy-node--2", x: 76, y: 24 },
  { label: "Customers", className: "energy-node--3", x: 78, y: 76 },
  { label: "Automation", className: "energy-node--4", x: 51, y: 20 },
  { label: "Growth", className: "energy-node--5", x: 33, y: 72 },
];

export function ScrollEnergyHero() {
  return (
    <section className="energy-hero" aria-labelledby="energy-hero-title">
      <div className="energy-hero__sticky">
        <div className="energy-hero__noise" aria-hidden="true" />
        <div className="energy-hero__ambient" aria-hidden="true" />

        <div className="energy-hero__brand">Mace Digital</div>

        <svg
          className="energy-network"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="energyGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0.3  0 0 1 0 0.75  0 0 0 1 0"
              />
            </filter>
            <filter id="energyPulseGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0.5  0 0 1 0 0.95  0 0 0 1 0"
              />
            </filter>
            <linearGradient id="energyStroke" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ecbff" />
              <stop offset="55%" stopColor="#8ff7ff" />
              <stop offset="100%" stopColor="#9d6bff" />
            </linearGradient>
          </defs>

          <path
            className="energy-network__track"
            d="M90 820 C170 770 205 690 252 608 C307 512 400 418 510 468 C598 508 654 612 739 552 C836 484 870 332 928 216"
          />
          <path
            className="energy-network__track energy-network__track--branch"
            d="M468 454 C428 380 384 327 330 278"
          />
          <path
            className="energy-network__track energy-network__track--branch"
            d="M734 552 C788 604 828 670 840 744"
          />

          <path
            className="energy-network__wire energy-network__wire--main"
            d="M90 820 C170 770 205 690 252 608 C307 512 400 418 510 468 C598 508 654 612 739 552 C836 484 870 332 928 216"
            pathLength={1}
          />
          <path
            className="energy-network__wire energy-network__wire--branch energy-network__wire--branch-a"
            d="M468 454 C428 380 384 327 330 278"
            pathLength={1}
          />
          <path
            className="energy-network__wire energy-network__wire--branch energy-network__wire--branch-b"
            d="M734 552 C788 604 828 670 840 744"
            pathLength={1}
          />

          <circle cx="90" cy="820" r="11" className="energy-network__spark energy-network__spark--start" filter="url(#energyPulseGlow)" />
          <circle cx="330" cy="278" r="8" className="energy-network__spark energy-network__spark--a" filter="url(#energyPulseGlow)" />
          <circle cx="840" cy="744" r="8" className="energy-network__spark energy-network__spark--b" filter="url(#energyPulseGlow)" />
          <circle cx="928" cy="216" r="12" className="energy-network__spark energy-network__spark--end" filter="url(#energyPulseGlow)" />
        </svg>

        <div className="energy-hero__stage">
          <div className="energy-hero__intro">
            <p className="energy-kicker">Futuristic digital systems</p>
            <h1 id="energy-hero-title">Mace Digital</h1>
            <p className="energy-subtitle">
              Premium Websites &amp; AI Automation for Modern Businesses
            </p>
          </div>

          <div className="energy-hero__cards" aria-label="Core services">
            {serviceCards.map((card, index) => (
              <article key={card.title} className={`service-card ${card.className}`}>
                <span className="service-card__index">0{index + 1}</span>
                <h2>{card.title}</h2>
              </article>
            ))}
          </div>

          <div className="energy-hero__story">
            <p className="story-copy">
              One electric thread reveals the entire system — from the first visitor
              to the booking, the customer relationship, and the automation that keeps
              it all moving.
            </p>
          </div>

          <div className="energy-nodes" aria-label="Connected business outcomes">
            {branchNodes.map((node) => (
              <div
                key={node.label}
                className={`energy-node ${node.className}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span className="energy-node__dot" />
                <span>{node.label}</span>
              </div>
            ))}
          </div>

          <div className="energy-hero__final-cta">
            <p className="energy-final-copy">
              The network is live. Every enquiry, booking, and customer touchpoint is now connected.
            </p>
            <div className="energy-hero__buttons">
              <a href="#contact-form" className="cta-button cta-button--primary">
                Book a Free Digital Growth Call
              </a>
              <a href="#website-audit" className="cta-button cta-button--secondary">
                View Website Audit Tool
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
