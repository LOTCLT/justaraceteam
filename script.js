import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    signInAnonymously
}
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    update,
    remove,
    onValue,
    serverTimestamp
}
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

import {
    CAR_LIBRARY,
    RACE_POOL,
    POINTS_BY_PLACE,
    REWARDS_BY_PLACE,
    getCarByName,
    getUpgradeById,
    getStockForUpgrade,
    getRandomUpgradeRoll,
    randomFromArray
}
    from "./game-data.js?v=5";


/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBRBaBatRkK5sz8ag4iY5RYzz8rzU9Sds8",

    authDomain:
        "justaraceteam-c53eb.firebaseapp.com",

    databaseURL:
        "https://justaraceteam-c53eb-default-rtdb.firebaseio.com",

    projectId:
        "justaraceteam-c53eb",

    storageBucket:
        "justaraceteam-c53eb.firebasestorage.app",

    messagingSenderId:
        "491124011414",

    appId:
        "1:491124011414:web:92f33c31cc2366f5bdedb7"

};


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


/* =========================================================
   ELEMENTS
   ========================================================= */

const homeScreen =
    document.getElementById("homeScreen");

const lobbyScreen =
    document.getElementById("lobbyScreen");

const gameScreen =
    document.getElementById("gameScreen");

const finalScreen =
    document.getElementById("finalScreen");


const playerNameInput =
    document.getElementById("playerNameInput");

const roomCodeInput =
    document.getElementById("roomCodeInput");

const homeMessage =
    document.getElementById("homeMessage");


const createGameButton =
    document.getElementById("createGameBtn");

const joinGameButton =
    document.getElementById("joinGameBtn");

const startGameButton =
    document.getElementById("startGameBtn");

const leaveGameButton =
    document.getElementById("leaveGameBtn");

const leaveGameButtonGame =
    document.getElementById("leaveGameBtnGame");


const lobbyRoomCode =
    document.getElementById("lobbyRoomCode");

const lobbyPlayerName =
    document.getElementById("lobbyPlayerName");

const lobbyNote =
    document.getElementById("lobbyNote");

const playerList =
    document.getElementById("playerList");


const gameRoomCode =
    document.getElementById("gameRoomCode");

const gamePlayerName =
    document.getElementById("gamePlayerName");

const gamePlayerList =
    document.getElementById("gamePlayerList");

const gameNote =
    document.getElementById("gameNote");

const liveStandings =
    document.getElementById("liveStandings");


const roundNumber =
    document.getElementById("roundNumber");

const roundReadyBadge =
    document.getElementById("roundReadyBadge");


const selectedCarName =
    document.getElementById("selectedCarName");

const selectedCarPI =
    document.getElementById("selectedCarPI");


const raceTypeBadge =
    document.getElementById("raceTypeBadge");

const raceName =
    document.getElementById("raceName");

const raceDistance =
    document.getElementById("raceDistance");


const hostGameControls =
    document.getElementById("hostGameControls");

const carSetupControls =
    document.getElementById("carSetupControls");

const carSelect =
    document.getElementById("carSelect");

const setCarButton =
    document.getElementById("setCarBtn");

const randomCarButton =
    document.getElementById("randomCarBtn");

const generateRaceButton =
    document.getElementById("generateRaceBtn");

const randomSetupButton =
    document.getElementById("randomSetupBtn");


const raceCompleteControls =
    document.getElementById("raceCompleteControls");

const enterResultsButton =
    document.getElementById("enterResultsBtn");


const resultsEntryPanel =
    document.getElementById("resultsEntryPanel");

const resultEntryRound =
    document.getElementById("resultEntryRound");

const finishOrderInputs =
    document.getElementById("finishOrderInputs");

const resultEntryMessage =
    document.getElementById("resultEntryMessage");

const submitResultsButton =
    document.getElementById("submitResultsBtn");

const cancelResultsButton =
    document.getElementById("cancelResultsBtn");


const roundResultsPanel =
    document.getElementById("roundResultsPanel");

const resultsRoundNumber =
    document.getElementById("resultsRoundNumber");

const roundResultsList =
    document.getElementById("roundResultsList");

const upgradeRewardList =
    document.getElementById("upgradeRewardList");

const hostResultsControls =
    document.getElementById("hostResultsControls");

const goToUpgradesButton =
    document.getElementById("goToUpgradesBtn");

const endRaceNightFromResultsButton =
    document.getElementById("endRaceNightFromResultsBtn");


const upgradePanel =
    document.getElementById("upgradePanel");

const upgradeRoundNumber =
    document.getElementById("upgradeRoundNumber");

const upgradeStatusMessage =
    document.getElementById("upgradeStatusMessage");

const upgradeRollsList =
    document.getElementById("upgradeRollsList");

const hostApplyUpgradesControls =
    document.getElementById("hostApplyUpgradesControls");

const applyUpgradesButton =
    document.getElementById("applyUpgradesBtn");

const playerGarages =
    document.getElementById("playerGarages");

const hostAfterUpgradesControls =
    document.getElementById("hostAfterUpgradesControls");

const nextRoundButton =
    document.getElementById("nextRoundBtn");

const endRaceNightButton =
    document.getElementById("endRaceNightBtn");


const finalChampionName =
    document.getElementById("finalChampionName");

const finalChampionStats =
    document.getElementById("finalChampionStats");

const finalStandings =
    document.getElementById("finalStandings");

const finalRaceCount =
    document.getElementById("finalRaceCount");

const leaveFinalButton =
    document.getElementById("leaveFinalBtn");


/* =========================================================
   LOCAL STATE
   ========================================================= */

let currentRoomCode =
    null;

let currentPlayerName =
    null;

let currentPlayerIsHost =
    false;

let currentUserUid =
    null;

let currentRoomData =
    null;

let stopRoomListener =
    null;


/* =========================================================
   STARTUP
   ========================================================= */

populateCarSelect();


function populateCarSelect() {

    carSelect.innerHTML =
        "";


    CAR_LIBRARY.forEach(
        function (car) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                car.name;


            option.textContent =
                car.name +
                " — " +
                car.startingPI;


            carSelect.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   AUTH
   ========================================================= */

async function getCurrentPlayer() {

    if (auth.currentUser) {

        currentUserUid =
            auth.currentUser.uid;


        return auth.currentUser;

    }


    const result =
        await signInAnonymously(
            auth
        );


    currentUserUid =
        result.user.uid;


    return result.user;

}


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function cloneObject(value) {

    return JSON.parse(
        JSON.stringify(
            value || {}
        )
    );

}


function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code =
        "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        code +=
            characters[
                Math.floor(
                    Math.random() *
                    characters.length
                )
            ];

    }


    return code;

}


function showHomeMessage(
    message,
    type
) {

    homeMessage.textContent =
        message;


    homeMessage.classList.remove(
        "error",
        "success"
    );


    if (type) {

        homeMessage.classList.add(
            type
        );

    }

}


function getPlayerName() {

    const playerName =
        playerNameInput
            .value
            .trim();


    if (
        playerName.length < 2
    ) {

        showHomeMessage(
            "Enter your name first.",
            "error"
        );


        return null;

    }


    return playerName;

}


function placeLabel(place) {

    if (place === 1) {
        return "1st";
    }


    if (place === 2) {
        return "2nd";
    }


    if (place === 3) {
        return "3rd";
    }


    return place + "th";

}


function getRoundKey(round) {

    return (
        "round_" +
        round
    );

}


