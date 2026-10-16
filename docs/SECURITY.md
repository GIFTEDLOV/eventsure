# Security assessment

## Trust boundary

The result is consensus about an **authenticated attestor assertion**, not independent external-world fact proof. A dishonest attestor may produce a false claim that validators find linguistically consistent. Policy consumers must account for that dependency.

## Controls

- Permissionless event creation; the creator is recorded from the chain sender.
- Frozen rule changes are impossible after creator-only freeze.
- Unique event identifiers; no second creation under the same ID.
- Authorized-attestor-only, single evidence submission before a true chain deadline.
- Recorded evidence has exact UTF-8 byte length, SHA-256, chain ID, sender and timestamp.
- Resolution checks evidence identity and frozen context before AI execution.
- Independent validator assessment compares the full bounded result (not only JSON shape).
- Technical errors and validator disagreement fail closed; unsupported claims become INCONCLUSIVE.
- Append-only audit of create/freeze/attest/resolve.
- Wallet and frontend require chain 61999; the contract is authoritative for every role.
- Exact deployed-source hash verified by the source-download endpoint.

## Remediated weaknesses

HIGH: V1 single temporary deployer wallet restriction -> independent creators in V2.
MEDIUM: V1 OCCURRED_ON_TIME potentially overstates attestation trust -> V2 ATTESTATION_SUPPORTED.
MEDIUM: V1 loose event ID and zero-address attestor checks -> strict V2 validation.
MEDIUM: Freeze allowed after deadline -> rejected in V2.
MEDIUM: First V2 test attestation claimed nine methods instead of ten -> canonical final V2 qualification independently checks actual ABI method count and attests ten.
MEDIUM: RPC HTML returned during receipt polling -> journal-based transaction recovery; never rebroadcast uncertain hashes.

## Residual risks / honest limits

- Attestor can lie; validators assess consistency, not real-world provenance.
- LLM semantic decisions may be wrong even with validator consensus.
- Globally unique event IDs may be front-run/squatted; UI generates high-entropy random IDs.
- Rate-limits, network finality and front-end provider differences can affect availability.
- Zero-production-value audit: testnet only, no production economic guarantees.
- EIP-1193 browser-wallet writes need broader cross-provider end-to-end testing.
- V1 test signer resides in expiring historical cloud snapshots; V2 requires no deployer-controlled admin after deployment.
- Test harness uses a mock GenVM runtime; real canonical V2 live qualification independently succeeded. Fuzz and professional external auditing are not claimed.

## Secret handling

Never commit wallets, secrets, private keys, .env files, seed phrases, or recovered snapshot content. Public code and CI never require or embed a private key. No mainnet operations are permitted by this repository's scripts.

