# EventSure V3.2 — explicit one-shot ephemeral Studionet attempt

User authorized the full EventSure deployment and requested cloud execution without Codex or manually configuring signing secrets. This marker authorizes **one** GitHub Actions testnet deployment attempt from the frozen V3.2 source (`9cc30efa9d1107afc30eb1e94d3d6b8cd0671f57f810c17d3801d6dba688b02f`) using an ephemeral, nonpersisted signer. It does not authorize any production-network transaction or uncontrolled retry.

The result (success, failure, or uncertainty) must be reconciled against GitHub Actions receipts and on-chain state. No deployment claim is valid without a FINALIZED successful receipt and exact byte parity.

Workflow: `.github/workflows/deploy_ephemeral_v3_2.yml`. Source: `contracts/EventSureV3_2.py`. Wallet signing key must never be logged, uploaded, or committed.
