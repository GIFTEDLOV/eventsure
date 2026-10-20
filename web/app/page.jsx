import Link from "next/link";
import "./landing.css";
import {CONTRACT, SOURCE_SHA256} from "../lib/protocol.mjs";

const EXPLORER = "https://explorer-studio.genlayer.com";
const Arrow = () => <span aria-hidden="true">↗</span>;

const features = [
  [
    "01 / SPECIFICATION",
    "Frozen milestone criteria.",
    "Events define explicit requirements, rules, and a strict deadline. Once frozen by the creator, the policy cannot be tampered with or modified.",
    "◈"
  ],
  [
    "02 / ATTESTATION",
    "Designated attestor proof.",
    "Only the explicitly assigned attestor wallet may submit textual proof and reference artifacts before the deadline, preventing impersonation.",
    "◇"
  ],
  [
    "03 / CONSENSUS",
    "Intelligent contract adjudication.",
    "GenLayer validators independently evaluate the evidence against frozen rules using non-comparative consensus, guaranteeing tamper-evident finality.",
    "◎"
  ]
];

const steps = [
  ["Define", "Register the milestone ID, title, acceptance requirement, adjudication rule, deadline, and authorized attestor address."],
  ["Freeze", "Immutably lock the specification on-chain before the deadline. Frozen milestones cannot be altered."],
  ["Attest", "The authorized attestor submits verifiable evidence text and reference metadata."],
  ["Resolve", "GenLayer consensus validators evaluate the attested evidence against frozen criteria and record the final on-chain verdict."]
];

const usecases = [
  ["01", "Grant Milestones", "Verify whether open-source teams achieved grant deliverable criteria."],
  ["02", "Service SLAs", "Adjudicate time-bound contract deliverables against clear technical specifications."],
  ["03", "DAO Governance", "Validate whether executive proposals met the required execution milestones."],
  ["04", "Bounty Settlement", "Ensure bug bounty proof-of-concepts meet the frozen disclosure criteria."]
];

