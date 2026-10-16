# Canonical V2 deployment

EventSure V2 is deployed on GenLayer Studionet. This release uses the cloud-reconstructed V2 repository, not the earlier Windows EventSure V1 source.

| Field | Verified value |
| --- | --- |
| Network | Studionet |
| Chain ID | `61999` (`0xf22f`) |
| RPC | [https://studio.genlayer.com/api](https://studio.genlayer.com/api) |
| Explorer | [Studionet explorer](https://explorer-studio.genlayer.com/) |
| Contract | [`0x5386AbB113Fb21868982a0d382E6abA6244DE617`](https://explorer-studio.genlayer.com/address/0x5386AbB113Fb21868982a0d382E6abA6244DE617) |
| Source | `contracts/EventSureV2.py` |
| Source SHA-256 | `1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14` |
| Source bytes | `9914` |
| Pinned runner | `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` |
| SDK used for verification | `genlayer-js@1.1.8` |

The source file is pinned to raw bytes by `.gitattributes`. This preserves the deployed fingerprint on Windows checkouts as well as Linux CI.

## Public contract methods

The deployed schema exposes exactly ten methods:

`contract_info`, `create_event`, `freeze_event`, `get_audit`, `get_audit_count`, `get_event`, `get_event_ids`, `get_evidence`, `resolve`, and `submit_evidence`.

## Deployment and qualification transactions

The compatible GenLayerJS client read each stored transaction and waited for `FINALIZED`. All five receipts show majority agreement, successful leader execution, an agreeing validator vote, and successful validator execution.

| Stage | Transaction | Status | Consensus / execution |
| --- | --- | --- | --- |
| Deploy | [`0xededdcf9eb528cb298111fddbde7923abfd2e315de29e4b1addf5c41b3ec365a`](https://explorer-studio.genlayer.com/tx/0xededdcf9eb528cb298111fddbde7923abfd2e315de29e4b1addf5c41b3ec365a) | `FINALIZED` | `MAJORITY_AGREE`; leader and validator `SUCCESS` |
| Create | [`0xcbd1da087c8046a79fa08357929e539e5b5af11355d3d292bc1e32cf8c9f0b2d`](https://explorer-studio.genlayer.com/tx/0xcbd1da087c8046a79fa08357929e539e5b5af11355d3d292bc1e32cf8c9f0b2d) | `FINALIZED` | `MAJORITY_AGREE`; leader and validator `SUCCESS` |
| Freeze | [`0xd25ce16e08af67c9472d21f4e45751c069a587b66e17b5868c6174d4c07e4c09`](https://explorer-studio.genlayer.com/tx/0xd25ce16e08af67c9472d21f4e45751c069a587b66e17b5868c6174d4c07e4c09) | `FINALIZED` | `MAJORITY_AGREE`; leader and validator `SUCCESS` |
| Attest | [`0x0c2b3e19d2d1c948751990be907807d929475e4662c143dc4df43795cab2fb21`](https://explorer-studio.genlayer.com/tx/0x0c2b3e19d2d1c948751990be907807d929475e4662c143dc4df43795cab2fb21) | `FINALIZED` | `MAJORITY_AGREE`; leader and validator `SUCCESS` |
| Resolve | [`0xc20a0e4b03a74e3e7aa1b4862f7a744e460fe1fe142d349420953bd2b0a36650`](https://explorer-studio.genlayer.com/tx/0xc20a0e4b03a74e3e7aa1b4862f7a744e460fe1fe142d349420953bd2b0a36650) | `FINALIZED` | `MAJORITY_AGREE`; leader and validator `SUCCESS` |

The deploy transaction is historical provenance. Do not run `scripts/deploy_canonical.mjs` as part of verification or submission; the canonical contract must not be redeployed.

## Canonical qualification state

- Event: `EVS-HARDENED-V2-FINAL-20261016`
- Status and verdict: `RESOLVED` / `ATTESTATION_SUPPORTED`
- Creator and authorized attestor: `0x9ee0bf523819b6b153faecff8ae466078d0a9e65`
- Frozen deadline: `2026-10-16T23:22:24.907Z`
- Evidence SHA-256: `18387b3a1f87e73df5336f06d0897c538b0aa88404606300f1b006c4091ed3fd`
- Evidence length: `519` UTF-8 bytes
- Evidence timestamp: `2026-10-16T11:23:41.134972Z`
- Assessment digest: `69a1a6c9d9a385fb44ff5e7f567d560df211b6bc7b5ab66560e229cffb6ca6ea`
- Canonical audit actions: `CREATED`, `FROZEN`, `ATTESTED`, `RESOLVED`
- Total contract audit entries: `8` (includes the earlier exploratory event)

The earlier event `EVS-HARDENED-V2-20261016` is real historical chain state, but its exploratory evidence described nine ABI methods. It is explicitly excluded from the canonical V2 release qualification.

## Read-only verification

Run `npm ci` at the repository root, then `npm run verify`. The verifier checks the RPC chain ID, deployed source bytes and SHA-256, exact ABI names, canonical event and evidence, audit actions, and transaction finality and execution. It submits no transactions.
