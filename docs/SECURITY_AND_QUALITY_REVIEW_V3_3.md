# EventSure V3.3 — Contract and Application Security Review

**Assessment date:** 2026-10-17. **Scope:** `contracts/EventSureV3_3.py`, wallet-connected `web/app/app/page.jsx`, `web/lib/v3.mjs`, server read routes, existing unit/GenVM/browser tests, live Studionet results. **Review type: repository-focused internal technical review, NOT an independent external audit.**

## Verifiable strengths

- Source SHA-256 `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd`; deployment `0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0` on Studionet 61999 with FINALIZED/SUCCESS and byte-exact parity.
- Verified live cases: `EVS-APOLLO-V33-53368258196A` (PRELIMINARY/INCONCLUSIVE) and `EVS-APOLLO-POS-V33-E453D2D5E670` (PRELIMINARY/VERIFIED), both via finalized real create/freeze/resolve transactions. Do not confuse GenLayer transaction finality with the case's later challenge-window finalization.
- Frozen rules, URLs and deadlines; creator-only freezing; authorized attestors; bounded-source web retrieval; bounded initial/challenge time windows; public challenger records; no privileged mutable owner or unilateral outcome setter.
- Contract's equivalence check re-executes evidence retrieval and LLM assessment independently and compares the material yes/no outcome. Rejects absent, malformed and materially contradictory verdicts.
- Frontend separately checks wallet account and chain, avoids embedding signing secrets; attached tests now cover post-write validator and case-state readback.

## Open material risks — no unearned “audit passed” claim

| ID | Severity | Finding | Consequence / required mitigation |
| --- | --- | --- | --- |
| ES-01 | HIGH for high-value uses | Source hosts are grouped by an incomplete registrable-domain heuristic. Different domains are **not** proof of different beneficial owners or independent publishers. | Two coordinated sites can be treated as independent. For financially consequential use, add external publisher provenance and a stronger trust policy; contract modification would require a new audited deployment. |
| ES-02 | HIGH for deadline/financial use | Sources are fetched at resolution, **not notarized at the historical event deadline**. HTTPS retrieval and excerpt hashes do not prove date of first publication or historical content. | Post-deadline edits and misleading timestamps may alter outcomes. Require verifiable snapshots/archives or authoritative timestamp attestations in a future version. |
| ES-03 | MEDIUM-HIGH | Challenge capacity is eight wallet addresses per case, with no Sybil-resistant admission, bond, or rate-limit policy. | A coordinated attacker can fill slots and exclude legitimate objections. Limit claims of “fair” challenge access until addressed. |
| ES-04 | MEDIUM-HIGH (requires dedicated runtime testing) | URL validator checks the initial HTTPS host; redirect target, DNS rebinding, and arbitrary server-side redirects are not explicitly checked in contract source. GenVM is sandboxed; exploitability is **not established**. | Test redirects and resolution in supported GenVM; implement final-host/redirect policy if feasible, otherwise reject redirecting sources at the evidence service boundary. |
| ES-05 | MEDIUM | Evidence extraction strips HTML and keeps at most 4500 characters per source, scored by question tokens; relevance can be missed or attacker-controlled markup can bias the excerpt. | False negatives / model prompt-injection exposure; bound and test source-selection reliability. |
| ES-06 | MEDIUM | Web content and free-form attestation/challenge claims enter a model prompt, where anti-injection is instruction-based; independent factual corroboration is semantic, not cryptographic. | Do not treat a VERIFIED verdict as ground truth; continue red-teaming instruction-smuggling and forged publisher documents. |
| ES-07 | MEDIUM | Challenged reconsideration may fetch up to eight extra URLs, and any drift of original excerpt digests forces INCONCLUSIVE. Whole-source retrieval totals may be high even with per-response 500KB caps. | Cost/availability DoS and conservative false negatives; test runtime worst cases and bound cumulative bytes/retries in future version. |
| ES-08 | RELEASE QA | Tests exercise static Chromium and simulated EIP-1193 provider; real browser-wallet signing interoperability and denial/recovery under third-party wallet remain unproven. | Independently perform a signed user-wallet transaction, invalid-chain rejection, and transaction reconciliation on Studionet. |
| ES-09 | PROCESS | Protected `main` requires one independent code review; creator approval cannot substitute. | Do not bypass review branch protection. Get an authorized second GitHub reviewer before merge. |

## Release policy

**Appropriate:** GenLayer Project Track **testnet demonstration**, with clear historical proof, explicit limits, and the real user-facing website. **Not established:** third-party independent security certification, deterministic external truth, immutable historical web notarization, mainnet readiness, trust-minimized high-value payments, or completed GenLayer Portal acceptance.

Before calling the release fully complete: verify CI at exact release head; complete wallet EIP-1193 browser regression; demonstrate real challenge (on the INCONCLUSIVE sample) and later reconciliation or mark untested; allow the VERIFIED case's 24-hour review and finalization; require independent PR approval; merge protected main and rebuild verified exact-head production; submit through authenticated GenLayer Portal and record actual submission ID. No extra contract redeployment is approved by this review.
