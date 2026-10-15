# V9 local update

Implemented on the repository's V8.2 baseline. Realtime Database rules were deployed and verified on October 15, 2026; the website is published through GitHub Pages.

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

The deployed rules are tracked in firebase-rules.json. The original V8.2 rules are saved in backups/firebase-rules.v8.2.json. Firebase configuration targets the existing justaraceteam-c53eb project and only Realtime Database rules; website hosting remains GitHub Pages.

The original per-roll write grant rejected V9's atomic decisions transaction. The deployed update allows an existing player to write their own decisions object only during the active round's unresolved upgrade phase. Saved choices cannot be changed/deleted by that player, unknown decision keys are rejected, and the keep limit is enforced. Existing room/host/player/reconnect rules remain unchanged.

Live verification on October 15, 2026:

- Firebase rules dry run passed; fetched deployed rules match the local file.
- Isolated Edge browser sessions completed two- and four-player flows against the real backend: create/join, start, results/rewards, guest decisions, shared readiness, queued race preview, host apply, undo/redecide, and exact queued next-race transition.
- Guest attempts to overwrite a locked answer, change another player's decision, change a host field, write an unknown decision key, and exceed the keep limit were denied.
- Inspected the phone-sized upgrade screen and queued map preview.
- Test rooms were removed. No existing game rooms were modified.

The local test suite also checks three-player rewards and reconnect behavior. A live three-player session, reconnect/reload behavior, and final recap are still useful game-night checks.

Use a test room with separate browsers/devices and 2, then 3, then 4 players:

1. Start, refresh/reconnect the host and an original player, and try joining as a new player after start.
2. Enter results, edit their order, then roll upgrades. Check points/rewards and that editing is locked afterward.
3. Pass one third-place roll and apply the other; in another round apply first and verify the other automatically passes. Verify fourth place can apply both. Repeated taps must not change saved answers.
4. Queue a race before everyone is ready. Current race/round/garages must stay unchanged; the preview must stay locked.
5. Apply upgrades, undo, verify garages restored and decisions reopened, then reapply. Start Next Race and verify the exact queued event and no undo availability.
6. End the night and check recap totals. Return home and Resume using the same browser.
7. Check phone layouts, horizontal Build Comparison scrolling, and current/queued map pins.

The four existing site files are the deployment files. The Node test file is development-only and adds no browser dependency.
