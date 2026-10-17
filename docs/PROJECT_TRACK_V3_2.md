# EventSure V3.2 — GenLayer Project Track release candidate

**Current status:** Deployed Intelligent Contract, browser UI integration candidate, live semantic qualification pending, protected-main approval outstanding. This file is not evidence of GenLayer endorsement.

## Verifiable primary contract

- Studionet chain ID: `61999`
- Contract: `0x1e373772BfbCB70d63D7274b36B17e763a84210e`
- Source: `contracts/EventSureV3_2.py`
- Source SHA-256: `9cc30efa9d1107afc30eb1e94d3d6b8cd0671f57f810c17d3801d6dba688b02f`
- Deployment: `0x9ec31ddb100be028720809f9ead6f8e6e8ddaa5a9fe4bf6f4069414ef141a6e7`
- Live receipt: FINALIZED, SUCCESS; on-chain source byte parity and 14 public methods verified by GitHub Actions `38987414077`
- Account generated ephemerally in cloud; Studionet balance before deployment: 0 GEN
- Production app: https://eventsure-studionet.vercel.app (verify canonical V3.2 bindings before publishing an updated production qualification claim)

## Why GenLayer

EventSure V3.2 freezes distinct-source URLs, semantic verification rules, an event deadline and optional authenticated attestors. GenLayer validators independently retrieve evidence, bind source excerpt hashes into their consensus result, assess evidence timing and substantive consistency, and produce an on-chain preliminary decision. The contract supports multiple challenges and time-gated reconsideration and finality. The complete app adds a separate landing page, public registry, challenge console and developer integration guide.

## Limits

AI agreement is not ground truth. Publisher independence is heuristically estimated from domains. Source content and redirects can drift; byte matching validates retrieved excerpts, not original publication dates. There are eight challenge slots per case and Sybil challengers can still exhaust the cap. No dispute fees, guaranteed final historical source snapshot, automatic escrow or third-party audit. Real browser-wallet interoperability and a positive VERIFIED live result remain subject to explicit qualification. Do not submit as fully qualified while those gates are open.
