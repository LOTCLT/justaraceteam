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
   CARS
   ========================================================= */

const CAR_LIBRARY = [

    {
        name: "2024 Ford Mustang GT",
        startingPI: "A628"
    },

    {
        name: "1986 Honda Civic Si",
        startingPI: "D253"
    }

];



/* =========================================================
   RACES
   ========================================================= */

const RACE_POOL = [

    /* STREET */

    { type: "Street", name: "Cedar Run Street Race", distance: "4.2 mi" },
    { type: "Street", name: "Daikoku Chase Street Race", distance: "4.2 mi" },
    { type: "Street", name: "Festival Chase Street Race", distance: "4.1 mi" },
    { type: "Street", name: "Hokubu Ascent Street Race", distance: "4.2 mi" },
    { type: "Street", name: "Kita Ine Street Race", distance: "4.1 mi" },
    { type: "Street", name: "Matsumi Climb Street Race", distance: "4.6 mi" },
    { type: "Street", name: "Minami Chase Street Race", distance: "4.6 mi" },
    { type: "Street", name: "Nachi Run Street Race", distance: "3.9 mi" },
    { type: "Street", name: "Norikura Descent Street Race", distance: "3.6 mi" },
    { type: "Street", name: "Okishinaimura Run Street Race", distance: "3.2 mi" },
    { type: "Street", name: "Rainbow Bridge Descent Street Race", distance: "5.3 mi" },
    { type: "Street", name: "River Descent Street Race", distance: "3.8 mi" },
    { type: "Street", name: "Shimanoyama Charge Street Race", distance: "5.2 mi" },
    { type: "Street", name: "Sunflower Charge Street Race", distance: "3.8 mi" },
    { type: "Street", name: "Tokyo City Docks Charge Street Race", distance: "4.0 mi" },


    /* ROAD */

    { type: "Road", name: "Coastline Sprint", distance: "5.0 mi" },
    { type: "Road", name: "Daikoku Circuit", distance: "3.3 mi" },
    { type: "Road", name: "Electric Town Circuit", distance: "5.5 mi" },
    { type: "Road", name: "Festival Sprint", distance: "4.9 mi" },
    { type: "Road", name: "Highway Circuit", distance: "8.7 mi" },
    { type: "Road", name: "Hokubu Circuit", distance: "4.7 mi" },
    { type: "Road", name: "Irokawa Circuit Road Race", distance: "3.5 mi" },
    { type: "Road", name: "Ito Sprint", distance: "5.8 mi" },
    { type: "Road", name: "Legend Island Circuit", distance: "8.8 mi" },
    { type: "Road", name: "Narai-Juku Circuit", distance: "4.4 mi" },
    { type: "Road", name: "Satta Sprint", distance: "5.1 mi" },
    { type: "Road", name: "Seaside Park Sprint", distance: "4.5 mi" },
    { type: "Road", name: "Shikisai Sprint", distance: "4.8 mi" },
    { type: "Road", name: "Shimanoyama Circuit", distance: "3.4 mi" },
    { type: "Road", name: "Shimanoyama Sprint", distance: "4.0 mi" },
    { type: "Road", name: "Shirakawa Circuit", distance: "4.0 mi" },
    { type: "Road", name: "Tateyama Kurobe Sprint", distance: "3.8 mi" },
    { type: "Road", name: "The Colossus", distance: "23.4 mi" },
    { type: "Road", name: "The Goliath", distance: "53.1 mi" },
    { type: "Road", name: "Venus Sprint", distance: "5.0 mi" },


    /* DRAG */

    { type: "Drag", name: "Horizon Festival Drag Strip", distance: "0.6 mi" },
    { type: "Drag", name: "Irokawa Space Center Drag Strip", distance: "0.2 mi" },
    { type: "Drag", name: "Ito Airfield Drag Strip", distance: "0.5 mi" },


    /* DIRT / RALLY */

    { type: "Dirt / Rally", name: "Airfield Trail", distance: "4.2 mi" },
    { type: "Dirt / Rally", name: "Bamboo Forest Scramble", distance: "9.3 mi" },
    { type: "Dirt / Rally", name: "Cherry Field Trail", distance: "4.5 mi" },
    { type: "Dirt / Rally", name: "Chiheisen Scramble", distance: "4.9 mi" },
    { type: "Dirt / Rally", name: "Hirosaki Scramble", distance: "5.1 mi" },
    { type: "Dirt / Rally", name: "Hokubu Trail", distance: "3.6 mi" },
    { type: "Dirt / Rally", name: "Horizon Stadium Scramble", distance: "7.3 mi" },
    { type: "Dirt / Rally", name: "Ine Scramble", distance: "5.7 mi" },
    { type: "Dirt / Rally", name: "Ito Trail", distance: "4.4 mi" },
    { type: "Dirt / Rally", name: "Kawazu Nanadaru Scramble", distance: "7.8 mi" },
    { type: "Dirt / Rally", name: "Kinkaku-ji Trail", distance: "3.4 mi" },
    { type: "Dirt / Rally", name: "Legend Island Trail", distance: "3.3 mi" },
    { type: "Dirt / Rally", name: "Nukabira Trail", distance: "5.0 mi" },
    { type: "Dirt / Rally", name: "Oyashirazu Trail", distance: "3.2 mi" },
    { type: "Dirt / Rally", name: "Sekibe Scramble", distance: "4.0 mi" },
    { type: "Dirt / Rally", name: "Sotoyama Scramble", distance: "5.5 mi" },
    { type: "Dirt / Rally", name: "Sunflower Scramble", distance: "5.3 mi" },
    { type: "Dirt / Rally", name: "Taiyaki Scramble", distance: "6.7 mi" },
    { type: "Dirt / Rally", name: "Takashiro Trail", distance: "3.6 mi" },
    { type: "Dirt / Rally", name: "The Gauntlet", distance: "18.7 mi" }

];



