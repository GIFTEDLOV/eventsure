# EventSure V3.2 security candidate (UNDEPLOYED)

This work follows issue #2 and is a **contract-first, unqualified candidate**. It does not change frozen V3.1 source, Studionet contract, V2 release, or the production site's current contract binding. Never represent V3.2 as deployed or qualified until distinct on-chain evidence exists.

## Changes

- Multiple first-party-independent account challenges (up to eight distinct senders per case) during one frozen challenge window. Reconsideration waits until the original challenge window ends and examines all objections. One wallet cannot consume every slot; coordinated Sybils can still exhaust capacity.
- Consensus payload binds exact first-4500-character source excerpts and challenge excerpts using SHA-256 digests. Validator agreement on a yes/no vote alone is no longer sufficient. Reconsideration with drift in any original frozen source excerpt is forced INCONCLUSIVE.
- Authorized attestation texts, senders and content hashes enter semantic context, rather than providing only a numeric attestation count; an explicit semantic consistency vote is mandatory to yield VERIFIED.
- Ten new mock adversarial test scenarios include multi-party challenges, limits, drift, hostile consensus, contradictory attestation and source-byte disagreement.

## Remaining trust boundaries and release gates

Source-domain diversity remains **not** verified publisher independence. Creator source selection and publisher bias remain. Source excerpts and digests are taken at resolution, not independently notarized before the deadline, and a byte-for-byte source snapshot only proves what validators fetched. HTTPS redirects, DNS rebinding, network access and historical timestamp accuracy require live GenVM integration/adversarial testing. Challenge Sybils and eight-slot capacity remain a governance fairness problem. The AI decision does not independently prove external truth. No automated payouts or escrow are implemented. This candidate must receive runtime validation, independent security review, a **truthful positive live qualification** if available, a new deployment and frontend contract upgrade before merge and release. Preserve protected-branch review and do not publish it as production-ready until all release gates pass.
