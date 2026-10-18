# EventSure V3.3 — post-challenge permissionless settlement of test cases

Current GenLayer Studionet state checked 2026-10-18 07:10 UTC:
- Positive case `EVS-APOLLO-POS-V33-E453D2D5E670` PRELIMINARY / VERIFIED, challenge_count=0; challenge deadline 2026-10-18T06:54:59.448570Z passed.
- Disputed case `EVS-APOLLO-V33-53368258196A` CHALLENGED / INCONCLUSIVE, challenge_count=1; original challenge deadline 2026-10-18T06:42:37.256643Z passed.

The owner previously authorized completion of remaining EventSure Studionet tasks, and confirmed Studionet is now working. This commit activates one **guarded one-time attempt each** for already prepared finalized-positive and challenged-inconclusive contract workflows.

- `[AUTO_FINALIZE_V33]` uses `scripts/finalize_v3_3_positive.mjs` and only finalizes if the positive case remains PRELIMINARY/VERIFIED with no challenges and deadline elapsed.
- `[AUTO_RECONSIDER_V33]` uses `scripts/reconsider_v3_3_challenge.mjs` and only executes if the separate challenge case remains CHALLENGED with the original deadline expired.

Both use temporary Studionet-only signing accounts and must journal the transaction and actual receipt. No arbitrary rerun or contract redeployment permitted. Do not claim either success without FINALIZED / successful execution and state readback. Historical evidence preserved.