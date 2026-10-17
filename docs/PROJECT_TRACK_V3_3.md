# EventSure V3.3 — GenLayer Project Track

**Release status:** On-chain deployment and conservative semantic consensus qualified. Both live verdict paths have now succeeded; protected GitHub publication remains outstanding.

## Product
EventSure is a reusable GenLayer Intelligent Contract that freezes distinct authoritative public sources, verification rules and deadlines, then has GenLayer validators independently fetch and semantically assess them. Its deterministic lifecycle supports optional attestor quorum, public challenges and reconsideration. A professional landing page and wallet console are provided as optional interfaces.

## Contract provenance
- Studionet chain ID `61999`
- Address `0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0`
- Frozen source `contracts/EventSureV3_3.py`
- SHA-256 `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd`
- Deployment tx `0xb799b06e63d934315e2a534be821fad6ae1dc7d62e9d4b129f916282f7927188` — FINALIZED / SUCCESS, exact deployed-code parity
- Seven write and seven read methods

## Live case
- Case ID: `EVS-APOLLO-V33-53368258196A`
- Sources: NASA Apollo 11 mission, Smithsonian National Air and Space Museum
- Create: `0xa61ab77558acad81b766faa6e7cb1775136bb2e529f315c562a01441b748fa12`
- Freeze: `0xe694ee8b19d612fe6f3154a5bb554e794a826d9ba3f3dc1be1ed2d2e36730edd`
- Resolve: `0x35486954ec65ba41f2d2bb9ced83102af92b1fe9717e1683d4cd2b7ce2f60469`
- All three FINALIZED with successful execution; resulting state `PRELIMINARY`, verdict `INCONCLUSIVE`.
- Evidence JSON: `deployments/STUDIONET_V3_3_QUALIFICATION.json`
- Qualification run: https://github.com/GIFTEDLOV/eventsure/actions/runs/39010624241

## Positive GenLayer qualification
- Case `EVS-APOLLO-POS-V33-E453D2D5E670`, PRELIMINARY / VERIFIED
- Create `0x60277b68d7ceb22f4c4d03d2749f1ffa5cf9eddfa57e5b1ddca08ca400d8c723`
- Freeze `0x73b07c22541ae8382368ac672ce5c6201b10cd9a4dfe819243e4aae0411230e9`
- Resolve `0xe4aa025673ebc30c22a9771da92ebab5c29c7ca4b6ce7b700ed45ece8682da53`
- All FINALIZED/SUCCESS, two supporting sources and time corroborated
- Evidence `deployments/STUDIONET_V3_3_POSITIVE_QUALIFICATION.json`

## App
- GitHub: https://github.com/GIFTEDLOV/eventsure
- Website: https://eventsure-studionet.vercel.app (confirm production source parity and exact-main GitHub merge before describing it as a V3.3 release)
- Separate landing page and /app experience; /api/v3/state and /api/v3/source are read-only views of chain state and source code.

## Outstanding release gates
A positive PRELIMINARY/VERIFIED case was recorded with dated NASA and Smithsonian sources; it is not final until the challenge period passes. Broader independent security review and third-party-wallet E2E also remain outstanding. Pull request #1 must pass protected main approval. Authenticated GenLayer Portal submission has **not** occurred.

## Source trust limits
Publisher independence is not proven solely by distinct domains. Historical date proof, mutable pages, excerpt truncation, prompt injection, and Sybil-saturated public challenges remain material risks. An AI consensus decision is not objective ground truth. No escrow, payout or mainnet deployment is claimed.