/* =========================================================
   SCORING / REWARDS
   ========================================================= */

const POINTS_BY_PLACE = {

    1: 4,
    2: 3,
    3: 2,
    4: 1

};


const REWARDS_BY_PLACE = {

    1: {
        rolls: 0,
        keep: 0,
        text: "No upgrade"
    },

    2: {
        rolls: 1,
        keep: 1,
        text: "1 upgrade roll"
    },

    3: {
        rolls: 2,
        keep: 1,
        text: "2 rolls — keep 1"
    },

    4: {
        rolls: 2,
        keep: 2,
        text: "2 rolls — keep both"
    }

};



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

const hostAfterRaceControls =
    document.getElementById("hostAfterRaceControls");

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

const finalRaceHistory =
    document.getElementById("finalRaceHistory");

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

let currentRoomData =
    null;

let stopRoomListener =
    null;



/* =========================================================
   AUTH
   ========================================================= */

async function getCurrentPlayer() {

    if (auth.currentUser) {

        return auth.currentUser;

    }


    const result =
        await signInAnonymously(auth);


    return result.user;

}



/* =========================================================
   HELPERS
   ========================================================= */

function randomFromArray(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

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

    if (place === 1) return "1st";
    if (place === 2) return "2nd";
    if (place === 3) return "3rd";

    return place + "th";

}



/* =========================================================
   PLAYER LIST
   ========================================================= */

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