function getSelectedCarDefinition(
    roomData
) {

    if (
        !roomData ||
        !roomData.selectedCar
    ) {

        return null;

    }


    return getCarByName(
        roomData.selectedCar.name
    );

}


function getSortedPlayers(players) {

    return Object.entries(
        players || {}
    )
    .sort(
        function (a, b) {

            return (
                (a[1].joinedAt || 0) -
                (b[1].joinedAt || 0)
            );

        }
    );

}


function normalizeRolls(rolls) {

    if (!rolls) {

        return [];

    }


    if (
        Array.isArray(rolls)
    ) {

        return rolls;

    }


    return Object.keys(rolls)
        .sort(
            (a, b) =>
                Number(a) -
                Number(b)
        )
        .map(
            key =>
                rolls[key]
        );

}


/* =========================================================
   PLAYER LIST
   ========================================================= */

function renderPlayers(
    targetElement,
    players
) {

    targetElement.innerHTML =
        "";


    const sortedPlayers =
        getSortedPlayers(
            players
        );


    sortedPlayers.forEach(
        function ([uid, player]) {

            const row =
                document.createElement(
                    "div"
                );


            row.classList.add(
                "player-row"
            );


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                player.name;


            row.appendChild(
                name
            );


            if (player.isHost) {

                const badge =
                    document.createElement(
                        "span"
                    );


                badge.classList.add(
                    "host-badge"
                );


                badge.textContent =
                    "HOST";


                row.appendChild(
                    badge
                );

            }


            targetElement.appendChild(
                row
            );

        }
    );


    return sortedPlayers.length;

}


/* =========================================================
   STANDINGS
   ========================================================= */

function calculateStandings(
    players,
    raceHistory
) {

    const standings =
        {};


    Object.entries(
        players || {}
    )
    .forEach(
        function ([uid, player]) {

            standings[uid] = {

                uid:
                    uid,

                name:
                    player.name,

                points:
                    0,

                wins:
                    0,

                seconds:
                    0,

                thirds:
                    0,

                fourths:
                    0,

                races:
                    0

            };

        }
    );


    Object.values(
        raceHistory || {}
    )
    .forEach(
        function (race) {

            Object.entries(
                race.finishOrder || {}
            )
            .forEach(
                function (
                    [placeString, result]
                ) {

                    const place =
                        Number(
                            placeString
                        );


                    if (
                        !standings[
                            result.uid
                        ]
                    ) {

                        standings[
                            result.uid
                        ] = {

                            uid:
                                result.uid,

                            name:
                                result.name,

                            points:
                                0,

                            wins:
                                0,

                            seconds:
                                0,

                            thirds:
                                0,

                            fourths:
                                0,

                            races:
                                0

                        };

                    }


                    const entry =
                        standings[
                            result.uid
                        ];


                    entry.points +=
                        POINTS_BY_PLACE[
                            place
                        ] || 0;


                    entry.races +=
                        1;


                    if (place === 1) {
                        entry.wins += 1;
                    }


                    if (place === 2) {
                        entry.seconds += 1;
                    }


                    if (place === 3) {
                        entry.thirds += 1;
                    }


                    if (place === 4) {
                        entry.fourths += 1;
                    }

                }
            );

        }
    );


    return Object.values(
        standings
    )
    .sort(
        function (a, b) {

            if (
                b.points !==
                a.points
            ) {

                return (
                    b.points -
                    a.points
                );

            }


            if (
                b.wins !==
                a.wins
            ) {

                return (
                    b.wins -
                    a.wins
                );

            }


            if (
                b.seconds !==
                a.seconds
            ) {

                return (
                    b.seconds -
                    a.seconds
                );

            }


            if (
                b.thirds !==
                a.thirds
            ) {

                return (
                    b.thirds -
                    a.thirds
                );

            }


            return a.name.localeCompare(
                b.name
            );

        }
    );

}


function renderStandings(
    target,
    standings
) {

    target.innerHTML =
        "";


    const table =
        document.createElement(
            "div"
        );


    table.classList.add(
        "standings-table"
    );


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "standing-row standing-header";


    [
        "POS",
        "PLAYER",
        "PTS",
        "WINS"
    ]
    .forEach(
        function (text, index) {

            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                text;


            if (
                index >= 2
            ) {

                span.style.textAlign =
                    "right";

            }


            header.appendChild(
                span
            );

        }
    );


    table.appendChild(
        header
    );


    standings.forEach(
        function (player, index) {

            const row =
                document.createElement(
                    "div"
                );


            row.classList.add(
                "standing-row"
            );


            const position =
                document.createElement(
                    "span"
                );


            position.classList.add(
                "standing-position"
            );


            position.textContent =
                index + 1;


            const name =
                document.createElement(
                    "span"
                );


            name.classList.add(
                "standing-name"
            );


            name.textContent =
                player.name;


            const points =
                document.createElement(
                    "span"
                );


            points.classList.add(
                "standing-points"
            );


            points.textContent =
                player.points;


            const wins =
                document.createElement(
                    "span"
                );


            wins.classList.add(
                "standing-wins"
            );


            wins.textContent =
                "🏆 " +
                player.wins;


            row.append(
                position,
                name,
                points,
                wins
            );


            table.appendChild(
                row
            );

        }
    );


    target.appendChild(
        table
    );

}


/* =========================================================
   UPGRADE ENGINE
   ========================================================= */

function evaluateRollAgainstGarage(
    car,
    playerGarage,
    roll,
    round,
    mutateGarage
) {

    const upgrade =
        getUpgradeById(
            car,
            roll.modId
        );


    if (!upgrade) {

        return {

            previousOption:
                "Unknown",

            previousTier:
                0,

            resultOption:
                "Unknown",

            resultTier:
                0,

            outcome:
                "NO CHANGE",

            changed:
                false

        };

    }


    const stock =
        getStockForUpgrade(
            upgrade
        );


    const existing =
        playerGarage[
            roll.modId
        ];


    const previousOption =
        existing
            ? existing.option
            : stock.name;


    const previousTier =
        existing
            ? Number(existing.tier || 0)
            : Number(stock.tier || 0);


    let resultOption =
        previousOption;


    let resultTier =
        previousTier;


    let outcome =
        "NO CHANGE";


    let changed =
        false;


    if (
        roll.tier >
        previousTier
    ) {

        resultOption =
            roll.option;


        resultTier =
            roll.tier;


        outcome =
            "UPGRADE";


        changed =
            true;

    }
    else if (
        roll.tier ===
        previousTier
    ) {

        if (
            roll.option ===
            previousOption
        ) {

            outcome =
                "NO CHANGE";

        }
        else {

            resultOption =
                roll.option;


            resultTier =
                roll.tier;


            outcome =
                "SIDEGRADE";


            changed =
                true;

        }

    }
    else {

        outcome =
            "LOCKED - KEEP";

    }


    if (
        mutateGarage &&
        changed
    ) {

        playerGarage[
            roll.modId
        ] = {

            category:
                roll.category,

            mod:
                roll.mod,

            option:
                resultOption,

            tier:
                resultTier,

            installedRound:
                round

        };

    }


    return {

        previousOption:
            previousOption,

        previousTier:
            previousTier,

        resultOption:
            resultOption,

        resultTier:
            resultTier,

        outcome:
            outcome,

        changed:
            changed

    };

}


