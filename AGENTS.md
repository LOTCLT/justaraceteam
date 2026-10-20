# Just A Race Team — Codex Repository Instructions

## Project purpose

Just A Race Team is a lightweight multiplayer companion website for Forza Horizon 6 random-upgrade race nights.

Live site: `https://justaraceteam.com`  
Repository: `LOTCLT/justaraceteam`  
Default branch: `main`

The app is intentionally simple: plain HTML, CSS, and browser JavaScript with Firebase Realtime Database + Anonymous Authentication. GitHub Pages serves the website.

The product goal is a board-game helper, not full race-management software. Prioritize:
1. Fast transitions between races.
2. Easy phone use.
3. Minimal explanation during play.
4. Strong protection against accidental game-state changes.
5. Clear shared status so everyone knows what the room is waiting on.
6. Useful host controls without over-centralizing routine player actions.
7. Preserving randomness and real Forza car-specific upgrade trees.

## Source of truth

Before changing code, inspect the current repository. Do not reconstruct the project from old chat summaries or generated ZIPs.

Read these first:
- `V9-NOTES.md` — current implemented V9 behavior, verification, and known remaining live checks.
- `script.js` — Firebase/game flow/UI logic.
- `game-data.js` — cars, upgrade definitions, dependencies, races, approximate race-map positions.
- `index.html` — UI structure and DOM IDs.
- `style.css` — responsive styling and race/build color system.
- `firebase-rules.json` — deployed Realtime Database rules.
- `tests/v9.mjs` — regression harness for the real browser module.

The repository's current files and tests are authoritative if this document ever becomes stale.

## Current architecture

Primary browser files:
- `index.html`
- `style.css`
- `script.js`
- `game-data.js`

Backend/config:
- `firebase-rules.json`
- `firebase.json`
- `.firebaserc`

Development:
- `tests/v9.mjs`
- `V9-NOTES.md`
- `backups/`

No build step or package framework is required for the deployed site.

## Deployment

Website:
- GitHub Pages deploys from `main`.
- Custom domain: `justaraceteam.com`.
- Updating `main` can therefore change the live site.

Firebase:
- Project ID: `justaraceteam-c53eb`.
- Firebase Hosting is not used.
- Anonymous Authentication is used.
- Realtime Database stores room/game state.
- Editing `firebase-rules.json` in GitHub does NOT by itself prove the live Firebase rules changed. Rule changes must be deliberately deployed and verified.

For significant work, prefer a branch/PR or other reviewable change rather than blindly editing `main`. Do not push, merge, deploy Firebase rules, or modify live backend state unless the user explicitly asks.

## Core game flow

Lobby
→ Start Game
→ choose/randomize starting car
→ generate race
→ race in Forza
→ host enters finishing order
→ calculate points
→ generate upgrade rewards
→ players lock Apply/Pass decisions where needed
→ host applies upgrades
→ next race
→ End Race Night
→ final standings/recap

Maximum players: 4.

Points:
- 1st = 4
- 2nd = 3
- 3rd = 2
- 4th = 1

Standings derive from `raceHistory`; do not add redundant persistent standings counters unless there is a compelling reason.

Tiebreak order:
1. points
2. wins
3. seconds
4. thirds
5. stable alphabetical fallback

## Upgrade reward rules

- 1st: 0 rolls
- 2nd: 1 roll
- 3rd: 2 rolls, may apply at most 1
- 4th: 2 rolls, may apply both independently

Current V9 behavior:
- Tier 0 / stock/base options never roll as rewards.
- The exact currently installed option also never rolls.
- Lower-tier options may still roll and resolve automatically as KEEP/locked.
- Meaningless results require no Apply/Pass decision.
- A saved Apply/Pass decision is locked.
- For 3rd place, applying one eligible roll atomically passes the other.
- 4th-place choices remain independent.

Do not reintroduce pointless Stock or exact-current-option reward rolls.

## Upgrade tiers and sidegrades

General family:
- Stock/base = Tier 0
- Street = Tier 1
- Sport = Tier 2
- Race = Tier 3

Some Forza trees intentionally skip levels. Do not infer a fake option just because a row starts at Street or Sport.

Important example:
A swapped-engine Supercharger tree can legitimately be:
- Street
- Sport
- Race

Interpret those as Tier 1, Tier 2, Tier 3. Do NOT create a fake Stock reward.

Outcomes:
- higher tier → UPGRADE
- same installed option → NO CHANGE
- same tier, different compatible option → SIDEGRADE
- lower tier → LOCKED / KEEP

The game must never downgrade a retained build through upgrade application.

Some conversion families are sidegrades rather than linear power tiers:
- engine swaps
- drivetrain swaps
- aspiration conversions
- many aero/body-kit choices
- wheel choices

Do not rank engine swaps by engine size. A 6.2L V8 and 1.6L rally-engine swap can be same-tier sidegrades.

## Car dependency system

Cars currently include at least:
- 2024 Ford Mustang GT — A628
- 1986 Honda Civic Si — D253
- 2024 Toyota Prius Prime XSE Premium — C472

The Prius is the reference case for dependent engine/aspiration trees.

Engine swaps can activate unique upgrade trees. Example Prius swaps:
- Stock
- 1.6L I3-T
- 2.5L I6-T
- 1.6L I4 - Turbo Rally
- 3.0L I6 - TT
- 6.2L V8
- 4.8L V10

Rules:
- Only upgrades whose prerequisites are currently satisfied are eligible.
- Swapping engines disables the old engine-specific tree and enables the new one.
- Incompatible retained engine-specific upgrades must be removed/reset when their prerequisite disappears.
- Unrelated chassis, tire, drivetrain, and aero upgrades should remain.
- Aspiration changes likewise remove incompatible turbo/supercharger-specific retained upgrades.
- Variant-specific duplicate mod names need unique internal identity even when the displayed name remains simple.

