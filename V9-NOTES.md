# V9 local update

Implemented on the repository's V8.2 baseline. No deployment or Firebase rules changes were made.

- Rewards exclude Tier 0 and the exact installed option. Category/mod weighting is unchanged; lower tiers remain possible and resolve automatically as KEEP.
- Meaningless rolls need no decision. Apply/Pass locks immediately after saving; third-place Apply atomically passes the other roll. Fourth-place choices remain independent.
- Everyone sees readiness and waiting names. The host can apply only when required choices are complete.
- Get Next Race queues one immutable preview during upgrades. Start Next Race consumes that race; without a preview it chooses a race at that point. Track selection remains equal per track and avoids an immediate repeat.
- Edit Results prefills the order and is allowed only before upgrade generation.
- Undo Applied Upgrades restores one pre-upgrade garage snapshot and clears decisions/applied results, retaining the original rolls and queued race. Starting the next race expires undo.
- Resume Race Night uses the last room stored in this browser and its existing anonymous Firebase identity. Browser storage failures do not prevent normal play.
- Cards show current/rolled/result and engine/aspiration requirements. Final recap derives wins, podiums and changed upgrades from existing history/upgrade records.

## Local checks

Run from the repository root:

```powershell
Get-Content -Raw script.js | node --input-type=module --check
Get-Content -Raw game-data.js | node --input-type=module --check
node tests/v9.mjs
git diff --check
```

The test harness executes the real client module with a small DOM/Firebase mock. It checks startup/DOM IDs, 6,000 reward samples, 2/3/4-player rewards, decision locking, independent fourth-place choices, sequential application without downgrade, apply/undo, queue/start, Prius conversion dependencies, existing-player/host reconnect, Resume, late-player rejection, and the edit-results cutoff. It does not emulate Firebase security rules, offline retries, network contention, or browser layout.

## Multiplayer check before publishing

The deployed Firebase rules are not present locally. V9 uses Firebase transactions at `rooms/ROOMCODE` for host transitions and `rooms/ROOMCODE/upgradeRounds/ROUND/players/UID/decisions` for player choices. Existing rules must allow the host to read/write its room and players to read/write their own decisions object. If writes are allowed only at individual `roll_1` / `roll_2` children, the atomic decisions transaction needs a corresponding permission at the decisions object. Other players' decisions and host fields must remain protected. Obtain the actual deployed rules before preparing a rules change.

Use a test room with separate browsers/devices and 2, then 3, then 4 players:

1. Start, refresh/reconnect the host and an original player, and try joining as a new player after start.
2. Enter results, edit their order, then roll upgrades. Check points/rewards and that editing is locked afterward.
3. Pass one third-place roll and apply the other; in another round apply first and verify the other automatically passes. Verify fourth place can apply both. Repeated taps must not change saved answers.
4. Queue a race before everyone is ready. Current race/round/garages must stay unchanged; the preview must stay locked.
5. Apply upgrades, undo, verify garages restored and decisions reopened, then reapply. Start Next Race and verify the exact queued event and no undo availability.
6. End the night and check recap totals. Return home and Resume using the same browser.
7. Check phone layouts, horizontal Build Comparison scrolling, and current/queued map pins.

The four existing site files are the deployment files. The Node test file is development-only and adds no browser dependency.