function buildPreviewRoll(
    car,
    garage,
    baseRoll,
    round,
    mutateGarage
) {

    const evaluation =
        evaluateRollAgainstGarage(
            car,
            garage,
            baseRoll,
            round,
            mutateGarage
        );


    return {

        ...baseRoll,

        previousOption:
            evaluation.previousOption,

        previousTier:
            evaluation.previousTier,

        resultOption:
            evaluation.resultOption,

        resultTier:
            evaluation.resultTier,

        outcome:
            evaluation.outcome

    };

}


function buildUpgradePackage(
    car,
    roomData,
    uid,
    raceResult,
    place,
    round
) {

    const reward =
        REWARDS_BY_PLACE[
            place
        ] || {
            rolls: 0,
            keep: 0,
            text: "No upgrade"
        };


    const originalGarage =
        cloneObject(
            roomData.garages &&
            roomData.garages[uid]
                ? roomData.garages[uid]
                : {}
        );


    const packageData = {

        uid:
            uid,

        name:
            raceResult.name,

        place:
            place,

        rewardText:
            reward.text,

        rollCount:
            reward.rolls,

        keepCount:
            reward.keep,

        choiceRequired:
            (
                reward.rolls === 2 &&
                reward.keep === 1
            ),

        resolved:
            false

    };


    if (
        reward.rolls === 0
    ) {

        packageData.rolls =
            [];


        return packageData;

    }


    const rolls =
        [];


    if (
        packageData.choiceRequired
    ) {

        /*
            Both choices are compared against
            the same current garage because the
            player will keep only one.
        */

        for (
            let i = 0;
            i < reward.rolls;
            i++
        ) {

            const baseRoll =
                getRandomUpgradeRoll(
                    car
                );


            rolls.push(
                buildPreviewRoll(
                    car,
                    cloneObject(
                        originalGarage
                    ),
                    baseRoll,
                    round,
                    false
                )
            );

        }

    }
    else {

        /*
            Auto-kept rolls are previewed in
            sequence. This matters when both
            rolls hit the same mod.
        */

        const tempGarage =
            cloneObject(
                originalGarage
            );


        for (
            let i = 0;
            i < reward.rolls;
            i++
        ) {

            const baseRoll =
                getRandomUpgradeRoll(
                    car
                );


            rolls.push(
                buildPreviewRoll(
                    car,
                    tempGarage,
                    baseRoll,
                    round,
                    true
                )
            );

        }

    }


    packageData.rolls =
        rolls;


    return packageData;

}


function getSelectedRollIndices(
    packageData
) {

    const rolls =
        normalizeRolls(
            packageData.rolls
        );


    if (
        packageData.place === 2
    ) {

        return rolls.length
            ? [0]
            : [];

    }


    if (
        packageData.place === 4
    ) {

        return rolls.map(
            (unused, index) =>
                index
        );

    }


    if (
        packageData.choiceRequired &&
        Number.isInteger(
            packageData.choiceIndex
        )
    ) {

        return [
            packageData.choiceIndex
        ];

    }


    return [];

}


function allUpgradeChoicesReady(
    upgradeRound
) {

    if (
        !upgradeRound ||
        !upgradeRound.players
    ) {

        return false;

    }


    return Object.values(
        upgradeRound.players
    )
    .every(
        function (packageData) {

            if (
                !packageData.choiceRequired
            ) {

                return true;

            }


            const rolls =
                normalizeRolls(
                    packageData.rolls
                );


            return (
                Number.isInteger(
                    packageData.choiceIndex
                ) &&
                packageData.choiceIndex >= 0 &&
                packageData.choiceIndex < rolls.length
            );

        }
    );

}


/* =========================================================
   GAME SETUP DISPLAY
   ========================================================= */

function updateGameSetupDisplay(
    roomData
) {

    const round =
        roomData.currentRound ||
        1;


    const phase =
        roomData.gamePhase ||
        "setup";


    roundNumber.textContent =
        round;


    if (
        roomData.selectedCar
    ) {

        selectedCarName.textContent =
            roomData.selectedCar.name;


        selectedCarPI.textContent =
            "Starting PI: " +
            roomData.selectedCar.startingPI;


        if (
            getCarByName(
                roomData.selectedCar.name
            )
        ) {

            carSelect.value =
                roomData.selectedCar.name;

        }

    }
    else {

        selectedCarName.textContent =
            "Waiting for host...";


        selectedCarPI.textContent =
            "Starting PI: —";

    }


    if (
        roomData.currentRace
    ) {

        raceName.textContent =
            roomData.currentRace.name;


        raceDistance.textContent =
            "Distance: " +
            roomData.currentRace.distance;


        raceTypeBadge.textContent =
            roomData.currentRace.type;


        raceTypeBadge.classList.remove(
            "hidden"
        );

    }
    else {

        raceName.textContent =
            "Waiting for host...";


        raceDistance.textContent =
            "Distance: —";


        raceTypeBadge.classList.add(
            "hidden"
        );

    }


    const setupReady =
        Boolean(
            roomData.selectedCar &&
            roomData.currentRace
        );


    if (setupReady) {

        roundReadyBadge.classList.remove(
            "hidden"
        );

    }
    else {

        roundReadyBadge.classList.add(
            "hidden"
        );

    }


    const setupPhase =
        (
            phase === "setup" ||
            phase === "racing"
        );


    if (
        currentPlayerIsHost &&
        setupPhase
    ) {

        hostGameControls.classList.remove(
            "hidden"
        );

    }
    else {

        hostGameControls.classList.add(
            "hidden"
        );

    }


    const raceCount =
        Object.keys(
            roomData.raceHistory ||
            {}
        ).length;


    const canChangeCar =
        (
            round === 1 &&
            raceCount === 0
        );


    if (canChangeCar) {

        carSetupControls.classList.remove(
            "hidden"
        );


        randomSetupButton.classList.remove(
            "hidden"
        );

    }
    else {

        carSetupControls.classList.add(
            "hidden"
        );


        randomSetupButton.classList.add(
            "hidden"
        );

    }


    if (
        currentPlayerIsHost &&
        setupReady &&
        setupPhase
    ) {

        raceCompleteControls.classList.remove(
            "hidden"
        );

    }
    else {

        raceCompleteControls.classList.add(
            "hidden"
        );

    }


    if (setupPhase) {

        roundResultsPanel.classList.add(
            "hidden"
        );


        upgradePanel.classList.add(
            "hidden"
        );


        if (setupReady) {

            gameNote.textContent =
                "Round " +
                round +
                " is ready. Run the race!";

        }
        else if (
            currentPlayerIsHost
        ) {

            gameNote.textContent =
                canChangeCar
                    ? "Choose the car and generate the race."
                    : "Generate the next race.";

        }
        else {

            gameNote.textContent =
                "Waiting for the host to set up the race.";

        }

    }

}


/* =========================================================
   RESULT ENTRY
   ========================================================= */

