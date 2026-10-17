# EventSure

**A reusable public-evidence verification Intelligent Contract on GenLayer, with a production landing page and wallet-connected application.**

[Live app](https://eventsure-studionet.vercel.app) · [Interactive console](https://eventsure-studionet.vercel.app/app) · [GenLayer contract](https://explorer-studio.genlayer.com/address/0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0) · [Developer integration](docs/INTEGRATION_V3_3.md) · [Project Track dossier](docs/GENLAYER_PORTAL_SUBMISSION_V3_3.md)

## The problem

Public launches, funding milestones, governance commitments and documented deliverables often depend on one party claiming “done.” Ordinary smart contracts cannot read public web evidence or evaluate ambiguous natural-language criteria. EventSure provides one configurable Intelligent Contract for many independent cases without redeploying per use case.

## What EventSure does

1. **Create:** Choose an ID, exact question, dated deadline, immutable evidence rule, two or three public HTTPS documents and optional authorized attestors.
2. **Freeze:** The creator commits the rule and URLs on-chain before the deadline.
3. **Resolve:** After the deadline, GenLayer validators independently retrieve evidence, run semantic adjudication, and compare their **material outcome** under the same frozen policy.
4. **Challenge:** Up to eight distinct addresses may object in the 24-hour review window, optionally submitting a public reference. This is not Sybil-resistant.
5. **Reconsider / finalize:** After the challenge window, anyone can request reconsideration of challenged cases, or finalize an eligible preliminary result. Finalized transaction status and case finality are distinct.

The output is **VERIFIED** or **INCONCLUSIVE under the frozen evidence policy**—not objective real-world truth.

## V3.3 verified deployment

| Field | Value |
| --- | --- |
| GenLayer network | Studionet — chain `61999` |
| Contract | `0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0` |
| Source | [`contracts/EventSureV3_3.py`](contracts/EventSureV3_3.py) |
| Source SHA-256 | `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd` |
| Deployment | [`0xb799b06e63d934315e2a534be821fad6ae1dc7d62e9d4b129f916282f7927188`](https://explorer-studio.genlayer.com/tx/0xb799b06e63d934315e2a534be821fad6ae1dc7d62e9d4b129f916282f7927188) — FINALIZED / SUCCESS |
| ABI | 14 public methods: 7 writes, 7 reads |
| Source parity | Exact byte equality between repository and on-chain GenLayer contract |
| RPC | `https://studio.genlayer.com/api` |
| Release branch | [`release/eventsure-v3.1`](https://github.com/GIFTEDLOV/eventsure/pull/1); **protected main still awaits independent review** |

## Live cases — not mocked verdicts

| Case | Result | Reproducible evidence |
| --- | --- | --- |
| `EVS-APOLLO-POS-V33-E453D2D5E670` | **PRELIMINARY / VERIFIED** (during 24-hour review window) | [On-chain proof](deployments/STUDIONET_V3_3_POSITIVE_QUALIFICATION.json) · [resolve transaction](https://explorer-studio.genlayer.com/tx/0xe4aa025673ebc30c22a9771da92ebab5c29c7ca4b6ce7b700ed45ece8682da53) |
| `EVS-APOLLO-V33-53368258196A` | **PRELIMINARY / INCONCLUSIVE** at original resolution; subsequent challenge/reconsideration status must be read from chain | [On-chain proof](deployments/STUDIONET_V3_3_QUALIFICATION.json) · [resolve transaction](https://explorer-studio.genlayer.com/tx/0x35486954ec65ba41f2d2bb9ced83102af92b1fe9717e1683d4cd2b7ce2f60469) |

All six original case lifecycle transactions were FINALIZED and executed successfully. NASA and Smithsonian evidence yielded a positive result only for the more specific dated-source case. The earlier broad-source case remained conservative rather than inventing a verified outcome.

## Technical architecture

- **GenLayer Intelligent Contract:** frozen case policy and deadlines, 500 KB maximum web response, deterministic compact excerpt selection, bounded structured semantic votes, custom material-equivalence validator, challenge/reconsideration and append-only audit.
- **Next.js app:** distinct editorial landing page and signed-wallet console (case registry, case creation, source URLs, transaction status, reviewer challenges, developer integration).
- **GitHub/Vercel:** protected PR workflow, GenVM verification, Python adversarial tests, frontend tests, desktop/mobile Chromium runs with **simulated** EIP-1193 wallet scenarios, and production build/source hash verification.

**Contract interfaces:** `create_case`, `freeze_case`, `attest`, `resolve_case`, `challenge_case`, `reconsider_case`, `finalize_case`, `contract_info`, `get_case`, `get_case_ids`, `get_attestation`, `get_challenge`, `get_audit_count`, `get_audit`.

## Run verification locally

```sh
npm ci
python -m unittest discover -s tests -v
npm --prefix web ci
npm --prefix web test
npm --prefix web run build
node scripts/verify_v3_3.mjs
```

Browser tests are run in the `EventSure Browser Smoke` GitHub Actions workflow (actual Chromium at desktop and mobile widths). The mocked provider tests are not substitutes for a genuine user-wallet signed browser write.

## Limitations and release gates

**Source independence** is based on host grouping, not cryptographic publisher ownership. The retrieved webpages and recorded excerpt hashes do not prove historic first-publication time; sources can redirect, drift, mislead or contain prompt injection. The eight public challenge slots can be captured by multiple wallets. No third-party security audit, automatic escrow, production-network certification or immutable archival timestamping has been demonstrated.

Read [V3.3 security and quality review](docs/SECURITY_AND_QUALITY_REVIEW_V3_3.md), [Developer guide](docs/INTEGRATION_V3_3.md) and [GenLayer Portal submission package](docs/GENLAYER_PORTAL_SUBMISSION_V3_3.md). An independent GitHub approval and authenticated Portal submission are still required. Do not infer steward endorsement or a submitted Portal entry from this README.

## Prior versions

V2 [`v2.0.2`](https://github.com/GIFTEDLOV/eventsure/releases/tag/v2.0.2) was attestor-backed and not independently evidence-verifying. V3.1 was the earlier live public-web version; V3.2 deployed but failed a live consensus resolution because validators disagreed with byte-exact comparison. V3.3 preserved previous provenance and fixed material-outcome comparison, then demonstrated both real verdict paths.

Built on the GenLayer Intelligent Contract model; inspired in part by [GenLayer Intelligent Oracle](https://github.com/genlayerlabs/intelligent-oracle). Independent research software, not endorsed or certified by the GenLayer Foundation.
