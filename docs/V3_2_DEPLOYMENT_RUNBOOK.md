# EventSure V3.2 — guarded Studionet deployment

**Status: NOT DEPLOYED.** This is the deployment procedure for the V3.2 contract, frozen at SHA-256 `9cc30efa9d1107afc30eb1e94d3d6b8cd0671f57f810c17d3801d6dba688b02f`.

## Minimum owner action

Provide a **funded Studionet-only signer** as GitHub Actions repository secret named `EVENTSURE_PRIVATE_KEY` in [GIFTEDLOV/eventsure](https://github.com/GIFTEDLOV/eventsure) under Settings → Secrets and variables → Actions. Never send a private key in chat, an issue, a commit, or a non-secret variable. GenLayer Studionet is chain ID 61999, endpoint `https://studio.genlayer.com/api`, and has a built-in faucet in Studio.

Normal pushes to `release/eventsure-v3.1` execute a safe workflow that checks only **whether** the secret exists, without revealing its value. No regular commit deploys anything. A deployment requires an additional explicit push by `GIFTEDLOV` with marker `[DEPLOY_V3_2]` in the commit message. The user has authorized Studionet deployment, but a secure signer is still essential.

## Deployment guards

- Pin exact V3.2 bytes before signing. Verify chain ID 61999, branch, key format and authorization guard.
- Write a local journal **before** broadcast. Output a transaction hash and the resulting public address if supplied by GenLayer.
- Confirm FINALIZED and successful execution, on-chain source byte parity, 14 public methods and `contract_info.version=3.2.0`.
- Upload the non-secret journal and proof to GitHub Actions artifacts, including on failure. **Reconcile an uncertain broadcast before any rerun**, because fresh GitHub-hosted runners do not retain the old journal.
- Never mutate historical V2/V3.1 source or deploy under the V2 address.

## Independent live qualification required

The on-chain deployment receipt only proves contract existence and code identity. A complete V3.2 qualification must execute a real case lifecycle with frozen independently published evidence, wait for the deadline, resolve under GenLayer validators, verify successful finalized transactions and actual state, and preserve evidence URLs, timestamps, source hashes, tx hashes, receipts and verdict. Inconclusive results must be reported honestly. One plausible historical evidence scenario is Apollo 11's 1969 Moon landing, documented independently by NASA and the U.S. National Archives; verify raw-fetch reachability and semantic evidence before using it. Neither a known historical fact nor a positive mocked test automatically establishes a positive V3.2 on-chain verdict.

## Remaining gates

Independent review of outstanding publisher independence, redirects and timestamp provenance; real testnet qualification; GitHub review approval and protected merge; exact-main CI; Vercel production binding to the newly verified contract; browser wallet E2E; GenLayer Portal submission. Until these pass, retain the `NO-GO` status for production qualification.
