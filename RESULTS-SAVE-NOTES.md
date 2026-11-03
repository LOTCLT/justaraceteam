# Results-save investigation

A race night was reported to stall after round 10 when entering the next round's results. There is no configured ten-round limit. The reported live room could not be inspected because this execution environment's proxy denies the database destination. No live room data was reset or repaired.

Two real Firebase SDK/emulator nights reached round 16: one with two players, and another with four players reduced to three at round 11. These exercise results submission, generated rewards, guest choices, upgrade application and next-round transitions with the actual database rules. They do not establish the cause of the reported room-specific problem.

## Changes

- Results saving now displays a pending state and blocks repeated submissions until the attempt completes.
- Asynchronous read failures are caught and shown in the results form; the finishing order remains available for retry.
- The submitted round, race, car, roster and room code come from the same captured snapshot.
- A room change during the read cancels the submission before starting a write.
- Previously silent rejections now explain changed rounds, roster changes, existing results/upgrade rolls, non-racing phases or loss of the host connection.
- Existing results and upgrade rounds remain protected against accidental replacement. No Firebase rule or game-rule changes are included.

The host should refresh, resume the same room and retry. If it remains blocked, the exact message or an owner-exported JSON snapshot of that room is needed to finish diagnosis. Do not reset the room to test this update.

## Checks

`node tests/v9.mjs` includes round-11 successful saving, failed reads, stale round/phase/host state, existing upgrade protection and duplicate-click coverage, alongside the existing gameplay regressions.

For the real SDK integration test, install `firebase@12.17.1` outside the checkout and set `FIREBASE_SDK_DIR` to that installation's `node_modules/firebase` directory. From the repository root:

```sh
firebase emulators:exec --only database --project demo-justaraceteam --config firebase.emulators.json 'node tests/long-night.mjs'
```

The test requires the local database emulator at `127.0.0.1:9000`, uses synthetic emulator identities, and runs only against a demo project. In environments where the Node Firebase WebSocket client ignores NO_PROXY, unset HTTP_PROXY/http_proxy/HTTPS_PROXY/https_proxy for this local test command only. No application dependencies or production authentication are needed.
