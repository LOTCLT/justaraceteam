# Motor-swap inventory

Maintain this inventory whenever a car is added or its engine swaps are corrected. It is a reference for a future motor dropdown, not a shared upgrade-tree implementation.

Currently recorded: **15 distinct swap labels across 3 reviewed cars**. Stock engines are excluded. The Mustang and Civic definitions currently contain no engine-swap menus; that does not establish that swaps are unavailable in Forza.

| Swap label as currently stored | Reviewed cars using it |
| --- | --- |
| 1.6L I4 - Turbo Rally | 2024 Toyota Prius Prime XSE Premium; 1988 BMW M3 |
| 3.0L I6 - TT | 2024 Toyota Prius Prime XSE Premium; 1988 BMW M3 |
| 1.6L I3-T | 2024 Toyota Prius Prime XSE Premium |
| 2.5L I6-T | 2024 Toyota Prius Prime XSE Premium |
| 6.2L V8 | 2024 Toyota Prius Prime XSE Premium |
| 4.8L V10 | 2024 Toyota Prius Prime XSE Premium |
| 3.2L I6 | 1988 BMW M3 |
| 4.0L V8 | 1988 BMW M3 |
| 5.0L V10 | 1988 BMW M3 |
| 6.2 V8 - DSC | 2020 Chevrolet Corvette Stingray Coupe |
| 8.4 V10 | 2020 Chevrolet Corvette Stingray Coupe |
| 5.5L V8 | 2020 Chevrolet Corvette Stingray Coupe |
| Racing V12 | 2020 Chevrolet Corvette Stingray Coupe |
| 6.2L V8-PDSC | 2020 Chevrolet Corvette Stingray Coupe |
| Racing 7.2L V8 | 2020 Chevrolet Corvette Stingray Coupe |

## Recording future entries

- Record the exact supplied swap label and the car using it. Flag likely spelling/format aliases for review instead of renaming prerequisite values automatically.
- Track native aspiration, available conversions, upgrade options, and dependencies in each car's actual definition. A recurring motor label does not establish that every car has an identical tree.
- Keep naturally aspirated, DSC, PDSC and Racing variants separate unless verified to be the same engine. In particular, do not combine the existing 6.2L V8 entries merely because displacement matches.
- Check this inventory when reviewing new exports. Only include verified reviewed-car entries here; community submissions still need review.
- When building the dropdown, use reviewed engine identities/aliases and car-specific exceptions. Selecting a familiar name must not silently invent upgrades or conversions.

Sources: the reviewed `CAR_LIBRARY` in `game-data.js`, including `corvette-data.js`. The first two rows are the repeated swap labels identified so far.
