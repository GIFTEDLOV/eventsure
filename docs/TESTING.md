# Release verification

This file records checks that were run locally against the recovered V2 release. CI status is reported separately after the exact GitHub `main` commit has completed its workflow.

## Local results

| Check | Result |
| --- | --- |
| Python compilation (`python -m compileall -q contracts tests`) | Pass |
| Contract/security tests (`python -m unittest discover -s tests -v`) | 35 passed |
| Frontend tests (`npm test` in `web/`) | 17 passed |
| GenVM lint (`genvm-lint lint`) | Pass, 3 checks |
| GenVM semantic validation (`genvm-lint validate`) | Pass, 10 methods (6 view, 4 write) |
| GenVM schema (`genvm-lint schema`) | Pass, 10 methods |
| GenVM typecheck (`genvm-lint typecheck`) | Pass, no type errors |
| Combined GenVM gate (`genvm-lint check`) | Pass |
| Manifest and frozen source parity | Pass; source is 9,914 bytes with SHA-256 `1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14` |
| Secret scan of working tree and reachable Git blobs | Pass; no matches |
| Root dependency audit | Pass; 0 vulnerabilities |
| Frontend dependency audit | Pass; 0 vulnerabilities |
| Frontend production build | Pass |
| Read-only Studionet verification | Pass; exact source, ABI, canonical state, audit, five finalized and successfully executed transactions |

The linter reported that a newer runner exists, but the deployed contract remains pinned to its original `py-genlayer` digest. This release does not update or redeploy the canonical contract.

## Repeat locally

```powershell
npm ci
npm test
npm audit --audit-level=high
npm --prefix web ci
npm --prefix web audit --audit-level=high
npm --prefix web test
npm --prefix web run build
node scripts/check_manifest.mjs
python scripts/secret_audit.py
$env:GENVM_VERSION = "v0.6.0-rc6"
genvm-lint check contracts/EventSureV2.py
genvm-lint schema contracts/EventSureV2.py
genvm-lint typecheck contracts/EventSureV2.py
npm run verify
```

`npm run verify` performs read-only network calls. It does not deploy or write to Studionet.
