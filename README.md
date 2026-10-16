# EventSure v2 — Intelligent Attestation Protocol

**Production:** https://eventsure-studionet.vercel.app
**Contract:** https://explorer-studio.genlayer.com/address/0x5386AbB113Fb21868982a0d382E6abA6244DE617

EventSure allows any account to register a milestone, freeze its conditions, and designate an attestor who can commit timestamped immutable evidence. An independent GenLayer validator set evaluates the attestor's claim against frozen rules. A positive verdict **does not independently prove that an off-chain event occurred**.

## Frozen release

- Network: Studionet, chain 61999; RPC https://studio.genlayer.com/api
- Deployed contract: 0x5386AbB113Fb21868982a0d382E6abA6244DE617
- SHA-256: 1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14
- ABI: 10 public methods (4 writes, 6 reads)
- GenVM: v0.6.0-rc6, pinned py-genlayer digest 1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6
- Frontend SDK: genlayer-js 1.1.8
- Final canonical evidence: deployments/STUDIONET_V2_PROOF.json

## Workflow

1. Connect a compatible EIP-1193 wallet to Studionet.
2. Create a milestone with a unique identifier, title, immutable requirement and rule, deadline, and attestor.
3. The event creator freezes the conditions before the deadline.
4. The attestor commits one evidence record, signed on-chain before expiry.
5. Any signer can request consensus resolution after evidence is recorded.
6. Inspect the final verdict, original evidence SHA-256, and append-only audit.

Browser-wallet write paths are implemented, but end-to-end signing by every third-party wallet is **not** independently qualified. Canonical blockchain qualification used a test-only GenLayerJS signer.

## Reproduce

Node.js 24 and Python 3.12+.

- Python: python -m unittest discover -s tests -v
- GenVM: GENVM_VERSION=v0.6.0-rc6 genvm-lint check contracts/EventSureV2.py
- Frontend: cd web && npm ci && npm test && npm run build
- Chain parity: node scripts/verify_studionet.mjs (after installing genlayer-js 1.1.8 for the root script)

The GitHub Actions workflow performs Python unit tests, source parity, frontend tests, npm audit, production build, and GenVM checks.

## Provenance and limitations

This is the **cloud-reconstructed version**. It is not byte-identical to the original, unavailable Windows EventSure source (historical SHA-256 a53f7db43dd44b894a5e48b720ddf748e369c0fc3bc58d3b3a66f8dde8f7ea75). Recovered V1 was deployed separately as evidence, while V2 is the canonical hardened release.

The first exploratory V2 qualification mistakenly attested nine public ABI methods; the deployed V2 ABI has ten. That historical attempt remains on-chain but is excluded from canonical qualification. The final V2 case correctly identifies ten methods, verified against the chain before submitting evidence.

No frontend wallet secret or test signer private key belongs in the repository. See docs/SECURITY.md, docs/ARCHITECTURE.md, and docs/ATTRIBUTION.md.

