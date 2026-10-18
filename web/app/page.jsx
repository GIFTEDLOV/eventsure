import Link from "next/link";
import "./landing.css";
import {CONTRACT,HASH,EXPLORER} from "../lib/v3.mjs";
const Arrow=()=> <span aria-hidden="true">↗</span>;
const features=[
 ["01 / EVIDENCE","Source-bound evidence.","Frozen public URLs are retrieved during GenLayer validator execution and hashed into the consensus result. Separate domains alone do not guarantee publisher independence.","◈"],
 ["02 / CONSENSUS","Judgment with constraints.","Semantic evaluation has explicit fields: verdict, independent-source count and timing. Validators compare the essential decision.","◇"],
 ["03 / DUE PROCESS","Challenge the outcome.","Preliminary decisions enter a public objection window, with reconsideration and time-gated finalization.","◎"]
];
const steps=[
 ["Define","Set the question, deadline, rules, two or three public sources and optional attestor quorum."],
 ["Freeze","Lock the exact policy on GenLayer before the deadline."],
 ["Evaluate","Validators independently fetch evidence after the deadline and assess it."],
 ["Contest & finalize","Allow objections, reconsider if needed, then finalize after the review window."]
];
export default function Landing(){
 return <div className="es-site">
 <header className="es-header">
  <Link href="/" className="es-logo"><span className="es-logo-symbol"><i/><i/><i/></span><span>eventsure<span className="es-logo-period">.</span></span></Link>
  <nav><a href="#protocol">Protocol</a><a href="#architecture">Architecture</a><a href="#usecases">Use cases</a><a href="https://github.com/GIFTEDLOV/eventsure" target="_blank" rel="noreferrer">GitHub <Arrow/></a></nav>
  <Link href="/app" className="es-nav-button">Launch protocol <Arrow/></Link>
 </header>
 <main>
 <section className="es-hero"><div className="es-grid-bg"/>
  <div className="es-hero-copy">
   <div className="es-strap"><span className="es-live-dot"/> GENLAYER INTELLIGENT CONTRACT <span className="es-strap-tail">STUDIONET / V3.3</span></div>
   <h1>Truth needs<br/><em>a higher standard.</em></h1>
   <p className="es-lede">The evidence-first verification layer for promises, milestones and public-world outcomes. Frozen rules. Independent sources. On-chain consensus.</p>
   <div className="es-hero-actions"><Link href="/app" className="es-primary">Explore the protocol <Arrow/></Link><a href="#protocol" className="es-secondary">How it works <span>↓</span></a></div>
   <div className="es-hero-meta"><span>⛨ Public-source verification</span><span><span className="es-live-dot"/> Live on GenLayer Studionet</span></div>
  </div>
  <div className="es-diagram">
   <div className="es-diagram-head"><span className="es-square-dot"/> PROOF ENGINE / LIVE <span className="es-diagram-status">● CONSENSUS</span></div>
   <div className="es-orbit"><div className="es-orbit-circle outer"/><div className="es-orbit-circle inner"/><div className="es-orbit-center"><span>⟡</span><small>EVENTSURE</small><b>CONSENSUS</b></div>
    <div className="es-float-card es-float-one"><span className="es-float-icon">◈</span><div><small>SOURCE 01</small><strong>RETRIEVED ✓</strong></div></div>
    <div className="es-float-card es-float-two"><span className="es-float-icon">⬡</span><div><small>SOURCE 02</small><strong>INDEPENDENT ✓</strong></div></div>
    <div className="es-float-card es-float-three"><span className="es-float-icon">≋</span><div><small>VALIDATOR SET</small><strong>AGREEMENT ✓</strong></div></div>
   </div>
   <div className="es-diagram-footer"><div><small>POLICY</small><b>IMMUTABLE</b></div><div><small>EVIDENCE</small><b>MULTI-SOURCE</b></div><div><small>RESULT</small><b>ON-CHAIN</b></div></div>
  </div>
 </section>
 <div className="es-info-strip"><div><small>THE INFRASTRUCTURE</small><b>One contract. Many verification cases.</b></div><div className="es-stats"><span><strong>02–03</strong><small>INDEPENDENT SOURCES</small></span><span><strong>24H</strong><small>CHALLENGE WINDOW</small></span><span><strong>05</strong><small>OPTIONAL ATTESTORS</small></span></div></div>
 <section className="es-section" id="protocol"><div className="es-section-kicker">01 — CORE PROTOCOL</div><div className="es-section-lead"><h2>Less trust.<br/><em>More evidence.</em></h2><p>EventSure moves the verification decision out of a central application server and into a reusable GenLayer Intelligent Contract.</p></div><div className="es-feature-grid">{features.map(f=><article key={f[0]} className="es-feature"><div className="es-feature-top"><span>{f[0]}</span><b>{f[3]}</b></div><h3>{f[1]}</h3><p>{f[2]}</p><span className="es-feature-line"/></article>)}</div></section>
 <section className="es-split" id="architecture"><div><div className="es-section-kicker">02 — THE LIFECYCLE</div><h2>Verification with<br/><em>a process.</em></h2><p>Every case follows the same lifecycle while evidence and requirements remain configurable. No operator can silently rewrite a frozen case.</p><a href={EXPLORER+"/address/"+CONTRACT} target="_blank" rel="noreferrer" className="es-outline-link">Inspect the live contract <Arrow/></a></div><div className="es-steps">{steps.map((s,i)=><div className="es-step" key={s[0]}><span>0{i+1}</span><div><h3>{s[0]}</h3><p>{s[1]}</p></div><span className="es-step-line"/></div>)}</div></section>
 <section id="usecases" className="es-section es-usecases"><div className="es-section-kicker">03 — BUILT TO BE REUSED</div><h2>One primitive.<br/><em>Many possibilities.</em></h2><div className="es-use-grid">{[["01","Grant milestones","Was a project milestone met by the published deadline?"],["02","Public announcements","Can independent public sources substantiate a time-bound claim?"],["03","DAO policies","Does a public action comply with the frozen criteria?"],["04","Software releases","Do independent release records document a published milestone?"]].map(x=><article key={x[0]}><small>{x[0]} / APPLICATION</small><h3>{x[1]}</h3><p>{x[2]}</p><span>↗</span></article>)}</div></section>
 <section className="es-integrity"><div className="es-integrity-mark">⛨</div><div><span className="es-section-kicker">A PRECISE TRUST BOUNDARY</span><h2>Consensus isn't omniscience.</h2><p>Public sources can be incomplete, delayed, or misleading. EventSure assesses whether frozen public sources substantiate a claim under explicit rules. It does not guarantee absolute truth.</p></div><div className="es-integrity-hash"><small>V3 SOURCE FINGERPRINT</small><code>{HASH}</code><a href="/api/v3/source">Verified source ↗</a></div></section>
 <section className="es-final-cta"><div className="es-section-kicker">READY TO VERIFY?</div><h2>Make your next promise<br/><em>provable.</em></h2><p>Use the verification protocol. Create a case, freeze its rules, and let GenLayer examine public sources.</p><Link href="/app" className="es-primary">Open the verification console <Arrow/></Link></section>
 </main>
 <footer className="es-footer"><Link href="/" className="es-logo">eventsure<span className="es-logo-period">.</span></Link><span>© 2026 EVENTSURE / GENLAYER STUDIONET</span><div><a href="https://github.com/GIFTEDLOV/eventsure" target="_blank" rel="noreferrer">GitHub</a><a href={EXPLORER+"/address/"+CONTRACT} target="_blank" rel="noreferrer">Explorer</a><Link href="/app">Console ↗</Link></div></footer>
 </div>
}
