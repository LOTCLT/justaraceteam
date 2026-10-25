# V11 — Corvette and conversion guidance

## Reviewed Corvette

Added **2020 Chevrolet Corvette Stingray Coupe — A699** to the reviewed lineup from the user's exported car file. Stock drivetrain is RWD, as confirmed by the user. The reviewed random-car pool now contains five cars; race odds, points and reward counts are unchanged.

The supplied 221 rows were reduced to 108 by merging repeated, identical engine parts across aspiration branches. Shared parts retain a single ID, so installing a turbo does not erase an unchanged Intake or make it eligible twice. Option labels and available upgrade levels were preserved. The 8.4 V10 Supercharger/Centrifugal Supercharger and 5.5L V8 Twin Turbos use implicit Tier 0 bases without introducing Stock rewards.

The two 6.2 V8 swap trees already listed native supercharger upgrades. Their base aspirations are represented as Supercharger (DSC) and Positive Displacement SuperCharger (PDSC), with those blower upgrades disabled after Twin Turbo conversion. This interpretation follows the submitted native upgrade trees; it has not been independently verified in Forza. All six swap names and the supplied A699 PI are preserved.

The raw reviewed definitions live in `corvette-data.js`; `game-data.js` builds them with the existing tier/dependency logic. Engine changes still prune incompatible parts, while unchanged parts survive aspiration changes. All 108 rows are reachable across 20 engine/aspiration states.

## Importer improvements

- Conversion entry shows unchanged motor parts as already shared instead of inviting another copy.
- **Different options with this conversion** starts from the existing options and creates mutually exclusive branches.
- **Not available with this conversion** removes that aspiration from the original part's availability. It does not remove that part from the rest of the motor's tree.
- Guidance distinguishes motor swaps from aspiration conversions: each different motor needs its own tree, while unchanged parts on the same motor are shared across aspirations.
- Guidance explains that Stock is a base state and never a reward. Unchecking Stock and selecting Street/Sport/Race automatically creates an implicit base. Visible Stock options should stay checked.
- Drivetrain Swap starts without a preselected drivetrain. Users choose the actual stock drivetrain, and their chosen base is retained when more options are checked.
- Validation blocks overlapping same-mod trees even when their variant names differ. Exclusive engine/aspiration variants remain valid.
- Community submission compacts JSON before applying the existing 96,000-byte limit. Readable backup files may be larger without requiring a Firebase rule change. No existing stored data is rewritten.

Existing browser drafts are preserved. To start from the reviewed Corvette, choose it under **Start from an existing car → Copy into form**. This replaces the old draft only after confirmation.

## Checks

```sh
node tests/v9.mjs
node tests/importer.mjs
node tests/corvette.mjs
git diff --check
```

The Corvette suite exercises all 20 engine/aspiration states, 6,000 reward samples, RWD, reachability, implicit bases, duplicate-part exclusion and retained shared parts. The game suite samples 10,000 rewards across all five reviewed cars and exercises existing multiplayer/roster flows. Importer tests include overlap rejection and a valid large tree that fits after compacting. Chromium checks cover shared parts, changed/removed conversion parts, implicit bases, draft persistence, submission retry and mobile/desktop layout with Firebase mocked. Actual Forza menu verification remains a manual check.