function buildFinishOrderForm() {

    finishOrderInputs.innerHTML =
        "";


    resultEntryMessage.textContent =
        "";


    const players =
        getSortedPlayers(
            currentRoomData.players
        );


    resultEntryRound.textContent =
        currentRoomData.currentRound ||
        1;


    players.forEach(
        function (
            unused,
            index
        ) {

            const place =
                index + 1;


            const row =
                document.createElement(
                    "div"
                );


            row.classList.add(
                "finish-entry-row"
            );


            const label =
                document.createElement(
                    "div"
                );


            label.classList.add(
                "finish-place"
            );


            label.textContent =
                placeLabel(
                    place
                );


            const select =
                document.createElement(
                    "select"
                );


            select.dataset.place =
                place;


            const placeholder =
                document.createElement(
                    "option"
                );


            placeholder.value =
                "";


            placeholder.textContent =
                "Choose player";


            select.appendChild(
                placeholder
            );


            players.forEach(
                function ([uid, player]) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        uid;


                    option.textContent =
                        player.name;


                    select.appendChild(
                        option
                    );

                }
            );


            row.append(
                label,
                select
            );


            finishOrderInputs.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   ROUND RESULTS
   ========================================================= */

function renderRoundResults(
    roomData
) {

    const round =
        roomData.currentRound ||
        1;


    const roundKey =
        getRoundKey(
            round
        );


    const race =
        roomData.raceHistory
            ? roomData.raceHistory[
                roundKey
            ]
            : null;


    if (!race) {

        return;

    }


    resultsRoundNumber.textContent =
        round;


    roundResultsList.innerHTML =
        "";


    upgradeRewardList.innerHTML =
        "";


    Object.entries(
        race.finishOrder || {}
    )
    .sort(
        (a, b) =>
            Number(a[0]) -
            Number(b[0])
    )
    .forEach(
        function ([placeString, result]) {

            const place =
                Number(
                    placeString
                );


            const resultRow =
                document.createElement(
                    "div"
                );


            resultRow.classList.add(
                "result-row"
            );


            const placeSpan =
                document.createElement(
                    "span"
                );


            placeSpan.classList.add(
                "result-place"
            );


            placeSpan.textContent =
                placeLabel(
                    place
                );


            const nameSpan =
                document.createElement(
                    "span"
                );


            nameSpan.classList.add(
                "result-name"
            );


            nameSpan.textContent =
                result.name;


            const pointsSpan =
                document.createElement(
                    "span"
                );


            pointsSpan.classList.add(
                "result-points"
            );


            pointsSpan.textContent =
                "+" +
                (
                    POINTS_BY_PLACE[
                        place
                    ] || 0
                ) +
                " pts";


            resultRow.append(
                placeSpan,
                nameSpan,
                pointsSpan
            );


            roundResultsList.appendChild(
                resultRow
            );


            const reward =
                REWARDS_BY_PLACE[
                    place
                ];


            if (reward) {

                const rewardRow =
                    document.createElement(
                        "div"
                    );


                rewardRow.classList.add(
                    "reward-row"
                );


                const rewardPlace =
                    document.createElement(
                        "span"
                    );


                rewardPlace.classList.add(
                    "result-place"
                );


                rewardPlace.textContent =
                    placeLabel(
                        place
                    );


                const rewardInfo =
                    document.createElement(
                        "div"
                    );


                rewardInfo.classList.add(
                    "reward-info"
                );


                const rewardName =
                    document.createElement(
                        "strong"
                    );


                rewardName.textContent =
                    result.name;


                const rewardText =
                    document.createElement(
                        "span"
                    );


                rewardText.textContent =
                    reward.text;


                rewardInfo.append(
                    rewardName,
                    rewardText
                );


                rewardRow.append(
                    rewardPlace,
                    rewardInfo
                );


                upgradeRewardList.appendChild(
                    rewardRow
                );

            }

        }
    );


    roundResultsPanel.classList.remove(
        "hidden"
    );


    resultsEntryPanel.classList.add(
        "hidden"
    );


    raceCompleteControls.classList.add(
        "hidden"
    );


    hostGameControls.classList.add(
        "hidden"
    );


    upgradePanel.classList.add(
        "hidden"
    );


    if (
        currentPlayerIsHost
    ) {

        hostResultsControls.classList.remove(
            "hidden"
        );

    }
    else {

        hostResultsControls.classList.add(
            "hidden"
        );

    }


    gameNote.textContent =
        "Round " +
        round +
        " complete.";

}


/* =========================================================
   UPGRADE DISPLAY
   ========================================================= */

function getOutcomeClass(outcome) {

    if (outcome === "UPGRADE") {
        return "outcome-upgrade";
    }


    if (outcome === "SIDEGRADE") {
        return "outcome-sidegrade";
    }


    if (outcome === "LOCKED - KEEP") {
        return "outcome-locked";
    }


    return "outcome-no-change";

}


function createRollCard(
    packageData,
    roll,
    rollIndex,
    roomData
) {

    const card =
        document.createElement(
            "div"
        );


    card.classList.add(
        "roll-card"
    );


    const selectedIndices =
        getSelectedRollIndices(
            packageData
        );


    if (
        selectedIndices.includes(
            rollIndex
        )
    ) {

        card.classList.add(
            "selected-roll"
        );

    }


    const rollNumber =
        document.createElement(
            "div"
        );


    rollNumber.classList.add(
        "roll-number"
    );


    rollNumber.textContent =
        "ROLL " +
        (
            rollIndex +
            1
        );


    const category =
        document.createElement(
            "div"
        );


    category.classList.add(
        "roll-category"
    );


    category.textContent =
        roll.category;


    const mod =
        document.createElement(
            "div"
        );


    mod.classList.add(
        "roll-mod"
    );


    mod.textContent =
        roll.mod;


    const option =
        document.createElement(
            "div"
        );


    option.classList.add(
        "roll-option"
    );


    option.textContent =
        roll.option;


    const current =
        document.createElement(
            "div"
        );


    current.classList.add(
        "roll-current"
    );


    current.textContent =
        "Current: " +
        roll.previousOption;


    const outcome =
        document.createElement(
            "div"
        );


    outcome.classList.add(
        "outcome-badge",
        getOutcomeClass(
            roll.outcome
        )
    );


    outcome.textContent =
        roll.outcome;


    card.append(
        rollNumber,
        category,
        mod,
        option,
        current,
        outcome
    );


    const canChoose =
        (
            packageData.choiceRequired &&
            packageData.uid === currentUserUid &&
            roomData.gamePhase === "upgrades" &&
            !packageData.resolved
        );


    if (canChoose) {

        const chooseButton =
            document.createElement(
                "button"
            );


        chooseButton.className =
            "secondary-button choose-upgrade-button";


        chooseButton.type =
            "button";


        chooseButton.textContent =
            (
                packageData.choiceIndex ===
                rollIndex
            )
                ? "Selected"
                : "Choose This Roll";


        chooseButton.addEventListener(
            "click",
            function () {

                saveUpgradeChoice(
                    rollIndex
                );

            }
        );


        card.appendChild(
            chooseButton
        );

    }


    return card;

}


function renderUpgradePanel(
    roomData
) {

    const round =
        roomData.currentRound ||
        1;


    const roundKey =
        getRoundKey(
            round
        );


    const upgradeRound =
        roomData.upgradeRounds
            ? roomData.upgradeRounds[
                roundKey
            ]
            : null;


    if (!upgradeRound) {

        return;

    }


    roundResultsPanel.classList.add(
        "hidden"
    );


    resultsEntryPanel.classList.add(
        "hidden"
    );


    hostGameControls.classList.add(
        "hidden"
    );


    raceCompleteControls.classList.add(
        "hidden"
    );


    upgradePanel.classList.remove(
        "hidden"
    );


    upgradeRoundNumber.textContent =
        round;


    upgradeRollsList.innerHTML =
        "";


    const packages =
        Object.values(
            upgradeRound.players ||
            {}
        )
        .sort(
            (a, b) =>
                a.place -
                b.place
        );


    let currentPlayerNeedsChoice =
        false;


    packages.forEach(
        function (packageData) {

            const card =
                document.createElement(
                    "section"
                );


            card.classList.add(
                "player-upgrade-card"
            );


            const heading =
                document.createElement(
                    "div"
                );


            heading.classList.add(
                "upgrade-player-heading"
            );


            const headingText =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "h3"
                );


            name.textContent =
                packageData.name;


            const reward =
                document.createElement(
                    "div"
                );


            reward.classList.add(
                "setup-detail"
            );


            reward.textContent =
                packageData.rewardText;


            headingText.append(
                name,
                reward
            );


            const place =
                document.createElement(
                    "span"
                );


            place.classList.add(
                "place-badge"
            );


            place.textContent =
                placeLabel(
                    packageData.place
                );


            heading.append(
                headingText,
                place
            );


            card.appendChild(
                heading
            );


            const rolls =
                normalizeRolls(
                    packageData.rolls
                );


            if (
                rolls.length === 0
            ) {

                const noUpgrade =
                    document.createElement(
                        "div"
                    );


                noUpgrade.classList.add(
                    "no-upgrade-box"
                );


                noUpgrade.textContent =
                    "No upgrade this round.";


                card.appendChild(
                    noUpgrade
                );

            }
            else {

                const grid =
                    document.createElement(
                        "div"
                    );


                grid.classList.add(
                    "roll-grid"
                );


                rolls.forEach(
                    function (roll, rollIndex) {

                        grid.appendChild(
                            createRollCard(
                                packageData,
                                roll,
                                rollIndex,
                                roomData
                            )
                        );

                    }
                );


                card.appendChild(
                    grid
                );

            }


            if (
                packageData.choiceRequired
            ) {

                const choiceStatus =
                    document.createElement(
                        "div"
                    );


                choiceStatus.classList.add(
                    "choice-status"
                );


                if (
                    Number.isInteger(
                        packageData.choiceIndex
                    )
                ) {

                    choiceStatus.textContent =
                        packageData.resolved
                            ? "Choice applied."
                            : "Choice locked in — waiting for host.";

                }
                else if (
                    packageData.uid ===
                    currentUserUid
                ) {

                    choiceStatus.textContent =
                        "Choose one of your two rolls.";


                    currentPlayerNeedsChoice =
                        true;

                }
                else {

                    choiceStatus.textContent =
                        "Waiting for " +
                        packageData.name +
                        " to choose.";

                }


                card.appendChild(
                    choiceStatus
                );

            }


            upgradeRollsList.appendChild(
                card
            );

        }
    );


    const choicesReady =
        allUpgradeChoicesReady(
            upgradeRound
        );


    if (
        roomData.gamePhase ===
        "upgrades"
    ) {

        hostAfterUpgradesControls.classList.add(
            "hidden"
        );


        if (
            currentPlayerIsHost
        ) {

            hostApplyUpgradesControls.classList.remove(
                "hidden"
            );


            applyUpgradesButton.disabled =
                !choicesReady;


            upgradeStatusMessage.textContent =
                choicesReady
                    ? "All choices are ready. Apply the upgrades."
                    : "Waiting for the keep-one upgrade choice.";

        }
        else {

            hostApplyUpgradesControls.classList.add(
                "hidden"
            );


            upgradeStatusMessage.textContent =
                currentPlayerNeedsChoice
                    ? "Pick the upgrade you want to keep."
                    : "Waiting for the host to apply the upgrades.";

        }

    }
    else if (
        roomData.gamePhase ===
        "upgradeComplete"
    ) {

        hostApplyUpgradesControls.classList.add(
            "hidden"
        );


        upgradeStatusMessage.textContent =
            "Upgrades applied. Garages are ready.";


        if (
            currentPlayerIsHost
        ) {

            hostAfterUpgradesControls.classList.remove(
                "hidden"
            );

        }
        else {

            hostAfterUpgradesControls.classList.add(
                "hidden"
            );

        }

    }


    renderGarages(
        roomData
    );


    gameNote.textContent =
        roomData.gamePhase ===
        "upgradeComplete"
            ? "Round " + round + " upgrades complete."
            : "Round " + round + " upgrade phase.";

}


/* =========================================================
   GARAGES
   ========================================================= */

function renderGarages(
    roomData
) {

    playerGarages.innerHTML =
        "";


    const players =
        getSortedPlayers(
            roomData.players
        );


    players.forEach(
        function ([uid, player]) {

            const garage =
                roomData.garages &&
                roomData.garages[uid]
                    ? roomData.garages[uid]
                    : {};


            const upgrades =
                Object.values(
                    garage
                )
                .sort(
                    function (a, b) {

                        const categoryCompare =
                            a.category.localeCompare(
                                b.category
                            );


                        if (categoryCompare !== 0) {
                            return categoryCompare;
                        }


                        return a.mod.localeCompare(
                            b.mod
                        );

                    }
                );


            const details =
                document.createElement(
                    "details"
                );


            details.classList.add(
                "garage-card"
            );


            if (
                uid ===
                currentUserUid
            ) {

                details.open =
                    true;

            }


            const summary =
                document.createElement(
                    "summary"
                );


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                player.name;


            const count =
                document.createElement(
                    "span"
                );


            count.classList.add(
                "garage-count"
            );


            count.textContent =
                upgrades.length === 1
                    ? "1 retained upgrade"
                    : upgrades.length +
                      " retained upgrades";


            summary.append(
                name,
                count
            );


            const content =
                document.createElement(
                    "div"
                );


            content.classList.add(
                "garage-content"
            );


            if (
                upgrades.length === 0
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.classList.add(
                    "garage-empty"
                );


                empty.textContent =
                    "Stock build — no retained upgrades yet.";


                content.appendChild(
                    empty
                );

            }
            else {

                upgrades.forEach(
                    function (upgrade) {

                        const row =
                            document.createElement(
                                "div"
                            );


                        row.classList.add(
                            "garage-upgrade-row"
                        );


                        const category =
                            document.createElement(
                                "div"
                            );


                        category.classList.add(
                            "garage-category"
                        );


                        category.textContent =
                            upgrade.category;


                        const mod =
                            document.createElement(
                                "div"
                            );


                        mod.classList.add(
                            "garage-mod"
                        );


                        mod.textContent =
                            upgrade.mod;


                        const option =
                            document.createElement(
                                "div"
                            );


                        option.classList.add(
                            "garage-option"
                        );


                        option.textContent =
                            upgrade.option;


                        row.append(
                            category,
                            mod,
                            option
                        );


                        content.appendChild(
                            row
                        );

                    }
                );

            }


            details.append(
                summary,
                content
            );


            playerGarages.appendChild(
                details
            );

        }
    );

}


/* =========================================================
   FINAL RESULTS
   ========================================================= */

function showFinalScreen(
    roomData
) {

    homeScreen.classList.add(
        "hidden"
    );


    lobbyScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.add(
        "hidden"
    );


    finalScreen.classList.remove(
        "hidden"
    );


    const standings =
        calculateStandings(
            roomData.players,
            roomData.raceHistory
        );


    renderStandings(
        finalStandings,
        standings
    );


    const champion =
        standings[0];


    if (champion) {

        finalChampionName.textContent =
            champion.name;


        finalChampionStats.textContent =
            champion.points +
            " Points • " +
            champion.wins +
            (
                champion.wins === 1
                    ? " Win"
                    : " Wins"
            );

    }


    const raceCount =
        Object.keys(
            roomData.raceHistory ||
            {}
        ).length;


    finalRaceCount.textContent =
        raceCount +
        (
            raceCount === 1
                ? " race completed."
                : " races completed."
        );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   ROOM LISTENER
   ========================================================= */

function clearRoomListener() {

    if (stopRoomListener) {

        stopRoomListener();


        stopRoomListener =
            null;

    }

}


function listenToRoom(
    roomCode
) {

    clearRoomListener();


    const roomReference =
        ref(
            database,
            "rooms/" +
            roomCode
        );


    stopRoomListener =
        onValue(
            roomReference,
            function (snapshot) {

                if (
                    !snapshot.exists()
                ) {

                    if (
                        currentRoomCode ===
                        roomCode
                    ) {

                        returnToHome(
                            "The room was ended.",
                            "error"
                        );

                    }


                    return;

                }


                const roomData =
                    snapshot.val();


                currentRoomData =
                    roomData;


                const playerCount =
                    renderPlayers(
                        playerList,
                        roomData.players
                    );


                renderPlayers(
                    gamePlayerList,
                    roomData.players
                );


                const standings =
                    calculateStandings(
                        roomData.players,
                        roomData.raceHistory
                    );


                renderStandings(
                    liveStandings,
                    standings
                );


                if (
                    roomData.status ===
                    "finished"
                ) {

                    showFinalScreen(
                        roomData
                    );


                    return;

                }


                if (
                    roomData.status ===
                    "lobby"
                ) {

                    if (
                        currentPlayerIsHost
                    ) {

                        lobbyNote.textContent =
                            playerCount === 1
                                ? "Share the room code with the other players."
                                : playerCount +
                                  " players connected.";

                    }


                    return;

                }


                if (
                    roomData.status ===
                    "playing"
                ) {

                    showGameScreen();


                    updateGameSetupDisplay(
                        roomData
                    );


                    if (
                        roomData.gamePhase ===
                        "results"
                    ) {

                        renderRoundResults(
                            roomData
                        );

                    }


                    if (
                        roomData.gamePhase ===
                            "upgrades" ||
                        roomData.gamePhase ===
                            "upgradeComplete"
                    ) {

                        renderUpgradePanel(
                            roomData
                        );

                    }

                }

            }
        );

}


/* =========================================================
   SCREEN CONTROL
   ========================================================= */

function showLobby(
    roomCode,
    playerName,
    isHost
) {

    currentRoomCode =
        roomCode;


    currentPlayerName =
        playerName;


    currentPlayerIsHost =
        isHost;


    lobbyRoomCode.textContent =
        roomCode;


    lobbyPlayerName.textContent =
        playerName;


    if (isHost) {

        startGameButton.classList.remove(
            "hidden"
        );

    }
    else {

        startGameButton.classList.add(
            "hidden"
        );


        lobbyNote.textContent =
            "Waiting for the host to start the game.";

    }


    homeScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.add(
        "hidden"
    );


    finalScreen.classList.add(
        "hidden"
    );


    lobbyScreen.classList.remove(
        "hidden"
    );


    listenToRoom(
        roomCode
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showGameScreen() {

    if (!currentRoomCode) {

        return;

    }


    gameRoomCode.textContent =
        currentRoomCode;


    gamePlayerName.textContent =
        currentPlayerName;


    homeScreen.classList.add(
        "hidden"
    );


    lobbyScreen.classList.add(
        "hidden"
    );


    finalScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );

}


function returnToHome(
    message = "",
    type = ""
) {

    clearRoomListener();


    currentRoomCode =
        null;


    currentPlayerName =
        null;


    currentPlayerIsHost =
        false;


    currentRoomData =
        null;


    lobbyScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.add(
        "hidden"
    );


    finalScreen.classList.add(
        "hidden"
    );


    homeScreen.classList.remove(
        "hidden"
    );


    showHomeMessage(
        message,
        type
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CREATE ROOM
   ========================================================= */

createGameButton.addEventListener(
    "click",
    async function () {

        const playerName =
            getPlayerName();


        if (!playerName) {

            return;

        }


        showHomeMessage(
            "",
            ""
        );


        try {

            const user =
                await getCurrentPlayer();


            let newRoomCode;
            let roomReference;
            let roomSnapshot;


            do {

                newRoomCode =
                    generateRoomCode();


                roomReference =
                    ref(
                        database,
                        "rooms/" +
                        newRoomCode
                    );


                roomSnapshot =
                    await get(
                        roomReference
                    );

            }
            while (
                roomSnapshot.exists()
            );


            await set(
                roomReference,
                {

                    hostUid:
                        user.uid,

                    status:
                        "lobby",

                    createdAt:
                        serverTimestamp(),

                    players: {

                        [user.uid]: {

                            name:
                                playerName,

                            isHost:
                                true,

                            joinedAt:
                                serverTimestamp()

                        }

                    }

                }
            );


            showLobby(
                newRoomCode,
                playerName,
                true
            );

        }
        catch (error) {

            console.error(
                "Could not create room:",
                error
            );


            showHomeMessage(
                "Could not create room.",
                "error"
            );

        }

    }
);


/* =========================================================
   JOIN ROOM
   ========================================================= */

joinGameButton.addEventListener(
    "click",
    async function () {

        const playerName =
            getPlayerName();


        if (!playerName) {

            return;

        }


        const enteredCode =
            roomCodeInput
                .value
                .trim()
                .toUpperCase();


        if (
            enteredCode.length !== 5
        ) {

            showHomeMessage(
                "Enter a 5-character room code.",
                "error"
            );


            return;

        }


        showHomeMessage(
            "",
            ""
        );


        try {

            const user =
                await getCurrentPlayer();


            const roomReference =
                ref(
                    database,
                    "rooms/" +
                    enteredCode
                );


            const roomSnapshot =
                await get(
                    roomReference
                );


            if (
                !roomSnapshot.exists()
            ) {

                showHomeMessage(
                    "Room not found.",
                    "error"
                );


                return;

            }


            const roomData =
                roomSnapshot.val();


            if (
                roomData.status !==
                "lobby"
            ) {

                showHomeMessage(
                    "That game has already started.",
                    "error"
                );


                return;

            }


            const playerCount =
                Object.keys(
                    roomData.players ||
                    {}
                ).length;


            if (
                playerCount >= 4
            ) {

                showHomeMessage(
                    "That room is full.",
                    "error"
                );


                return;

            }


            await set(
                ref(
                    database,
                    "rooms/" +
                    enteredCode +
                    "/players/" +
                    user.uid
                ),
                {

                    name:
                        playerName,

                    isHost:
                        false,

                    joinedAt:
                        serverTimestamp()

                }
            );


            showLobby(
                enteredCode,
                playerName,
                false
            );

        }
        catch (error) {

            console.error(
                "Could not join room:",
                error
            );


            showHomeMessage(
                "Could not join room.",
                "error"
            );

        }

    }
);


/* =========================================================
   START GAME
   ========================================================= */

startGameButton.addEventListener(
    "click",
    async function () {

        if (
            !currentPlayerIsHost
        ) {

            return;

        }


        await update(
            ref(
                database,
                "rooms/" +
                currentRoomCode
            ),
            {

                status:
                    "playing",

                gamePhase:
                    "setup",

                currentRound:
                    1,

                startedAt:
                    serverTimestamp()

            }
        );

    }
);


/* =========================================================
   CAR
   ========================================================= */

function carSummary(car) {

    return {

        name:
            car.name,

        startingPI:
            car.startingPI

    };

}


async function saveSelectedCar(
    car
) {

    if (
        !currentPlayerIsHost ||
        !currentRoomData
    ) {

        return;

    }


    const raceCount =
        Object.keys(
            currentRoomData.raceHistory ||
            {}
        ).length;


    if (
        raceCount > 0 ||
        (
            currentRoomData.currentRound ||
            1
        ) > 1
    ) {

        return;

    }


    await update(
        ref(
            database,
            "rooms/" +
            currentRoomCode
        ),
        {

            selectedCar:
                carSummary(
                    car
                ),

            garages:
                null,

            upgradeRounds:
                null

        }
    );

}


setCarButton.addEventListener(
    "click",
    async function () {

        const car =
            getCarByName(
                carSelect.value
            );


        if (car) {

            await saveSelectedCar(
                car
            );

        }

    }
);


randomCarButton.addEventListener(
    "click",
    async function () {

        const car =
            randomFromArray(
                CAR_LIBRARY
            );


        carSelect.value =
            car.name;


        await saveSelectedCar(
            car
        );

    }
);


/* =========================================================
   RACE
   ========================================================= */

async function saveRandomRace() {

    if (
        !currentPlayerIsHost ||
        !currentRoomData
    ) {

        return;

    }


    if (
        !currentRoomData.selectedCar
    ) {

        gameNote.textContent =
            "Choose a car first.";


        return;

    }


    let race =
        randomFromArray(
            RACE_POOL
        );


    if (
        currentRoomData.currentRace &&
        RACE_POOL.length > 1
    ) {

        while (
            race.name ===
            currentRoomData.currentRace.name
        ) {

            race =
                randomFromArray(
                    RACE_POOL
                );

        }

    }


    await update(
        ref(
            database,
            "rooms/" +
            currentRoomCode
        ),
        {

            currentRace:
                race,

            gamePhase:
                "racing",

            raceGeneratedAt:
                serverTimestamp()

        }
    );

}


generateRaceButton.addEventListener(
    "click",
    saveRandomRace
);


randomSetupButton.addEventListener(
    "click",
    async function () {

        if (
            !currentPlayerIsHost ||
            !currentRoomData
        ) {

            return;

        }


        const raceCount =
            Object.keys(
                currentRoomData.raceHistory ||
                {}
            ).length;


        if (
            raceCount > 0 ||
            (
                currentRoomData.currentRound ||
                1
            ) > 1
        ) {

            return;

        }


        const car =
            randomFromArray(
                CAR_LIBRARY
            );


        const race =
            randomFromArray(
                RACE_POOL
            );


        carSelect.value =
            car.name;


        await update(
            ref(
                database,
                "rooms/" +
                currentRoomCode
            ),
            {

                selectedCar:
                    carSummary(
                        car
                    ),

                currentRace:
                    race,

                garages:
                    null,

                upgradeRounds:
                    null,

                gamePhase:
                    "racing",

                raceGeneratedAt:
                    serverTimestamp()

            }
        );

    }
);


/* =========================================================
   ENTER RESULTS
   ========================================================= */

enterResultsButton.addEventListener(
    "click",
    function () {

        buildFinishOrderForm();


        resultsEntryPanel.classList.remove(
            "hidden"
        );


        raceCompleteControls.classList.add(
            "hidden"
        );


        resultsEntryPanel.scrollIntoView({
            behavior: "smooth"
        });

    }
);


cancelResultsButton.addEventListener(
    "click",
    function () {

        resultsEntryPanel.classList.add(
            "hidden"
        );


        raceCompleteControls.classList.remove(
            "hidden"
        );

    }
);


/* =========================================================
   SUBMIT RESULTS
   ========================================================= */

submitResultsButton.addEventListener(
    "click",
    async function () {

        if (
            !currentPlayerIsHost ||
            !currentRoomData
        ) {

            return;

        }


        const selects =
            Array.from(
                finishOrderInputs
                    .querySelectorAll(
                        "select"
                    )
            );


        const selectedUids =
            selects.map(
                select =>
                    select.value
            );


        if (
            selectedUids.some(
                uid =>
                    !uid
            )
        ) {

            resultEntryMessage.textContent =
                "Assign every finishing position.";


            resultEntryMessage.className =
                "message center-message error";


            return;

        }


        if (
            new Set(
                selectedUids
            ).size !==
            selectedUids.length
        ) {

            resultEntryMessage.textContent =
                "A player cannot finish in two positions.";


            resultEntryMessage.className =
                "message center-message error";


            return;

        }


        const round =
            currentRoomData.currentRound ||
            1;


        const roundKey =
            getRoundKey(
                round
            );


        const historyReference =
            ref(
                database,
                "rooms/" +
                currentRoomCode +
                "/raceHistory/" +
                roundKey
            );


        const existingResult =
            await get(
                historyReference
            );


        if (
            existingResult.exists()
        ) {

            resultEntryMessage.textContent =
                "Results for this round were already submitted.";


            resultEntryMessage.className =
                "message center-message error";


            return;

        }


        const finishOrder =
            {};


        selects.forEach(
            function (select, index) {

                const place =
                    index + 1;


                const uid =
                    select.value;


                const player =
                    currentRoomData.players[
                        uid
                    ];


                const reward =
                    REWARDS_BY_PLACE[
                        place
                    ] || {
                        rolls: 0,
                        keep: 0,
                        text: "No upgrade"
                    };


                finishOrder[
                    place
                ] = {

                    uid:
                        uid,

                    name:
                        player.name,

                    points:
                        POINTS_BY_PLACE[
                            place
                        ] || 0,

                    upgradeRolls:
                        reward.rolls,

                    upgradesKept:
                        reward.keep,

                    rewardText:
                        reward.text

                };

            }
        );


        const raceResult = {

            round:
                round,

            car:
                currentRoomData.selectedCar,

            race:
                currentRoomData.currentRace,

            finishOrder:
                finishOrder,

            completedAt:
                Date.now()

        };


        const updates =
            {};


        updates[
            "raceHistory/" +
            roundKey
        ] =
            raceResult;


        updates.gamePhase =
            "results";


        await update(
            ref(
                database,
                "rooms/" +
                currentRoomCode
            ),
            updates
        );

    }
);


/* =========================================================
   GENERATE UPGRADE ROLLS
   ========================================================= */

goToUpgradesButton.addEventListener(
    "click",
    async function () {

        if (
            !currentPlayerIsHost ||
            !currentRoomData
        ) {

            return;

        }


        const round =
            currentRoomData.currentRound ||
            1;


        const roundKey =
            getRoundKey(
                round
            );


        const existingUpgradeRound =
            currentRoomData.upgradeRounds
                ? currentRoomData.upgradeRounds[
                    roundKey
                ]
                : null;


        if (existingUpgradeRound) {

            await update(
                ref(
                    database,
                    "rooms/" +
                    currentRoomCode
                ),
                {
                    gamePhase:
                        "upgrades"
                }
            );


            return;

        }


        const race =
            currentRoomData.raceHistory
                ? currentRoomData.raceHistory[
                    roundKey
                ]
                : null;


        const car =
            getSelectedCarDefinition(
                currentRoomData
            );


        if (
            !race ||
            !car
        ) {

            return;

        }


        const playerPackages =
            {};


        Object.entries(
            race.finishOrder || {}
        )
        .sort(
            (a, b) =>
                Number(a[0]) -
                Number(b[0])
        )
        .forEach(
            function ([placeString, result]) {

                const place =
                    Number(
                        placeString
                    );


                playerPackages[
                    result.uid
                ] =
                    buildUpgradePackage(
                        car,
                        currentRoomData,
                        result.uid,
                        result,
                        place,
                        round
                    );

            }
        );


        const updates =
            {};


        updates[
            "upgradeRounds/" +
            roundKey
        ] = {

            round:
                round,

            generatedAt:
                Date.now(),

            players:
                playerPackages

        };


        updates.gamePhase =
            "upgrades";


        await update(
            ref(
                database,
                "rooms/" +
                currentRoomCode
            ),
            updates
        );

    }
);


/* =========================================================
   PLAYER UPGRADE CHOICE
   ========================================================= */

async function saveUpgradeChoice(
    rollIndex
) {

    if (
        !currentRoomData ||
        currentRoomData.gamePhase !==
            "upgrades" ||
        !currentUserUid
    ) {

        return;

    }


    const round =
        currentRoomData.currentRound ||
        1;


    const roundKey =
        getRoundKey(
            round
        );


    const packageData =
        currentRoomData.upgradeRounds &&
        currentRoomData.upgradeRounds[
            roundKey
        ] &&
        currentRoomData.upgradeRounds[
            roundKey
        ].players
            ? currentRoomData.upgradeRounds[
                roundKey
            ].players[
                currentUserUid
            ]
            : null;


    if (
        !packageData ||
        !packageData.choiceRequired ||
        packageData.resolved
    ) {

        return;

    }


    const rolls =
        normalizeRolls(
            packageData.rolls
        );


    if (
        rollIndex < 0 ||
        rollIndex >= rolls.length
    ) {

        return;

    }


    try {

        await set(
            ref(
                database,
                "rooms/" +
                currentRoomCode +
                "/upgradeRounds/" +
                roundKey +
                "/players/" +
                currentUserUid +
                "/choiceIndex"
            ),
            rollIndex
        );

    }
    catch (error) {

        console.error(
            "Could not save upgrade choice:",
            error
        );


        upgradeStatusMessage.textContent =
            "Could not save your choice. Check the Firebase rules.";

    }

}


/* =========================================================
   APPLY UPGRADES
   ========================================================= */

applyUpgradesButton.addEventListener(
    "click",
    async function () {

        if (
            !currentPlayerIsHost ||
            !currentRoomData ||
            currentRoomData.gamePhase !==
                "upgrades"
        ) {

            return;

        }


        const round =
            currentRoomData.currentRound ||
            1;


        const roundKey =
            getRoundKey(
                round
            );


        const upgradeRound =
            currentRoomData.upgradeRounds
                ? currentRoomData.upgradeRounds[
                    roundKey
                ]
                : null;


        if (
            !upgradeRound ||
            !allUpgradeChoicesReady(
                upgradeRound
            )
        ) {

            return;

        }


        const car =
            getSelectedCarDefinition(
                currentRoomData
            );


        if (!car) {

            return;

        }


        const garages =
            cloneObject(
                currentRoomData.garages ||
                {}
            );


        const updates =
            {};


        Object.entries(
            upgradeRound.players || {}
        )
        .forEach(
            function ([uid, packageData]) {

                const playerGarage =
                    cloneObject(
                        garages[uid] ||
                        {}
                    );


                const rolls =
                    normalizeRolls(
                        packageData.rolls
                    );


                const selectedIndices =
                    getSelectedRollIndices(
                        packageData
                    );


                const applied =
                    {};


                selectedIndices.forEach(
                    function (rollIndex) {

                        const roll =
                            rolls[
                                rollIndex
                            ];


                        if (!roll) {

                            return;

                        }


                        const result =
                            evaluateRollAgainstGarage(
                                car,
                                playerGarage,
                                roll,
                                round,
                                true
                            );


                        applied[
                            "roll_" +
                            (
                                rollIndex +
                                1
                            )
                        ] = {

                            category:
                                roll.category,

                            mod:
                                roll.mod,

                            modId:
                                roll.modId,

                            rolledOption:
                                roll.option,

                            rolledTier:
                                roll.tier,

                            previousOption:
                                result.previousOption,

                            previousTier:
                                result.previousTier,

                            resultOption:
                                result.resultOption,

                            resultTier:
                                result.resultTier,

                            outcome:
                                result.outcome

                        };

                    }
                );


                garages[uid] =
                    playerGarage;


                updates[
                    "upgradeRounds/" +
                    roundKey +
                    "/players/" +
                    uid +
                    "/resolved"
                ] =
                    true;


                if (
                    Object.keys(
                        applied
                    ).length > 0
                ) {

                    updates[
                        "upgradeRounds/" +
                        roundKey +
                        "/players/" +
                        uid +
                        "/applied"
                    ] =
                        applied;

                }

            }
        );


        updates.garages =
            garages;


        updates.gamePhase =
            "upgradeComplete";


        updates[
            "upgradeRounds/" +
            roundKey +
            "/appliedAt"
        ] =
            Date.now();


        await update(
            ref(
                database,
                "rooms/" +
                currentRoomCode
            ),
            updates
        );

    }
);


/* =========================================================
   NEXT ROUND
   ========================================================= */

nextRoundButton.addEventListener(
    "click",
    async function () {

        if (
            !currentPlayerIsHost ||
            !currentRoomData ||
            currentRoomData.gamePhase !==
                "upgradeComplete"
        ) {

            return;

        }


        const nextRound =
            (
                currentRoomData.currentRound ||
                1
            ) + 1;


        await update(
            ref(
                database,
                "rooms/" +
                currentRoomCode
            ),
            {

                currentRound:
                    nextRound,

                gamePhase:
                    "setup",

                currentRace:
                    null,

                raceGeneratedAt:
                    null

            }
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   END RACE NIGHT
   ========================================================= */

async function endRaceNight() {

    if (
        !currentPlayerIsHost
    ) {

        return;

    }


    await update(
        ref(
            database,
            "rooms/" +
            currentRoomCode
        ),
        {

            status:
                "finished",

            finishedAt:
                serverTimestamp()

        }
    );

}


endRaceNightFromResultsButton.addEventListener(
    "click",
    endRaceNight
);


endRaceNightButton.addEventListener(
    "click",
    endRaceNight
);


/* =========================================================
   LEAVE
   ========================================================= */

async function leaveCurrentRoom() {

    if (!currentRoomCode) {

        return;

    }


    if (
        currentRoomData &&
        currentRoomData.status ===
        "finished"
    ) {

        returnToHome(
            "Race night complete!",
            "success"
        );


        return;

    }


    const roomCode =
        currentRoomCode;


    const wasHost =
        currentPlayerIsHost;


    try {

        const user =
            await getCurrentPlayer();


        clearRoomListener();


        if (wasHost) {

            await remove(
                ref(
                    database,
                    "rooms/" +
                    roomCode
                )
            );


            returnToHome(
                "Room ended.",
                "success"
            );

        }
        else {

            await remove(
                ref(
                    database,
                    "rooms/" +
                    roomCode +
                    "/players/" +
                    user.uid
                )
            );


            returnToHome(
                "You left the room.",
                "success"
            );

        }

    }
    catch (error) {

        console.error(
            "Could not leave room:",
            error
        );


        returnToHome();

    }

}


leaveGameButton.addEventListener(
    "click",
    leaveCurrentRoom
);


leaveGameButtonGame.addEventListener(
    "click",
    leaveCurrentRoom
);


leaveFinalButton.addEventListener(
    "click",
    function () {

        returnToHome(
            "Race night complete!",
            "success"
        );

    }
);


/* =========================================================
   INPUT HELPERS
   ========================================================= */

roomCodeInput.addEventListener(
    "input",
    function () {

        roomCodeInput.value =
            roomCodeInput
                .value
                .toUpperCase();

    }
);


roomCodeInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            joinGameButton.click();

        }

    }
);
