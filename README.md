# EventSure — Public Evidence Verification Protocol

**V3.3 is now deployed on Studionet** at `0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0`, [deployment transaction](https://explorer-studio.genlayer.com/tx/0xb799b06e63d934315e2a534be821fad6ae1dc7d62e9d4b129f916282f7927188). Source SHA-256: `63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd`. Deployment FINALIZED/SUCCESS with exact source parity; V3.3 has now completed two real create/freeze/resolve lifecycles with FINALIZED, successful transactions: an [INCONCLUSIVE case](deployments/STUDIONET_V3_3_QUALIFICATION.json) and a distinct [PRELIMINARY / VERIFIED case](deployments/STUDIONET_V3_3_POSITIVE_QUALIFICATION.json) supported by dated NASA and Smithsonian evidence. The positive assessment remains subject to the 24-hour review/challenge lifecycle; it is not yet FINALIZED. V3.2 is preserved below as historical evidence of the failed consensus attempt.

**A reusable GenLayer Intelligent Contract with a companion public application.**

EventSure freezes event criteria, deadlines and public evidence sources, then uses GenLayer validator consensus to evaluate whether a claim is substantively supported. The Intelligent Contract is the product; the website is a developer and end-user interface for it. EventSure provides a common verification primitive for grants, software releases, public commitments, governance and documented milestones without requiring each integrator to deploy a custom adjudicator.

## Historical V3.2 (Studionet; validator disagreement in live resolution)

| Property | Value |
| --- | --- |
| GenLayer network | Studionet, chain ID `61999` |
| Intelligent Contract | [`0x1e373772BfbCB70d63D7274b36B17e763a84210e`](https://explorer-studio.genlayer.com/address/0x1e373772BfbCB70d63D7274b36B17e763a84210e) |
| Contract source | [`contracts/EventSureV3_2.py`](contracts/EventSureV3_2.py) |
| SHA-256 | `9cc30efa9d1107afc30eb1e94d3d6b8cd0671f57f810c17d3801d6dba688b02f` |
| Deployment tx | [`0x9ec31ddb...a6e7`](https://explorer-studio.genlayer.com/tx/0x9ec31ddb100be028720809f9ead6f8e6e8ddaa5a9fe4bf6f4069414ef141a6e7) |
| Deployment validation | **FINALIZED / SUCCESS**, exact on-chain code bytes and 14 public methods verified |
| Proof | [GitHub Actions deployment evidence](https://github.com/GIFTEDLOV/eventsure/actions/runs/38987414077) |
| RPC | `https://studio.genlayer.com/api` |
| Frontend | [`web/`](web/) — responsive landing page and wallet-connected console |
| Published site | https://eventsure-studionet.vercel.app (verify V3.2 promotion before claiming this is the canonical public frontend) |
| Live qualification | Case `EVS-APOLLO-V32-FBC51962F919` — create/freeze passed, resolve FINALIZED with validator disagreement; NO-GO |
| Submission | **NOT SUBMITTED** to the GenLayer Portal |

V3.2 deployed from a fresh temporary account with **zero testnet GEN**, using a GitHub Actions runner; no private key was committed or stored in repository secrets. See `deployments/STUDIONET_V3_2_DEPLOYMENT.json`.

## Why this requires GenLayer

Traditional smart contracts cannot independently evaluate subjective evidence in unstructured public webpages. EventSure uses GenVM's native web retrieval and semantic prompts under validator consensus to assess claims against frozen rules. Deterministic contract logic separately enforces who can freeze, attest, challenge, reconsider and finalize.

```text
Create case → Freeze immutable policy → Optional attestor submissions
                       ↓
             Event deadline expires
                       ↓
 GenVM leader + validators fetch frozen public-source URLs
                       ↓
  Structured semantic agreement + source-excerpt digest agreement
                       ↓
           Preliminary VERIFIED or INCONCLUSIVE
                       ↓
        Challenge window (up to 8 distinct wallets)
                       ↓
  Optional reconsideration → 24-hour review → Finalization
```

The contract supports seven public writes (`create_case`, `freeze_case`, `attest`, `resolve_case`, `challenge_case`, `reconsider_case`, `finalize_case`) and seven public reads (`contract_info`, `get_case`, `get_case_ids`, `get_attestation`, `get_challenge`, `get_audit_count`, `get_audit`). No privileged owner can rewrite a frozen case's policy.

## Reuse it in your own application

See **[developer integration guide](docs/INTEGRATION_V3_2.md)** for contract methods, wallet SDK usage, required argument formats and the review lifecycle.

The companion app provides a landing page (`/`), verification dashboard (`/app`), public case registry and source/audit routes (`/api/v3/state`, `/api/v3/source`). Integrators can call GenLayer directly without using the app.

## Reproducible checks

```sh
npm ci
python -m unittest discover -s tests -v
npm --prefix web ci
npm --prefix web test
npm --prefix web run build
node scripts/verify_v3_2.mjs
```

GenVM validation uses `genvm-lint check contracts/EventSureV3_2.py` against the compatible pinned GenVM runner. GitHub Actions also builds the web app, checks dependencies, verifies original V3.1 provenance and captures actual desktop and mobile Chromium screenshots.

## Trust boundaries

**VERIFIED is not a guarantee of objective external truth.** It means the frozen sources and event timing were judged sufficient under the frozen policy by GenLayer's validator consensus. Domain diversity is not proof of publisher independence. Creator selection and framing can introduce bias. External websites may be unreachable, change content, redirect, misstate publication times or contain adversarial text. Excerpt hashing binds validator input to the decision but does not prove archival authenticity. Challenge slots are limited to eight addresses and are not Sybil resistant. No third-party security audit, escrow/payment integration or production-network qualification exists.

For any missing, contradictory, untimely or unsafe evidence, show `INCONCLUSIVE` or a failed transaction honestly. **Never invent a positive on-chain decision.**

See [V3.2 threat model](docs/SECURITY_V3_2.md), [original audit](docs/EVENTSURE_V3_AUDIT.md), and [Project Track release status](docs/PROJECT_TRACK_V3_2.md).

## Previous deployments preserved

- V2 attestation-only contract, tag [`v2.0.2`](https://github.com/GIFTEDLOV/eventsure/releases/tag/v2.0.2).
- V3 original live source-retrieval attempt failed during resolution; retained for provenance.
- V3.1 Studionet contract `0x13Bc702936d8d7Bd5880d4A16119690149D3D4c7`; historical source/verifier preserved.

EventSure is independent testnet research software. Inspired in part by [GenLayer Intelligent Oracle](https://github.com/genlayerlabs/intelligent-oracle) under its MIT license. No GenLayer approval or mainnet readiness is implied.
