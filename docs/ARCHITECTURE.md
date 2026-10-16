# Protocol architecture

Lifecycle: CREATE -> FREEZE -> ATTEST -> RESOLVE. Creation is permissionless and stores the creator address; only this creator freezes. Evidence comes only from the frozen event's authorized attestor. Anyone may request resolution once evidence exists.

State: TreeMap event JSON, TreeMap evidence JSON, enumerable event identifiers and append-only audit. Event includes requirement, rule, creator, attestor, deadline, status and finalized assessment. Evidence stores SHA-256, exact bytes, UTC transaction timestamp, chain ID and original content.

Nondeterministic boundary: all admissibility checks are deterministic before invoking the LLM. The model must emit a strict boolean JSON result. Validators independently evaluate the same frozen context. The contract checks exact equality for all material result fields; disagreement aborts rather than silently approving.

UI: Next.js read-only server routes query the actual Studionet contract. On-chain source bytes are SHA checked before download. Browser writes use injected EIP-1193 wallets with an explicit chain ID check. No server signing secret is required.

The canonical release case is `EVS-HARDENED-V2-FINAL-20261016`. The earlier exploratory case with a nine-method attestation remains readable in chain history but is excluded from V2 qualification. The dashboard labels it as historical/exploratory.

Canonical contract: contracts/EventSureV2.py. Historical recovered V1 is included for provenance, never as the active release.

