# EventSure — Public Evidence Verification on GenLayer

EventSure is a **contract-first, reusable Intelligent Contract and companion dApp**. The canonical V3.1 release directly retrieves frozen public evidence, asks GenLayer validators to independently evaluate a bounded semantic decision, allows objections, and finalizes only after a review window. Its frontend provides a dedicated public landing page and wallet-connected verification console.

Website: https://eventsure-studionet.vercel.app
GitHub: https://github.com/GIFTEDLOV/eventsure
Canonical Studionet contract: 0x13Bc702936d8d7Bd5880d4A16119690149D3D4c7
Chain ID: 61999
RPC: https://studio.genlayer.com/api
Canonical source SHA256: 0fe025b631642094a3f86d49b6d928ba76a00c1af1102a2699036fb959a97acb

## Protocol

CREATE → FREEZE → optional ATTEST → RESOLVE (contract-side public web retrieval + GenLayer validator consensus) → PRELIMINARY → optional CHALLENGE and RECONSIDER → FINALIZE (24-hour review period).

Anyone may create a case with distinct public evidence sources, a frozen question, deadline, verification rule, and optional attestors (up to 5, configurable quorum). No operator controls an admin key. The contract, not the frontend, retrieves web evidence and performs judgment. Two or more sources must substantiate the claim and its timing for VERIFIED. Failure or insufficient evidence must not be represented as verified truth.

V2 was a weaker attestation-only prototype. V3 introduced web retrieval but failed the first live resolution due to an SDK Response.status_code mismatch. V3.1 fixes this issue; each release has a separate deployed contract and immutable source hash.

## Develop

- Python 3.12+, Node.js 24.x.
- Python tests: python -m unittest discover -s tests -v
- GenVM validation: GENVM_VERSION=v0.6.0-rc6 genvm-lint check contracts/EventSureV3_1.py
- Frontend: cd web && npm ci && npm test && npm run build
- Public routes: /, /app, /api/v3/state, /api/v3/source
- Provenance: node scripts/verify_v3_1.mjs (root dependencies installed)

Refer to docs/EVENTSURE_V3_AUDIT.md and docs/PROJECT_TRACK_V3_1.md.

## Cautions

This is testnet research infrastructure. Website diversity is not the same as independent ownership of publications. Public documents can be unavailable or misleading; LLM and validators can disagree. The first challenge can monopolize a case's challenge window. No escrow or payout integration is provided. Any unqualified live resolution must be recorded as such. Do not submit private information as public on-chain evidence. Wallet support requires end-to-end checks with each provider.

Conceptual inspiration: GenLayer Labs Intelligent Oracle (MIT), https://github.com/genlayerlabs/intelligent-oracle.

