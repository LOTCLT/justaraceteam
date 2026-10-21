# V10 — Guided car importer (development)

This work is on `feature/car-importer`. It is not deployed. The reviewed lineup remains the four existing cars.

## Guided entry

Open `importer.html` from the Race Night home screen. Enter the year/make/model and starting class/PI, select the actual upgrade levels with checkboxes, and type additional in-game options as needed. No file upload is required.

Add motor swaps by name and switch between motors to enter their separate trees. Set each motor's native aspiration (NA, Twin Turbos, etc.), then add optional aspiration conversions by name. Engine parts can be restricted to the selected aspiration; shared chassis/drivetrain/tire/appearance parts remain independent of motors. The form offers common choices, not a verified catalog of every Forza vehicle: users must select only options shown in the game.

The review section allows exact labels, arbitrary prerequisites, and implicit base states for Street-first trees. It displays the game's real tiers. Validation blocks duplicates, missing or conflicting prerequisites, cycles, invalid PI, missing bases and oversized definitions. A variant label alone does not restrict eligibility. Native aspiration without a conversion does not create a fictitious reward row.

Drafts automatically save to browser storage; storage failures are reported. JSON downloads remain optional backups. Excel/CSV/TSV imports and copying an existing car are optional starting points. Users choose XLSX worksheets; example tabs start unchecked. The XLSX reader supports bounded text/number templates using browser-native DEFLATE, verifies ZIP CRCs, rejects formulas, and never executes workbook content. Ambiguous legacy dependencies require review instead of invented conversion menus.

## Community Cars

After checking the car against Forza, anyone can submit it using the existing anonymous Firebase authentication. New immutable records live under `communityCars/<id>`. They cannot overwrite reviewed cars. Client validation also runs when records are read; server rules treat the bounded definition string as untrusted content, not as proof of a valid upgrade tree.

The host explicitly loads the latest 100 community submissions from the car selector. Valid entries are marked Community. Random Car and Random Setup continue using only the reviewed `CAR_LIBRARY`. A selected community car's complete validated definition is copied into the room's `selectedCar` so guests and reconnecting players use the same tree. Existing room rules and upgrade-decision grants are unchanged.

Submissions are create-only, with owner UID, server timestamp, name/PI/size limits and no extra record fields. Anonymous users cannot edit/delete an entry or mark it reviewed. Retries retain the same submission ID; an acknowledged save disables another submission until the form changes. A maintainer can inspect an exported car and run the tests before adding it to the reviewed library in a separate change. The UI does not provide approval/deletion controls.

## Validation and release prerequisites

Run from the repository root:

```sh
node --input-type=module --check < script.js
node --input-type=module --check < game-data.js
node --input-type=module --check < importer.js
node tests/v9.mjs
node tests/importer.mjs
git diff --check
```

`tests/importer-browser.mjs` uses a development-only external `playwright-core` installation and Chromium. Set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path and optionally `CHROMIUM_PATH`. Serve the checkout using `python3 -m http.server 8011 --bind 127.0.0.1`, then run the test. Set `BMW_WORKBOOK` to the original workbook to include the real Excel import check. Browser tests cover guided checkbox entry, separate motor trees, native/converted aspiration, reload recovery, exported content, simulated save failure/retry, duplicate reviewed-name protection and mobile/desktop overflow. They intercept community submission; they do not write to the production backend.

For rules verification, use Firebase CLI and Java 21 with a **demo** project:

```sh
firebase emulators:exec --only database --project demo-justaraceteam --config firebase.emulators.json 'node tests/community-rules.mjs'
```

The emulator test checks community creation/read bounds, ownership, immutable records, denied invalid writes and the existing host/player decision protections. After network access was enabled, all 26 checks passed. The test explicitly targets the demo project's `-default-rtdb` namespace where Firebase CLI installs the rules; using the project ID alone would test a different database.

Before release: pass the emulator tests, review the rules diff, deliberately deploy the rules, publish the website files, then use isolated browser sessions to verify a real community submission, host selection, guest upgrade decisions and reconnect. Firebase rules have not been deployed and no production data was changed during development. Saving environment configuration is separate from code publication or Firebase deployment.
