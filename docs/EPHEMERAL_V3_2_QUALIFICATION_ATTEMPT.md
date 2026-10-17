# EventSure V3.2 — real-public-evidence qualification attempt

The V3.2 contract is deployed on Studionet at `0x1e373772BfbCB70d63D7274b36B17e763a84210e`, source SHA-256 `9cc30efa9d1107afc30eb1e94d3d6b8cd0671f57f810c17d3801d6dba688b02f`.

This commit authorizes **one** independent GenLayer V3.2 qualification using a temporary unpersisted signer. It must create and freeze a real case using published NASA and Smithsonian documents, wait for the case deadline, then submit a validator-evaluated resolution and record actual receipts. No outcome is assumed. If the result is `INCONCLUSIVE` or execution fails, publish that fact instead of inventing a positive result.

Workflow: `.github/workflows/qualify_v3_2_ephemeral.yml`; script: `scripts/qualify_v3_2_ephemeral.mjs`.
