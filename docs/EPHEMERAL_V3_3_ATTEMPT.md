# EventSure V3.3 — one authorized Studionet deployment attempt

The user has explicitly authorized full completion and deployment. V3.3 was developed to remediate the validator material-equivalence problem in V3.2's finalized, unsuccessful live resolution. The V3.2 contract and audit trail are preserved.

V3.3 source: `contracts/EventSureV3_3.py`, frozen SHA-256 `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd`.

This commit activates **exactly one** testnet deployment attempt through an ephemeral gasless signer and the guarded workflow `.github/workflows/deploy_ephemeral_v3_3.yml`. No production funds or network are authorized, no signing key can be committed, and no retry will occur without reconciliation. SUCCESS requires FINALIZED on-chain transaction, byte parity, 14 public methods, correct contract identity and preserved receipt.
