# GenLayer Portal submission checklist — EventSure v2

Canonical contract 0x5386AbB113Fb21868982a0d382E6abA6244DE617 on GenLayer Studionet, chain 61999.

Canonical live case EVS-HARDENED-V2-FINAL-20261016; verdict ATTESTATION_SUPPORTED; on-chain technical status OK, stored RESOLVED, audit count 8 (includes excluded exploratory first V2 case). All five canonical deployment/qualification transactions are FINALIZED and listed in ../deployments/STUDIONET_V2_PROOF.json.

Source SHA-256 1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14.
Frontend: https://eventsure-studionet.vercel.app.
Source: https://eventsure-studionet.vercel.app/api/source.

Explicit trust disclaimer: this verdict evaluates an attestor assertion; it is not independent confirmation that an external event happened.

Local release checks: 35 Python contract/security tests and 17 frontend tests passed; GenVM lint, semantic validation, schema, and typecheck passed; frontend build passed; manifest/source parity passed; npm audits reported zero vulnerabilities; read-only Studionet verification confirmed the canonical source, ABI, event, audit, and five finalized transactions. See [TESTING.md](TESTING.md) for the actual local commands and results.

Public source repository: https://github.com/GIFTEDLOV/eventsure (default branch `main`; original `v2.0.0` tag retained). The repository's [release CI runs](https://github.com/GIFTEDLOV/eventsure/actions) and branch rules are the authoritative publication evidence; check the run for the current exact `main` SHA.

The production application is https://eventsure-studionet.vercel.app. Vercel project `eventsure-studionet` is linked to this repository and builds from `web/`.

GenLayer Portal submission: **not submitted**. No submission ID or acceptance is claimed. The authenticated Builder workflow could not be opened in this execution because no browser surface was available. Submit through the authenticated Portal dashboard when that session is available. Provider-wallet browser signing compatibility remains unverified.

Upstream attribution: https://github.com/genlayerlabs/intelligent-oracle (MIT, conceptual inspiration, no copied source).