function renderPlayers(
    targetElement,
    players
) {

    targetElement.innerHTML =
        "";


    const sortedPlayers =
        getSortedPlayers(players);


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


            if (
                player.isHost
            ) {

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

    const standings = {};


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
                function ([placeString, result]) {


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


    header.innerHTML =
        `
        <span>POS</span>
        <span>PLAYER</span>
        <span style="text-align:right">PTS</span>
        <span style="text-align:right">WINS</span>
        `;


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


            row.innerHTML =
                `
                <span class="standing-position">
                    ${index + 1}
                </span>

                <span class="standing-name">
                    ${player.name}
                </span>

                <span class="standing-points">
                    ${player.points}
                </span>

                <span class="standing-wins">
                    🏆 ${player.wins}
                </span>
                `;


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
   GAME SETUP
   ========================================================= */

function updateGameSetupDisplay(
    roomData
) {

    const round =
        roomData.currentRound ||
        1;


    roundNumber.textContent =
        round;



    /* CAR */

    if (
        roomData.selectedCar
    ) {

        selectedCarName.textContent =
            roomData.selectedCar.name;


        selectedCarPI.textContent =
            "Starting PI: " +
            roomData.selectedCar.startingPI;

    }
    else {

        selectedCarName.textContent =
            "Waiting for host...";


        selectedCarPI.textContent =
            "Starting PI: —";

    }



    /* RACE */

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


    if (
        setupReady
    ) {

        roundReadyBadge.classList.remove(
            "hidden"
        );

    }
    else {

        roundReadyBadge.classList.add(
            "hidden"
        );

    }



    const isResultsPhase =
        roomData.gamePhase ===
        "results";


    if (
        currentPlayerIsHost &&
        !isResultsPhase
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



    if (
        setupReady &&
        currentPlayerIsHost &&
        !isResultsPhase
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



    if (
        !isResultsPhase
    ) {

        roundResultsPanel.classList.add(
            "hidden"
        );


        if (
            setupReady
        ) {

            gameNote.textContent =
                "Round " +
                round +
                " is ready. Run the race!";

        }
        else if (
            currentPlayerIsHost
        ) {

            gameNote.textContent =
                "Choose the car and generate the race.";

        }
        else {

            gameNote.textContent =
                "Waiting for the host to set up the race.";

        }

    }

}



/* =========================================================
   RESULT ENTRY FORM
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
                placeLabel(place);


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


            row.appendChild(
                label
            );


            row.appendChild(
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


    const race =
        roomData.raceHistory
            ? roomData.raceHistory[
                "round_" + round
            ]
            : null;


    if (
        !race
    ) {

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
        function (a, b) {

            return (
                Number(a[0]) -
                Number(b[0])
            );

        }
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


            resultRow.innerHTML =
                `
                <span class="result-place">
                    ${placeLabel(place)}
                </span>

                <span class="result-name">
                    ${result.name}
                </span>

                <span class="result-points">
                    +${POINTS_BY_PLACE[place] || 0} pts
                </span>
                `;


            roundResultsList.appendChild(
                resultRow
            );



            const reward =
                REWARDS_BY_PLACE[
                    place
                ];


            if (
                reward
            ) {

                const rewardRow =
                    document.createElement(
                        "div"
                    );


                rewardRow.classList.add(
                    "reward-row"
                );


                rewardRow.innerHTML =
                    `
                    <span class="result-place">
                        ${placeLabel(place)}
                    </span>

                    <div class="reward-info">

                        <strong>
                            ${result.name}
                        </strong>

                        <span>
                            ${reward.text}
                        </span>

                    </div>
                    `;


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


    if (
        currentPlayerIsHost
    ) {

        hostAfterRaceControls.classList.remove(
            "hidden"
        );

    }
    else {

        hostAfterRaceControls.classList.add(
            "hidden"
        );

    }


    gameNote.textContent =
        "Round " +
        round +
        " complete.";

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


    if (
        champion
    ) {

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


    renderRaceHistory(
        roomData.raceHistory
    );


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



function renderRaceHistory(
    raceHistory
) {

    finalRaceHistory.innerHTML =
        "";


    const races =
        Object.values(
            raceHistory || {}
        )
        .sort(
            function (a, b) {

                return (
                    a.round -
                    b.round
                );

            }
        );


    races.forEach(
        function (race) {


            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "history-card"
            );


            const heading =
                document.createElement(
                    "h3"
                );


            heading.textContent =
                "Round " +
                race.round +
                " — " +
                (
                    race.race
                        ? race.race.name
                        : "Race"
                );


            card.appendChild(
                heading
            );


            Object.entries(
                race.finishOrder || {}
            )
            .sort(
                function (a, b) {

                    return (
                        Number(a[0]) -
                        Number(b[0])
                    );

                }
            )
            .forEach(
                function (
                    [place, result]
                ) {


                    const line =
                        document.createElement(
                            "div"
                        );


                    line.classList.add(
                        "history-result"
                    );


                    line.innerHTML =
                        `
                        <span>
                            ${placeLabel(Number(place))}
                        </span>

                        <strong>
                            ${result.name}
                        </strong>
                        `;


                    card.appendChild(
                        line
                    );

                }
            );


            finalRaceHistory.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   ROOM LISTENER
   ========================================================= */

function clearRoomListener() {

    if (
        stopRoomListener
    ) {

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

                        if (
                            playerCount === 1
                        ) {

                            lobbyNote.textContent =
                                "Share the room code with the other players.";

                        }
                        else {

                            lobbyNote.textContent =
                                playerCount +
                                " players connected.";

                        }

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

                }

            }
        );

}



/* =========================================================
   SCREENS
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


    if (
        isHost
    ) {

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

    if (
        !currentRoomCode
    ) {

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


        if (
            !playerName
        ) {

            return;

        }


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


        if (
            !playerName
        ) {

            return;

        }


        const enteredCode =
            roomCodeInput
                .value
                .trim()
                .toUpperCase();


        if (
            enteredCode.length !==
            5
        ) {

            showHomeMessage(
                "Enter a 5-character room code.",
                "error"
            );


            return;

        }


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
                playerCount >=
                4
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

async function saveSelectedCar(
    car
) {

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
            selectedCar:
                car
        }

    );

}



setCarButton.addEventListener(
    "click",

    async function () {


        const car =
            CAR_LIBRARY.find(
                item =>
                    item.name ===
                    carSelect.value
            );


        if (
            car
        ) {

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

generateRaceButton.addEventListener(
    "click",

    async function () {


        if (
            !currentPlayerIsHost
        ) {

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
);



randomSetupButton.addEventListener(
    "click",

    async function () {


        if (
            !currentPlayerIsHost
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
                    car,

                currentRace:
                    race,

                gamePhase:
                    "racing"

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


        const uniqueUids =
            new Set(
                selectedUids
            );


        if (
            uniqueUids.size !==
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


        const historyReference =
            ref(
                database,

                "rooms/" +
                currentRoomCode +
                "/raceHistory/round_" +
                round
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
            function (
                select,
                index
            ) {


                const place =
                    index + 1;


                const uid =
                    select.value;


                const player =
                    currentRoomData
                        .players[
                            uid
                        ];


                const reward =
                    REWARDS_BY_PLACE[
                        place
                    ];


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
                        reward
                            ? reward.rolls
                            : 0,

                    upgradesKept:
                        reward
                            ? reward.keep
                            : 0,

                    rewardText:
                        reward
                            ? reward.text
                            : ""

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


        const roomReference =
            ref(
                database,
                "rooms/" +
                currentRoomCode
            );


        const updates =
            {};


        updates[
            "raceHistory/round_" +
            round
        ] =
            raceResult;


        updates.gamePhase =
            "results";


        await update(
            roomReference,
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
            !currentRoomData
        ) {

            return;

        }


        const nextRound =
            (
                currentRoomData.currentRound ||
                1
            ) + 1;


        resultsEntryPanel.classList.add(
            "hidden"
        );


        roundResultsPanel.classList.add(
            "hidden"
        );


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

endRaceNightButton.addEventListener(
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
                    "finished",

                finishedAt:
                    serverTimestamp()

            }

        );

    }
);



/* =========================================================
   LEAVE
   ========================================================= */

async function leaveCurrentRoom() {


    if (
        !currentRoomCode
    ) {

        return;

    }


    /*
        On the finished screen, don't destroy the room.
        Everyone gets time to view final results.
    */

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


        if (
            wasHost
        ) {

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
   INPUT
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