Do not flatten all cars into one generic upgrade tree.

## Race selection and map

Race randomization is effectively `TRACK_EQUAL`: each individual race has equal odds, not each race category.

Avoid immediate exact race repeats when practical.

Current race families include:
- Street
- Road
- Drag
- Dirt/Rally

Do not add Touge or Cross Country to the random pool or change odds without discussing the rule change.

The site includes an approximate FH6 map marker for each race. The pin is a discovery aid, not exact navigation. Long events use an approximate starting area.

Race color system:
- Street: light blue
- Road: blue
- Drag: pink
- Dirt/Rally: amber
- future Cross Country: green
- future Touge: purple

## Build Comparison

The Build Comparison tab shows current builds in a spreadsheet-like format.

Keep it usable on phones and horizontally scrollable.

For dependent cars, show relevant active branches rather than dumping every possible engine tree. Inactive combinations can display `—`.

Do not remove the underlying garage/dependency information merely to simplify rendering.

## Multiplayer and reconnect invariants

Existing players must be able to reconnect to a started room using their existing anonymous Firebase identity.

New players must NOT be able to join after the game has started.

Do not regress:
- host reconnect
- guest reconnect
- preserving garage/player state across refresh/close/rejoin
- late-player rejection

The home screen also supports Resume Race Night using browser-local room information plus the existing Firebase identity. Local-storage failure should not break normal manual play.

## Current V9 race-night controls

These are implemented and should be preserved unless intentionally redesigned:

- Shared readiness / `Waiting on:` player status during upgrade decisions.
- Host Apply Upgrades enables only when all required decisions are complete.
- Host can queue one immutable next-race preview while upgrades are still being decided.
- Queuing must not advance the current round, mutate garages, or overwrite the current race.
- Start Next Race consumes the queued race exactly.
- If no race was queued, Start Next Race may select one then.
- Edit Results is allowed only before upgrade generation.
- One-step Undo Applied Upgrades restores the pre-upgrade garage snapshot, reopens decisions, and retains the original rolls/queued race.
- Starting the next race expires undo.
- Final screen uses a compact recap rather than a giant visible race-history list.

Keep `raceHistory` in Firebase because standings and recap statistics depend on it.

## Firebase decision model and security

Upgrade decisions live under roughly:

`rooms/<room>/upgradeRounds/round_<n>/players/<uid>/decisions/roll_1`
`rooms/<room>/upgradeRounds/round_<n>/players/<uid>/decisions/roll_2`

Current rules intentionally allow a non-host player to write only their own decision object during the active unresolved upgrade phase.

Important security behavior:
- saved player decisions cannot be overwritten/deleted by that player
- unknown decision keys are rejected
- keep limits are enforced
- players cannot write other players' decisions
- players cannot change host-controlled room fields

If decision writes change from individual writes to an atomic transaction, verify the Firebase rules still permit the exact write shape.

Never loosen room-level rules merely to make a client error disappear.

## Testing requirements

For significant changes, run the existing checks from repo root:

```powershell
Get-Content -Raw script.js | node --input-type=module --check
Get-Content -Raw game-data.js | node --input-type=module --check
node tests/v9.mjs
git diff --check
```

If developing in a non-PowerShell environment, use equivalent Node syntax checks.

Before declaring multiplayer/game-state work complete, reason through or test:
- 2-player flow
- 3-player reward limit
- 4-player independent decisions
- existing-player reconnect
- host reconnect
- late-player rejection
- Stock/Tier 0 exclusion
- exact-current-option exclusion
- sequential same-mod application
- apply/undo/reapply
- queued next-race immutability and exact consumption
- Prius engine + aspiration dependency transitions
- Build Comparison
- phone-sized layout

For Firebase-rule changes, local JS tests are not sufficient. Validate/deploy rules deliberately and perform isolated browser/backend verification when practical.

## Coding conventions

- Prefer small, conservative changes over rewrites.
- Preserve existing DOM IDs unless the associated JS/CSS is updated together.
- Keep browser dependencies minimal.
- Use `textContent` for user/player names and other untrusted text where practical; avoid unnecessary `innerHTML`.
- Keep persistent game counters derived from existing canonical history when possible.
- Do not add a framework/build system unless there is a clear benefit and user approval.
- Keep `game-data.js` focused on game/car/race data and dependency metadata.
- Keep runtime/Firebase/game-flow behavior in `script.js`.
- Keep styling responsive and phone-first.
- Comment unusual game-rule logic, especially dependencies, tier exceptions, and atomic multiplayer state transitions.

## Working across laptop, desktop, GitHub, and Codex

GitHub `main` is the shared source of truth across devices.

Before starting work on a machine:
1. Sync/fetch the latest repository state.
2. Confirm the branch and inspect recent commits.
3. Read this `AGENTS.md` and `V9-NOTES.md`.
4. Run existing tests before changing important game logic.

After work:
1. Run tests.
2. Review the diff.
3. Commit descriptive changes.
4. Push the branch/commit to GitHub.
5. On the other machine, sync before making new edits.

Never assume a local desktop copy is newer than GitHub.

## Before implementing a new request

1. Inspect the current implementation first.
2. State any game-rule assumption that could change player behavior.
3. Preserve existing working behavior unless the user explicitly requests a change.
4. If a request affects Firebase rules, deployment, random odds, scoring, or dependency semantics, call that out before implementation.
5. Update `V9-NOTES.md` or create a successor release note when behavior materially changes.
