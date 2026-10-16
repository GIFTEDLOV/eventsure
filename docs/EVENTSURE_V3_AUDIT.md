# EventSure V2–V3.1 Full Audit

Date: 2026-10-16. Scope: V2 legacy, V3 rejected qualification, V3.1 corrected contract, Web UI, on-chain evidence, threat model.

## Root findings

HIGH — V2 merely adjudicated a single authorized attestor statement and did not independently fetch public-world evidence. V3.1 retrieves frozen public web documents through GenVM and requires a two-source bounded GenLayer validator consensus decision.

HIGH — V2 offered no challenge and no staged finality. V3.1 has PRELIMINARY decisions, one public challenge, reconsideration and a 24-hour finalization delay.

HIGH — V3 live resolution failed with an AttributeError for Response.status_code. GenVM lint could not catch the runtime mismatch. V3.1 uses the documented Response.body interface. V3 was not accepted as a qualified release.

HIGH — Counting api.github.com and raw.githubusercontent.com as independent sources would overstate source diversity. V3.1 treats these and other GitHub hosts as the same source group.

MEDIUM — V2 allowed only one evidence statement. V3.1 supports up to five optional attestors with a frozen numeric quorum. Independent public source validation is mandatory even without attestors.

MEDIUM — V2 lacked a developer integration experience. V3.1 includes a dedicated landing page, public explorer, creation, wallet actions, challenges, developer provenance and an audit registry.

## Contract-first architecture

create_case → freeze_case → optional attest → resolve_case → PRELIMINARY → challenge_case (optional) → reconsider_case (if challenged) → finalize_case (after 24 hours).

Case creation freezes 2–3 HTTPS public-source URLs from distinct host groups, an exact question, verification rule, deadline and optional attestor set/quorum. The GenVM leader fetches source contents directly, evaluates a strictly structured JSON vote and passes it to independent validators. The validators repeat both fetch and evaluation. A positive result requires supported=true, time_supported=true and independent_sources >= 2. No storage mutation occurs inside the non-deterministic evaluation.

V3.1 has seven public writes, seven public views and no privileged administrator. Every case creator can freeze their own draft; anybody can resolve, challenge, request reconsideration or finalize when lifecycle constraints permit.

## Remaining risks (not represented as fixed)

A creator can select biased sources or frame favorable rules. Distinct domains are not proof of independent ownership or accuracy; website content can drift after publication. Network access can fail or be restricted; validators can disagree. The first challenge can monopolize the one allowed challenge slot, potentially griefing legitimate challengers. No external timestamp notarization, automated escrow/payout, claim reputation model, or third-party security audit exists. Real browser-wallet interoperability has not been exercised across providers. Testnet deployment is not mainnet readiness. Public case evidence may contain sensitive information if users submit it; do not do so.

Approval by validators cannot guarantee objective external truth. Interpret VERIFIED narrowly: the required number of public sources and event timing were judged to substantiate the frozen claim, under the specific user-selected rule. Otherwise INCONCLUSIVE.

## Verification evidence

49 original V3 mocked tests; 50 V3.1 mocked adversarial tests; 35 legacy V2 tests; 34 frontend tests, Next.js production build and dependency scan. These do not prove real GenVM web runtime compatibility; the live qualification receipt does. A successful deployed contract is not enough unless an actual source-fetching resolution is FINALIZED and SUCCESS. Record failure plainly when applicable.

Historical V2 SHA: 1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14.
V3 failed qualification source SHA: 7e9fdc817cb6ebea917934367a3b60ea0e0dc3ddccc6555c189950597edb78a4.
V3.1 frozen source SHA: 0fe025b631642094a3f86d49b6d928ba76a00c1af1102a2699036fb959a97acb.

