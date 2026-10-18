# EventSure V3.3 — GenLayer Portal submission package

**State on 2026-10-18:** Complete evidence package prepared but **NOT SUBMITTED**. The authenticated builder account and the protected GitHub `main` approval are required before the Portal entry can be recorded. This document does **not** invent a Portal submission ID or steward acceptance.

## Proposed project information

**Project name:** EventSure

**Track:** Project Track (select the actual available Builder submission track in the logged-in Portal; labels may differ)

**Short description:** A reusable GenLayer Intelligent Contract that verifies public milestones against frozen conditions and independent web evidence through AI-validator consensus, with an auditable challenge and finalization lifecycle.

**Full description:**

> EventSure transforms public promises and deliverables into verifiable, time-bound cases. Any builder can define an event, freeze its outcome criteria and deadline, and identify multiple publicly accessible HTTPS sources. The same deployed GenLayer Intelligent Contract independently retrieves documentary evidence, applies bounded semantic evaluation under AI-validator consensus, and records a transparent `VERIFIED` or `INCONCLUSIVE` preliminary result.
>
> The deterministic contract enforces creator-only freezing, optional attestor quorums, public challenges, reconsideration, and challenge-window finality. EventSure's reusable interface supports grants, public launches, open-source milestones and verifiable commitments without requiring an organization-specific contract deployment. A separate professional landing page and wallet-connected console expose live cases, source citations, audit history, and developer integration guidance. All user-facing results are explicitly qualified by their frozen evidence criteria—not asserted as objective real-world truth.

**Why GenLayer is essential:** Ordinary deterministic contracts cannot interpret diverse, unstructured public webpages or adjudicate ambiguous natural-language claims. EventSure uses `gl.nondet.web.get`, `gl.nondet.exec_prompt`, and `gl.vm.run_nondet_unsafe` to let independently executing GenLayer validators evaluate the same material semantic verdict. Deterministic storage and lifecycle restrictions then preserve integrity of frozen terms and on-chain outcomes.

## URLs and IDs

- GitHub: https://github.com/GIFTEDLOV/eventsure
- V3.3 release pull request: https://github.com/GIFTEDLOV/eventsure/pull/1 (**requires independent approval and merge**)
- Live application: https://eventsure-studionet.vercel.app
- Console: https://eventsure-studionet.vercel.app/app
- Contract: `0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0`
- GenLayer network: Studionet, chain ID `61999`, RPC `https://studio.genlayer.com/api`
- Contract source: `contracts/EventSureV3_3.py`
- Contract SHA-256: `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd`
- Deployment transaction: `0xb799b06e63d934315e2a534be821fad6ae1dc7d62e9d4b129f916282f7927188` — FINALIZED/SUCCESS and source-byte parity
- Developer integration: https://github.com/GIFTEDLOV/eventsure/blob/release/eventsure-v3.1/docs/INTEGRATION_V3_3.md
- Security review: https://github.com/GIFTEDLOV/eventsure/blob/release/eventsure-v3.1/docs/SECURITY_AND_QUALITY_REVIEW_V3_3.md

## Reproducible live proof

**1. Positive public-evidence validation, now FINALIZED**
- Case: `EVS-APOLLO-POS-V33-E453D2D5E670`
- Historical evidence: NASA Kennedy Space Center and the Smithsonian National Air and Space Museum.
- Case create: `0x60277b68d7ceb22f4c4d03d2749f1ffa5cf9eddfa57e5b1ddca08ca400d8c723`
- Freeze: `0x73b07c22541ae8382368ac672ce5c6201b10cd9a4dfe819243e4aae0411230e9`
- Resolve: `0xe4aa025673ebc30c22a9771da92ebab5c29c7ca4b6ce7b700ed45ece8682da53`
- All three FINALIZED/SUCCESS. On-chain resolution decision **PRELIMINARY / VERIFIED**, `independent_sources=2`, `time_supported=true`. Its 24-hour review period elapsed unchallenged. Finalization tx `0xb51ab16cfb9a3ec07618253e1283d70ebc26ffbf78539e85a9eb6af6423e982d` is FINALIZED/SUCCESS with **five agreeing validators**. Current case state **FINALIZED / VERIFIED**. Proof: `deployments/STUDIONET_V3_3_FINAL_VERDICT.json`.
- Machine-readable proof: `deployments/STUDIONET_V3_3_POSITIVE_QUALIFICATION.json`
- CI: https://github.com/GIFTEDLOV/eventsure/actions/runs/39011356807

**2. Fail-closed public-evidence assessment**
- Case: `EVS-APOLLO-V33-53368258196A`
- Resolve: `0x35486954ec65ba41f2d2bb9ced83102af92b1fe9717e1683d4cd2b7ce2f60469`
- All create/freeze/resolve transactions FINALIZED/SUCCESS; decision **PRELIMINARY / INCONCLUSIVE** when the submitted URLs failed to substantiate the historical claim to validators' satisfaction. Evidence: `deployments/STUDIONET_V3_3_QUALIFICATION.json`; CI https://github.com/GIFTEDLOV/eventsure/actions/runs/39010624241
- **Challenge/reconsideration completed:** Challenge tx `0xe3b848a2b64ae6d679122e056d9261b6dc84a233244f4c54e364a2b01824a1da` succeeded. Reconsideration tx `0xe34e4fad4c520683d33d729b202a356f77ca0b3ae379b164fecfb18116763c07` FINALIZED/SUCCESS; current state PRELIMINARY, round 2, INCONCLUSIVE, source drift detected. New review window ends `2026-10-19T07:11:36.393551Z`. Proof: `deployments/STUDIONET_V3_3_RECONSIDERATION.json`.

## Demonstration walkthrough (2–3 minutes)

1. Open the landing page; explain the problem of unverifiable public commitments and why semantic AI-validator consensus is needed.
2. Open `/app`, show chain ID 61999, immutable deployed address and live registry.
3. Select the VERIFIED Apollo 11 case and show two dated URLs, frozen criteria, decision timing and context/source digests.
4. Compare with the conservative INCONCLUSIVE case, emphasizing that different evidence quality yields a different result.
5. Show the seven write methods, public challenge window, user wallet connection, and developer SDK integration.
6. Explain known trust limits and open-source reproducibility. **Do not present a mocked wallet E2E as a signed real-wallet transaction.**

## Technical risk disclosures

Domain diversity does not certify different publisher ownership; public pages can change or contain misleading dates and prompt injection. Evidence excerpt hashes establish what was assessed, not when it was first published. Eight challenge slots are not Sybil-resistant; future financial automation would require stricter archival/timestamp and issuer provenance. This is deployed Studionet research software, not mainnet security certification or an independent audit. See `docs/SECURITY_AND_QUALITY_REVIEW_V3_3.md`.

## Before clicking Submit

- [ ] Independent pull request reviewer approves, protected main merged, exact-main CI and production SHA parity verified.
- [x] Confirm live state of positive case: FINALIZED / VERIFIED after five-validator agreement.
- [ ] Attach browser screenshots from the successful GitHub Actions `EventSure Browser Smoke` artifact if requested.
- [ ] Sign in to https://portal.genlayer.foundation/ as the owner/builder and select the real Project Track submission form.
- [ ] Paste accurate project details and public URLs, including contract address/chain/network and proof transactions.
- [ ] Save the returned submission URL or ID in `docs/PORTAL_SUBMISSION_RECEIPT.md` **only after a genuine submission is observed**.

No authenticated GenLayer Portal action or receipt is evidenced in the current tooling. Do not claim final submission until recorded.