export default function LandingPage() {
  return (
    <div className="es-site">
      <header className="es-header">
        <Link href="/" className="es-logo">
          <span className="es-logo-symbol"><i /><i /><i /></span>
          <span>eventsure<span className="es-logo-period">.</span></span>
        </Link>
        <nav>
          <a href="#protocol">Protocol</a>
          <a href="#architecture">Architecture</a>
          <a href="#usecases">Use cases</a>
          <a href="https://github.com/GIFTEDLOV/eventsure" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
        </nav>
        <Link href="/app" className="es-nav-button">⚡ Enter App <Arrow /></Link>
      </header>

      <main>
        <section className="es-hero">
          <div className="es-grid-bg" />
          <div className="es-hero-copy">
            <div className="es-strap">
              <span className="es-live-dot" /> GENLAYER INTELLIGENT CONTRACT <span className="es-strap-tail">STUDIONET / V2.0</span>
            </div>
            <h1>Truth needs<br /><em>a higher standard.</em></h1>
            <p className="es-lede">
              The evidence-first milestone adjudication protocol on GenLayer. Frozen specifications. Authorized attestations. Multi-validator intelligent consensus.
            </p>
            <div className="es-hero-actions">
              <Link href="/app" className="es-primary">⚡ Enter App <Arrow /></Link>
              <a href="#protocol" className="es-secondary">How it works <span>↓</span></a>
            </div>
            <div className="es-hero-meta">
              <span>⛨ Single-attestor authentication</span>
              <span><span className="es-live-dot" /> Live on GenLayer Studionet (61999)</span>
            </div>
          </div>

          <div className="es-diagram">
            <div className="es-diagram-head">
              <span className="es-square-dot" /> PROOF ENGINE / LIVE <span className="es-diagram-status">● CONSENSUS</span>
            </div>
            <div className="es-orbit">
              <div className="es-orbit-circle outer" />
              <div className="es-orbit-circle inner" />
              <div className="es-orbit-center">
                <span>⟡</span>
                <small>EVENTSURE</small>
                <b>CONSENSUS</b>
              </div>
              <div className="es-float-card es-float-one">
                <span className="es-float-icon">◈</span>
                <div>
                  <small>SPECIFICATION</small>
                  <strong>FROZEN ✓</strong>
                </div>
              </div>
              <div className="es-float-card es-float-two">
                <span className="es-float-icon">⬡</span>
                <div>
                  <small>ATTESTOR PROOF</small>
                  <strong>AUTHENTICATED ✓</strong>
                </div>
              </div>
              <div className="es-float-card es-float-three">
                <span className="es-float-icon">≋</span>
                <div>
                  <small>VALIDATOR SET</small>
                  <strong>AGREEMENT ✓</strong>
                </div>
              </div>
            </div>
            <div className="es-diagram-footer">
              <div><small>SPECIFICATION</small><b>IMMUTABLE</b></div>
              <div><small>ATTESTATION</small><b>SINGLE-ATTESTOR</b></div>
              <div><small>CONSENSUS</small><b>ON-CHAIN</b></div>
            </div>
          </div>
        </section>

        <div className="es-info-strip">
          <div>
            <small>INTELLIGENT CONTRACT CONSENSUS</small>
            <b>One protocol. Deterministic milestone adjudication.</b>
          </div>
          <div className="es-stats">
            <span><strong>61999</strong><small>STUDIONET CHAIN ID</small></span>
            <span><strong>V2.0</strong><small>INTELLIGENT CONTRACT</small></span>
            <span><strong>100%</strong><small>ON-CHAIN AUDIT</small></span>
          </div>
        </div>

        <section className="es-section" id="protocol">
          <div className="es-section-kicker">01 — CORE PROTOCOL</div>
          <div className="es-section-lead">
            <h2>Less dispute.<br /><em>More certainty.</em></h2>
            <p>
              EventSure shifts milestone review out of opaque centralized servers and into a verifiable GenLayer Intelligent Contract on Studionet.
            </p>
          </div>
          <div className="es-feature-grid">
            {features.map(([num, title, desc, icon]) => (
              <article key={num} className="es-feature">
                <div className="es-feature-top">
                  <span>{num}</span>
                  <b>{icon}</b>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="es-feature-line" />
              </article>
            ))}
          </div>
        </section>

        <section className="es-split" id="architecture">
          <div>
            <div className="es-section-kicker">02 — THE LIFECYCLE</div>
            <h2>Verification with<br /><em>a clear process.</em></h2>
            <p>
              Every event progresses through an immutable 4-step state machine: Create, Freeze, Attest, and Resolve. Once locked, rules cannot be tampered with.
            </p>
            <a href={`${EXPLORER}/address/${CONTRACT}`} target="_blank" rel="noreferrer" className="es-outline-link">
              Inspect on Studionet Explorer <Arrow />
            </a>
          </div>
          <div className="es-steps">
            {steps.map(([title, desc], i) => (
              <div className="es-step" key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="usecases" className="es-section es-usecases">
          <div className="es-section-kicker">03 — PRODUCTION USE CASES</div>
          <h2>One protocol.<br /><em>Many applications.</em></h2>
          <div className="es-use-grid">
            {usecases.map(([num, title, desc]) => (
              <article key={num}>
                <small>{num} / APPLICATION</small>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span>↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="es-integrity">
          <div className="es-integrity-mark">⛨</div>
          <div>
            <span className="es-section-kicker">PRECISE TRUST BOUNDARY</span>
            <h2>Authenticated review, not omniscience.</h2>
            <p>
              EventSure evaluates whether submitted textual evidence fulfills frozen requirements according to GenLayer validator consensus. It guarantees procedural consensus over authenticated claims, with full append-only audit provenance on Studionet.
            </p>
          </div>
          <div className="es-integrity-hash">
            <small>V2 CONTRACT SHA-256</small>
            <code>{SOURCE_SHA256}</code>
            <a href={`${EXPLORER}/address/${CONTRACT}`} target="_blank" rel="noreferrer">
              Verified Studionet Contract ↗
            </a>
          </div>
        </section>

        <section className="es-final-cta">
          <div className="es-section-kicker">READY TO TRANSACT?</div>
          <h2>Enter the operational<br /><em>workspace.</em></h2>
          <p>
            Create milestones, freeze specifications, submit attestations, and trigger GenLayer intelligent consensus resolution.
          </p>
          <Link href="/app" className="es-primary">⚡ Enter App <Arrow /></Link>
        </section>
      </main>

      <footer className="es-footer">
        <Link href="/" className="es-logo">
          <span>eventsure<span className="es-logo-period">.</span></span>
        </Link>
        <span>© 2026 EVENTSURE / GENLAYER STUDIONET 61999</span>
        <div>
          <a href="https://github.com/GIFTEDLOV/eventsure" target="_blank" rel="noreferrer">GitHub</a>
          <a href={`${EXPLORER}/address/${CONTRACT}`} target="_blank" rel="noreferrer">Explorer</a>
          <Link href="/app">Workspace ↗</Link>
        </div>
      </footer>
    </div>
  );
}
