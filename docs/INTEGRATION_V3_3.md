# Integrating EventSure V3.3

**Contract-first reusable verification primitive** on GenLayer Studionet (chain ID `61999`).

- Address: `0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0`
- Frozen code SHA-256: `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd`
- Explorer: https://explorer-studio.genlayer.com/address/0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0
- RPC: `https://studio.genlayer.com/api`
- On-chain source verifier: `node scripts/verify_v3_3.mjs`

## Example: create a verification case from another application

```js
import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";

const contract = "0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0";
const client = createClient({
  chain: studionet,
  endpoint: "https://studio.genlayer.com/api",
  provider: window.ethereum,
  account: walletAddress, // address authorized by the user's wallet
});

// Two distinct source groups, a future UTC deadline, and no mandatory attestors.
// The contract stores case-specific frozen criteria; this source is not redeployed.
const tx = await client.writeContract({
  address: contract,
  functionName: "create_case",
  args: [
    "MILESTONE-2026-001",
    "Public milestone assessment",
    "Was the promised open-source release published before its deadline?",
    "Require two independently published dated sources showing the same release.",
    "2026-12-31T23:59:59Z",
    JSON.stringify([
      "https://publisher-one.example.org/releases/1",
      "https://publisher-two.example.net/announcements/1"
    ]),
    JSON.stringify([]), // optional authorized attestor addresses
    0n                    // numeric attestor quorum
  ],
});
```

*Example domains above are placeholders, not verified live sources.*

## Lifecycle

1. Any wallet can `create_case`; the **creator** may `freeze_case` while still before the deadline.
2. Configured attestors can optionally `attest` before the frozen deadline; if quorum > 0, all required records must be submitted.
3. After the event deadline, any wallet can `resolve_case`. The contract fetches frozen URLs during GenLayer nondeterministic execution and validators repeat evaluation; failure to substantiate both sources and time should yield `INCONCLUSIVE`.
4. Up to eight distinct wallet addresses can `challenge_case` during the first 24-hour challenge window. These identities are wallet addresses, not proof of unique human challengers.
5. After the challenge deadline, any wallet may `reconsider_case`; it compares original excerpt hashes against the new source fetch and downgrades changed public evidence to `INCONCLUSIVE`.
6. If the state is `PRELIMINARY` and its challenge deadline has passed, any wallet can `finalize_case`.

## Public API

Writes: `create_case`, `freeze_case`, `attest`, `resolve_case`, `challenge_case`, `reconsider_case`, `finalize_case`.

Views: `contract_info`, `get_case`, `get_case_ids`, `get_attestation`, `get_challenge`, `get_audit_count`, `get_audit`.

The frontend's read-only routes `/api/v3/state` and `/api/v3/source` provide a public convenience layer; third-party applications can query the Intelligent Contract directly using the GenLayer SDK.

## Security and interpretation

A `VERIFIED` result means the specific frozen sources and time were judged sufficient by GenLayer validators, **not** independently established ground truth. Source ownership is imperfectly inferred from domains, so separate domain groups are not evidence of genuinely independent publishers. Sources can drift or be unavailable; the user-selected question/rule can bias outcomes. The eight-slot public challenge mechanism is not Sybil resistant. Avoid relying on these outcomes for high-value irreversible financial settlement without additional controls and independent audit.

This is **Studionet research software**. It is not an endorsement by the GenLayer Foundation, and this integration guide does not establish mainnet or Portal qualification.

## V3.3 material equivalence

V3.3's leader and validators independently retrieve the frozen web evidence and independently judge the material VERIFIED/INCONCLUSIVE outcome. Validator comparison no longer requires byte-for-byte identity of independently obtained HTML or LLM vote metadata. The audit trail still includes the leader's source excerpt hashes. Divergent positive-versus-negative material decisions fail closed. Live qualification and independent audit are still required.
