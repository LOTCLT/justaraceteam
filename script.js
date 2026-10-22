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
    serverTimestamp,
    runTransaction,
    query,
    orderByChild,
    limitToLast
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
    isUpgradeEligible,
    pruneIncompatibleGarage,
    randomFromArray,
    RACE_MAP_IMAGE_URL,
    RACE_MAP_SOURCE_URL,
    getRaceMapMeta
}
    from "./game-data.js?v=10";


import { firebaseConfig } from "./firebase-config.js?v=1";
import { communityCarFromDefinition, communityCarFromRecord } from "./community-data.js?v=1";

/* =========================================================
   FIREBASE
   ========================================================= */




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

const raceNightTabButton =
    document.getElementById("raceNightTabBtn");

const buildsTabButton =
    document.getElementById("buildsTabBtn");

const raceNightView =
    document.getElementById("raceNightView");

const buildComparisonView =
    document.getElementById("buildComparisonView");

const buildComparisonCarName =
    document.getElementById("buildComparisonCarName");

const buildComparisonTable =
    document.getElementById("buildComparisonTable");


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

const currentRaceCard =
    document.getElementById("currentRaceCard");

const raceMapCard =
    document.getElementById("raceMapCard");

const raceMapRegion =
    document.getElementById("raceMapRegion");

const raceMapImage =
    document.getElementById("raceMapImage");

const raceMapPin =
    document.getElementById("raceMapPin");

const raceMapNote =
    document.getElementById("raceMapNote");

const raceMapSource =
    document.getElementById("raceMapSource");


raceMapImage.src =
    RACE_MAP_IMAGE_URL;

raceMapSource.href =
    RACE_MAP_SOURCE_URL;

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

let activeGameTab =
    "race";


/* =========================================================
   STARTUP
   ========================================================= */

const communityCars = new Map();
let cachedCommunityDefinition = null;
let cachedCommunityCar = null;
populateCarSelect();


function populateCarSelect() {

    const previousSelection = carSelect.value;
    carSelect.innerHTML =
        "";


    [...CAR_LIBRARY, ...communityCars.values()].forEach(
        function (car) {

            const option =
                document.createElement(
                    "option"
                );


            option.value = car.communityId ? "community:" + car.communityId : car.name;


            option.textContent =
                car.name +
                " — " +
                car.startingPI + (car.communityId ? " · Community" : "");


            carSelect.appendChild(
                option
            );

        }
    );
    if ([...CAR_LIBRARY, ...communityCars.values()].some(car => (car.communityId ? "community:" + car.communityId : car.name) === previousSelection)) carSelect.value = previousSelection;

}


/* =========================================================
   GAME TABS
   ========================================================= */

function setActiveGameTab(tabName) {

    activeGameTab =
        tabName === "builds"
            ? "builds"
            : "race";


    const showingBuilds =
        activeGameTab ===
        "builds";


    raceNightView.classList.toggle(
        "hidden",
        showingBuilds
    );


    buildComparisonView.classList.toggle(
        "hidden",
        !showingBuilds
    );


    raceNightTabButton.classList.toggle(
        "active",
        !showingBuilds
    );


    buildsTabButton.classList.toggle(
        "active",
        showingBuilds
    );


    raceNightTabButton.setAttribute(
        "aria-selected",
        String(!showingBuilds)
    );


    buildsTabButton.setAttribute(
        "aria-selected",
        String(showingBuilds)
    );


    if (
        showingBuilds &&
        currentRoomData
    ) {

        renderBuildComparison(
            currentRoomData
        );

    }

}


raceNightTabButton.addEventListener(
    "click",
    function () {

        setActiveGameTab(
            "race"
        );

    }
);


buildsTabButton.addEventListener(
    "click",
    function () {

        setActiveGameTab(
            "builds"
        );

    }
);


/* =========================================================
   RACE TYPE COLORS
   ========================================================= */

const RACE_THEME_CLASSES = [
    "race-street",
    "race-road",
    "race-drag",
    "race-dirt",
    "race-rally",
    "race-cross-country",
    "race-touge"
];


function getRaceThemeClass(type) {

    const value =
        String(type || "")
            .trim()
            .toLowerCase();


    if (value.includes("street")) {
        return "race-street";
    }


    if (value.includes("drag")) {
        return "race-drag";
    }


    if (
        value.includes("cross") &&
        value.includes("country")
    ) {
        return "race-cross-country";
    }


    if (value.includes("touge")) {
        return "race-touge";
    }


    if (value.includes("rally")) {
        return "race-rally";
    }


    if (value.includes("dirt")) {
        return "race-dirt";
    }


    return "race-road";

}


function applyRaceTheme(type) {

    RACE_THEME_CLASSES.forEach(
        function (className) {

            currentRaceCard.classList.remove(
                className
            );

            raceMapCard.classList.remove(
                className
            );

            raceTypeBadge.classList.remove(
                className
            );

        }
    );


    if (!type) {
        return;
    }


    const className =
        getRaceThemeClass(
            type
        );


    currentRaceCard.classList.add(
        className
    );


    raceMapCard.classList.add(
        className
    );


    raceTypeBadge.classList.add(
        className
    );

}


/* =========================================================
   APPROXIMATE RACE MAP
   ========================================================= */

const RACE_MAP_PIN_CLASSES = [
    "map-race-street",
    "map-race-road",
    "map-race-drag",
    "map-race-dirt",
    "map-race-rally",
    "map-race-cross-country",
    "map-race-touge"
];


function applyRaceMap(race) {

    RACE_MAP_PIN_CLASSES.forEach(
        function (className) {

            raceMapPin.classList.remove(
                className
            );

        }
    );


    const meta =
        getRaceMapMeta(
            race
        );


    if (!race || !meta) {

        raceMapCard.classList.add(
            "hidden"
        );

        return;
    }


    raceMapRegion.textContent =
        meta.region;


    raceMapPin.style.left =
        meta.x + "%";

    raceMapPin.style.top =
        meta.y + "%";


    raceMapNote.textContent =
        meta.note;


    const themeClass =
        getRaceThemeClass(
            race.type
        );


    raceMapPin.classList.add(
        "map-" + themeClass
    );


    raceMapCard.classList.remove(
        "hidden"
    );

}


/* =========================================================
   BUILD COMPARISON COLORS / TABLE
   ========================================================= */

function getBuildValueClass(
    upgrade,
    optionName
) {

    const value =
        String(optionName || "")
            .trim()
            .toLowerCase();


    const stock =
        getStockForUpgrade(
            upgrade
        );


    if (
        stock &&
        String(stock.name) ===
            String(optionName)
    ) {
        return "build-stock";
    }


    if (value.includes("rally")) {
        return "build-rally";
    }


    if (
        value.includes("offroad") ||
        value.includes("off-road")
    ) {
        return "build-offroad";
    }


    if (value.includes("drift")) {
        return "build-drift";
    }


    if (value.includes("snow")) {
        return "build-snow";
    }


    if (value.includes("drag")) {
        return "build-drag";
    }


    if (
        value.includes("semi-slick") ||
        value.includes("semi slick")
    ) {
        return "build-semislick";
    }


    if (value.includes("street")) {
        return "build-street";
    }


    if (value.includes("sport")) {
        return "build-sport";
    }


    if (
        value.includes("race") ||
        value === "slick tires"
    ) {
        return "build-race";
    }


    if (value.includes("turbo")) {
        return "build-turbo";
    }


    if (value.includes("supercharger")) {
        return "build-supercharger";
    }


    if (value === "awd") {
        return "build-awd";
    }


    if (value === "rwd") {
        return "build-rwd";
    }


    const option =
        upgrade && upgrade.options
            ? upgrade.options.find(
                item =>
                    item.name ===
                    optionName
            )
            : null;


    const tier =
        option
            ? Number(option.tier || 0)
            : 0;


    if (tier <= 0) {
        return "build-stock";
    }


    if (tier === 1) {
        return "build-street";
    }


    if (tier === 2) {
        return "build-sport";
    }


    if (tier >= 3) {
        return "build-race";
    }


    return "build-other";

}


function createBuildCell(
    upgrade,
    optionName,
    changedFromStock
) {

    const cell =
        document.createElement(
            "td"
        );


    if (optionName === "—") {
        cell.classList.add(
            "build-value",
            "build-inactive"
        );
        cell.textContent = "—";
        return cell;
    }


    cell.classList.add(
        "build-value",
        getBuildValueClass(
            upgrade,
            optionName
        )
    );


    if (changedFromStock) {

        cell.classList.add(
            "build-changed"
        );

    }


    cell.textContent =
        optionName;


    return cell;

}


function renderBuildComparison(
    roomData
) {

    buildComparisonTable.innerHTML =
        "";


    const car =
        getSelectedCarDefinition(
            roomData
        );


    if (!car) {

        buildComparisonCarName.textContent =
            "Waiting for host...";


        const empty =
            document.createElement(
                "div"
            );


        empty.classList.add(
            "build-empty-message"
        );


        empty.textContent =
            "Choose the race-night car first.";


        buildComparisonTable.appendChild(
            empty
        );


        return;

    }


    buildComparisonCarName.textContent =
        car.name +
        " — " +
        car.startingPI;


    const players =
        getSortedPlayers(
            roomData.players
        );


    const table =
        document.createElement(
            "table"
        );


    table.classList.add(
        "build-table"
    );


    const thead =
        document.createElement(
            "thead"
        );


    const headerRow =
        document.createElement(
            "tr"
        );


    const modHeader =
        document.createElement(
            "th"
        );


    modHeader.classList.add(
        "build-mod-column"
    );


    modHeader.textContent =
        "MOD";


    headerRow.appendChild(
        modHeader
    );


    const stockHeader =
        document.createElement(
            "th"
        );


    stockHeader.textContent =
        "STOCK";


    headerRow.appendChild(
        stockHeader
    );


    players.forEach(
        function ([uid, player]) {

            const th =
                document.createElement(
                    "th"
                );


            th.textContent =
                player.name;


            if (
                uid ===
                currentUserUid
            ) {

                th.textContent +=
                    " (YOU)";

            }


            headerRow.appendChild(
                th
            );

        }
    );


    thead.appendChild(
        headerRow
    );


    table.appendChild(
        thead
    );


    const tbody =
        document.createElement(
            "tbody"
        );


    let lastCategory =
        null;


    const stockGarage = {};

    const visibleUpgrades =
        car.upgrades.filter(
            function (upgrade) {

                if (
                    isUpgradeEligible(
                        car,
                        stockGarage,
                        upgrade
                    )
                ) {
                    return true;
                }

                return players.some(
                    function ([uid]) {
                        const garage =
                            roomData.garages &&
                            roomData.garages[uid]
                                ? roomData.garages[uid]
                                : {};

                        return isUpgradeEligible(
                            car,
                            garage,
                            upgrade
                        );
                    }
                );
            }
        );


    visibleUpgrades.forEach(
        function (upgrade) {

            if (
                upgrade.category !==
                lastCategory
            ) {

                lastCategory =
                    upgrade.category;


                const categoryRow =
                    document.createElement(
                        "tr"
                    );


                const categoryCell =
                    document.createElement(
                        "td"
                    );


                categoryCell.colSpan =
                    players.length +
                    2;


                categoryCell.classList.add(
                    "build-category-row"
                );


                categoryCell.textContent =
                    upgrade.category;


                categoryRow.appendChild(
                    categoryCell
                );


                tbody.appendChild(
                    categoryRow
                );

            }


            const row =
                document.createElement(
                    "tr"
                );


            const modCell =
                document.createElement(
                    "td"
                );


            modCell.classList.add(
                "build-mod-column"
            );


            modCell.textContent =
                upgrade.variantLabel
                    ? upgrade.mod +
                      " · " +
                      upgrade.variantLabel
                    : upgrade.mod;


            row.appendChild(
                modCell
            );


            const stockEligible =
                isUpgradeEligible(
                    car,
                    stockGarage,
                    upgrade
                );


            const stock =
                getStockForUpgrade(
                    upgrade
                );


            const stockName =
                stockEligible && stock
                    ? stock.name
                    : "—";


            row.appendChild(
                createBuildCell(
                    upgrade,
                    stockName,
                    false
                )
            );


            players.forEach(
                function ([uid]) {

                    const garage =
                        roomData.garages &&
                        roomData.garages[uid]
                            ? roomData.garages[uid]
                            : {};


                    const eligible =
                        isUpgradeEligible(
                            car,
                            garage,
                            upgrade
                        );


                    if (!eligible) {
                        row.appendChild(
                            createBuildCell(
                                upgrade,
                                "—",
                                false
                            )
                        );
                        return;
                    }


                    const installed =
                        garage[
                            upgrade.id
                        ];


                    const base =
                        getStockForUpgrade(
                            upgrade
                        );


                    const baseName =
                        base
                            ? base.name
                            : "—";


                    const optionName =
                        installed
                            ? installed.option
                            : baseName;


                    row.appendChild(
                        createBuildCell(
                            upgrade,
                            optionName,
                            optionName !==
                                baseName
                        )
                    );

                }
            );


            tbody.appendChild(
                row
            );

        }
    );



    table.appendChild(
        tbody
    );


    buildComparisonTable.appendChild(
        table
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


    if (roomData.selectedCar.communityId) {
        const definition = roomData.selectedCar.definition;
        if (cachedCommunityDefinition === definition && cachedCommunityCar?.communityId === roomData.selectedCar.communityId && cachedCommunityCar.name === roomData.selectedCar.name && cachedCommunityCar.startingPI === roomData.selectedCar.startingPI) return cachedCommunityCar;
        try {
            const car = communityCarFromDefinition(definition, roomData.selectedCar.communityId);
            if (car.name !== roomData.selectedCar.name || car.startingPI !== roomData.selectedCar.startingPI) return null;
            cachedCommunityDefinition = definition; cachedCommunityCar = car;
            return car;
        } catch { return null; }
    }
    return getCarByName(roomData.selectedCar.name);

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
    players,
    allowRemoval = false
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

            if (
                allowRemoval && currentPlayerIsHost &&
                ["lobby", "playing"].includes(currentRoomData?.status) &&
                currentRoomData.hostUid === currentUserUid &&
                uid !== currentUserUid && !player.isHost
            ) {
                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "small-button remove-player-button";
                removeButton.textContent = "Remove";
                removeButton.setAttribute("aria-label", "Remove " + player.name + " from the roster");
                removeButton.addEventListener("click", async () => {
                    removeButton.disabled = true;
                    try { await removeRosterPlayer(uid); }
                    finally { removeButton.disabled = false; }
                });
                row.appendChild(removeButton);
            }

            targetElement.appendChild(
                row
            );

        }
    );


    return sortedPlayers.length;

}

async function removeRosterPlayer(uid) {
    if (!currentPlayerIsHost || !["lobby", "playing"].includes(currentRoomData?.status) ||
        currentRoomData.hostUid !== currentUserUid || uid === currentUserUid) return;
    const player = currentRoomData.players?.[uid];
    if (!player || player.isHost) return;
    const playing = currentRoomData.status === "playing";
    const detail = playing
        ? "Their past results stay saved and pending upgrades are withdrawn. They cannot rejoin this race night. Everyone else can keep playing."
        : "They can rejoin with the room code if needed.";
    if (!window.confirm("Remove " + player.name + " from the roster? " + detail)) return;

    const result = await hostTransaction(room => {
        // Do not let a lobby confirmation silently become an in-game removal.
        if (room.status !== (playing ? "playing" : "lobby") || uid === room.hostUid ||
            !room.players?.[uid] || room.players[uid].isHost) return;
        if (playing) {
            room.departedPlayers ||= {};
            room.departedPlayers[uid] = {...room.players[uid], leftAt: Date.now(), leftRound: room.currentRound || 1};
            const pack = room.upgradeRounds?.[getRoundKey(room.currentRound || 1)]?.players?.[uid];
            // Keep the original rolls/applied history. Undo retains withdrawal,
            // so it cannot reopen decisions for someone who has gone home.
            if (pack) pack.withdrawn = true;
        }
        delete room.players[uid];
        return room;
    });
    document.getElementById("rosterStatus").textContent = result?.committed
        ? player.name + " was removed."
        : "That player could not be removed. The room changed; check the roster and try again.";
}

function renderRosterControls(room) {
    const canEdit = currentPlayerIsHost && room?.hostUid === currentUserUid && ["lobby", "playing"].includes(room.status);
    for (const id of ["editLobbyRosterBtn", "editGameRosterBtn"]) document.getElementById(id).classList.toggle("hidden", !canEdit);
    const dialog = document.getElementById("rosterDialog");
    if (!canEdit) { if (dialog.open) dialog.close(); return; }
    if (dialog.open) renderPlayers(document.getElementById("rosterPlayerList"), room.players, true);
}
for (const id of ["editLobbyRosterBtn", "editGameRosterBtn"]) {
    document.getElementById(id).addEventListener("click", () => {
        if (!currentPlayerIsHost || currentRoomData?.hostUid !== currentUserUid || !["lobby", "playing"].includes(currentRoomData.status)) return;
        const dialog = document.getElementById("rosterDialog");
        document.getElementById("rosterStatus").textContent = "";
        renderPlayers(document.getElementById("rosterPlayerList"), currentRoomData.players, true);
        if (!dialog.open) dialog.showModal();
    });
}
document.getElementById("closeRosterBtn").addEventListener("click", () => document.getElementById("rosterDialog").close());


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


    if (
        !isUpgradeEligible(
            car,
            playerGarage,
            upgrade
        )
    ) {

        const unavailableBase =
            getStockForUpgrade(
                upgrade
            );

        const unavailableExisting =
            playerGarage[
                roll.modId
            ];

        const unavailableOption =
            unavailableExisting
                ? unavailableExisting.option
                : (unavailableBase
                    ? unavailableBase.name
                    : "Unavailable");

        const unavailableTier =
            unavailableExisting
                ? Number(unavailableExisting.tier || 0)
                : (unavailableBase
                    ? Number(unavailableBase.tier || 0)
                    : 0);

        return {
            previousOption: unavailableOption,
            previousTier: unavailableTier,
            resultOption: unavailableOption,
            resultTier: unavailableTier,
            outcome: "INCOMPATIBLE - KEEP",
            changed: false
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

            variant:
                upgrade.variantLabel ||
                roll.variant ||
                "",

            option:
                resultOption,

            tier:
                resultTier,

            installedRound:
                round

        };


        pruneIncompatibleGarage(
            car,
            playerGarage
        );

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

        decisionRequired:
            reward.rolls > 0,

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


    /*
        Every roll is previewed against the
        player's build at the start of the
        upgrade phase. The player can then
        Apply or Pass each eligible roll.
    */

    for (
        let i = 0;
        i < reward.rolls;
        i++
    ) {

        const baseRoll =
            getRandomUpgradeRoll(
                car,
                originalGarage
            );


        if (!baseRoll) {
            continue;
        }


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


    packageData.rolls =
        rolls;


    return packageData;

}

function getDecisionKey(
    rollIndex
) {

    return (
        "roll_" +
        (
            rollIndex +
            1
        )
    );

}


function getRollDecision(
    packageData,
    rollIndex
) {

    if (!rollNeedsDecision(normalizeRolls(packageData.rolls)[rollIndex])) return "pass";
    const key = getDecisionKey(rollIndex);


    return (
        packageData.decisions &&
        packageData.decisions[key]
            ? packageData.decisions[key]
            : null
    );

}


function getAppliedRollIndices(
    packageData
) {

    const rolls =
        normalizeRolls(
            packageData.rolls
        );


    return rolls
        .map(
            function (unused, index) {

                return index;

            }
        )
        .filter(
            function (index) {

                return (
                    getRollDecision(
                        packageData,
                        index
                    ) ===
                    "apply"
                );

            }
        )
        .slice(
            0,
            Math.max(
                0,
                Number(
                    packageData.keepCount ||
                    0
                )
            )
        );

}

function packageDecisionsReady(
    packageData
) {
    if (packageData.withdrawn) return true;

    const rolls =
        normalizeRolls(
            packageData.rolls
        );


    if (
        rolls.length === 0
    ) {

        return true;

    }


    const decisions =
        rolls.map(
            function (unused, index) {

                return getRollDecision(
                    packageData,
                    index
                );

            }
        );


    if (
        decisions.some(
            decision =>
                decision !== "apply" &&
                decision !== "pass"
        )
    ) {

        return false;

    }


    const applyCount =
        decisions.filter(
            decision =>
                decision === "apply"
        ).length;


    return (
        applyCount <=
        Number(
            packageData.keepCount ||
            0
        )
    );

}


function allUpgradeDecisionsReady(
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
        packageDecisionsReady
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


        if (getSelectedCarDefinition(roomData)) {

            const selected = getSelectedCarDefinition(roomData);
            if (selected.communityId && !communityCars.has(selected.communityId)) {
                communityCars.set(selected.communityId, selected); populateCarSelect();
            }
            carSelect.value = selected.communityId ? "community:" + selected.communityId : selected.name;

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


        applyRaceTheme(
            roomData.currentRace.type
        );


        applyRaceMap(
            roomData.currentRace
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


        applyRaceTheme(
            null
        );


        applyRaceMap(
            null
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


    if (!editingResults) resultsEntryPanel.classList.add("hidden");


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


    if (
        outcome === "LOCKED - KEEP" ||
        outcome === "INCOMPATIBLE - KEEP"
    ) {
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


    const decision =
        getRollDecision(
            packageData,
            rollIndex
        );


    if (
        decision ===
        "apply"
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
        roll.variant
            ? roll.mod +
              " · " +
              roll.variant
            : roll.mod;


    const option =
        document.createElement(
            "div"
        );


    option.classList.add(
        "roll-option",
        getBuildValueClass(
            getUpgradeById(
                getSelectedCarDefinition(
                    roomData
                ),
                roll.modId
            ),
            roll.option
        )
    );


    option.textContent = "Rolled: " + roll.option;


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


    outcome.textContent = "Result: " + roll.outcome;


    const definition = getUpgradeById(getSelectedCarDefinition(roomData), roll.modId);
    const context = document.createElement("p");
    context.className = "roll-current";
    context.textContent = (definition?.requirements || []).map(req => "Requires " + (getUpgradeById(getSelectedCarDefinition(roomData), req.modId)?.mod || "") + " " + (req.options || []).join(" / ")).join(" · ");
    card.append(
        rollNumber,
        category,
        mod,
        context,
        current,
        option,
        outcome
    );


    if (decision) {

        const decisionBadge =
            document.createElement(
                "div"
            );


        decisionBadge.classList.add(
            "roll-decision-badge",
            decision === "apply"
                ? "roll-decision-apply"
                : "roll-decision-pass"
        );


        decisionBadge.textContent =
            decision === "apply"
                ? "APPLY · LOCKED"
                : (rollNeedsDecision(roll) ? "PASS · LOCKED" : "AUTO · KEEP CURRENT");


        card.appendChild(
            decisionBadge
        );

    }


    const canDecide = !decision && !decisionSaving && rollNeedsDecision(roll) &&
        (
            packageData.uid ===
                currentUserUid &&
            roomData.gamePhase ===
                "upgrades" &&
            !packageData.resolved
        );


    if (canDecide) {

        const controls =
            document.createElement(
                "div"
            );


        controls.classList.add(
            "roll-decision-controls"
        );


        const applyButton =
            document.createElement(
                "button"
            );


        applyButton.type =
            "button";


        applyButton.className =
            "apply-roll-button";


        applyButton.textContent =
            "Apply";


        if (
            decision ===
            "apply"
        ) {

            applyButton.classList.add(
                "selected-decision"
            );

        }


        applyButton.addEventListener(
            "click",
            function () {

                saveUpgradeDecision(
                    rollIndex,
                    "apply"
                );

            }
        );


        const passButton =
            document.createElement(
                "button"
            );


        passButton.type =
            "button";


        passButton.className =
            "pass-roll-button";


        passButton.textContent =
            "Pass";


        if (
            decision ===
            "pass"
        ) {

            passButton.classList.add(
                "selected-decision"
            );

        }


        passButton.addEventListener(
            "click",
            function () {

                saveUpgradeDecision(
                    rollIndex,
                    "pass"
                );

            }
        );


        controls.append(
            applyButton,
            passButton
        );


        card.appendChild(
            controls
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


    if (!editingResults) resultsEntryPanel.classList.add("hidden");


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
        .filter(pack => !pack.withdrawn)
        .sort(
            (a, b) =>
                a.place -
                b.place
        );


    let currentPlayerNeedsDecision =
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
                rolls.length > 0
            ) {

                const choiceStatus =
                    document.createElement(
                        "div"
                    );


                choiceStatus.classList.add(
                    "choice-status"
                );


                const ready =
                    packageDecisionsReady(
                        packageData
                    );


                if (
                    packageData.resolved
                ) {

                    choiceStatus.textContent =
                        "Upgrade decisions applied.";

                }
                else if (
                    ready
                ) {

                    choiceStatus.textContent =
                        packageData.uid === currentUserUid
                            ? "Your Apply / Pass decisions are locked in."
                            : packageData.name + " is ready.";

                }
                else if (
                    packageData.uid ===
                    currentUserUid
                ) {

                    choiceStatus.textContent =
                        packageData.keepCount === 1 && rolls.length > 1
                            ? "Apply at most one roll, or pass on both."
                            : "Choose Apply or Pass for each roll.";


                    currentPlayerNeedsDecision =
                        true;

                }
                else {

                    choiceStatus.textContent =
                        "Waiting for " +
                        packageData.name +
                        " to decide.";

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
        allUpgradeDecisionsReady(
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
                    ? "Everyone has chosen Apply or Pass. Apply the selected upgrades."
                    : "Waiting for player Apply / Pass decisions.";

        }
        else {

            hostApplyUpgradesControls.classList.add(
                "hidden"
            );


            upgradeStatusMessage.textContent =
                currentPlayerNeedsDecision
                    ? "Choose Apply or Pass for your upgrade roll(s)."
                    : "Waiting for the other players or the host.";

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
                            upgrade.variant
                                ? upgrade.mod +
                                  " · " +
                                  upgrade.variant
                                : upgrade.mod;


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

                if (currentRoomCode !== roomCode) return;

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

                if (!roomData.players?.[currentUserUid]) {
                    returnToHome("You are no longer on this room’s roster. Your past results remain saved.", "error");
                    return;
                }

                currentRoomData =
                    roomData;
                if (roomData.gamePhase !== "results") editingResults = false;
                renderV9(roomData);


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


                renderBuildComparison(
                    roomData
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
    rememberRoom(roomCode);


    currentPlayerName =
        playerName;


    currentPlayerIsHost =
        isHost;


    setActiveGameTab(
        "race"
    );


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
    const rosterDialog = document.getElementById("rosterDialog");
    if (rosterDialog.open) rosterDialog.close();

    currentRoomCode =
        null;


    currentPlayerName =
        null;


    currentPlayerIsHost =
        false;


    currentRoomData =
        null;


    setActiveGameTab(
        "race"
    );


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


            const existingPlayer =
                roomData.players &&
                roomData.players[
                    user.uid
                ];


            // A player who was already part of this room may
            // reconnect after the race night has started.
            // Firebase anonymous auth normally keeps the same
            // UID on the same browser/device, so no room write
            // is needed for a reconnect.
            if (existingPlayer) {

                showLobby(
                    enteredCode,
                    existingPlayer.name ||
                        playerName,
                    existingPlayer.isHost ===
                        true
                );


                return;

            }


            if (
                roomData.status !==
                "lobby"
            ) {

                showHomeMessage(
                    "That game has already started. Existing players can rejoin from the same browser/device they originally used.",
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
            car.startingPI,

        ...(car.communityId ? {communityId: car.communityId, definition: car.definition} : {})

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
            carSelect.value.startsWith("community:")
                ? communityCars.get(carSelect.value.slice(10))
                : getCarByName(carSelect.value);


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
        editingResults = false;

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
            existingResult.exists() && !editingResults
        ) {

            resultEntryMessage.textContent =
                "Results for this round were already submitted.";


            resultEntryMessage.className =
                "message center-message error";


            return;

        }


        if (JSON.stringify(Object.keys(currentRoomData.players || {}).sort()) !== JSON.stringify([...selectedUids].sort())) {
            resultEntryMessage.textContent = "The roster changed. Reopen Enter Results to use the remaining players.";
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
                {
                    name: currentRoomData.selectedCar.name,
                    startingPI: currentRoomData.selectedCar.startingPI,
                    ...(currentRoomData.selectedCar.communityId ? {communityId: currentRoomData.selectedCar.communityId} : {})
                },

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


        updates.gamePhase = "results";
        if (currentRoomData.upgradeRounds?.[roundKey]) return;


        const submission = await hostTransaction(room => {
            if ((room.currentRound || 1) !== round) return;
            if (room.upgradeRounds?.[roundKey] || !["racing", "results"].includes(room.gamePhase)) return;
            if (room.raceHistory?.[roundKey] && !editingResults) return;
            if (JSON.stringify(Object.keys(room.players || {}).sort()) !== JSON.stringify([...selectedUids].sort())) return;
            return applyRoomUpdates(room, updates);
        });
        if (submission?.committed) {
            editingResults = false;
            resultsEntryPanel.classList.add("hidden");
        }

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


        await hostTransaction(room => {
            if ((room.currentRound || 1) !== round) return;
            if (room.gamePhase !== "results" || room.upgradeRounds?.[roundKey]) return;
            if (JSON.stringify(room.raceHistory?.[roundKey]?.finishOrder) !== JSON.stringify(race.finishOrder)) return;
            const path = "upgradeRounds/" + roundKey;
            const activePackages = Object.fromEntries(Object.entries(playerPackages).filter(([uid]) => room.players?.[uid]));
            return applyRoomUpdates(room, {...updates, [path]: {...updates[path], players: activePackages}});
        });

    }
);


/* =========================================================
   PLAYER APPLY / PASS DECISIONS
   ========================================================= */

let decisionSaving = false;
function rollNeedsDecision(roll) {
    return !!roll && Number(roll.tier) > 0 && ["UPGRADE", "SIDEGRADE"].includes(roll.outcome);
}
async function saveUpgradeDecision(rollIndex, decision) {
    if (decisionSaving || !["apply", "pass"].includes(decision) || currentRoomData?.gamePhase !== "upgrades") return;
    const roundKey = getRoundKey(currentRoomData.currentRound || 1);
    const pack = currentRoomData.upgradeRounds?.[roundKey]?.players?.[currentUserUid];
    const rolls = normalizeRolls(pack?.rolls);
    if (!pack || pack.resolved || !rollNeedsDecision(rolls[rollIndex]) || getRollDecision(pack, rollIndex)) return;
    decisionSaving = true;
    renderUpgradePanel(currentRoomData);
    try {
        await runTransaction(ref(database, "rooms/" + currentRoomCode + "/upgradeRounds/" + roundKey + "/players/" + currentUserUid + "/decisions"), old => {
            const choices = {...(old || {})};
            const key = getDecisionKey(rollIndex);
            if (choices[key]) return;
            if (decision === "apply" && Object.values(choices).filter(x => x === "apply").length >= pack.keepCount) return;
            choices[key] = decision;
            if (decision === "apply" && Number(pack.keepCount) === 1) {
                rolls.forEach((roll, index) => {
                    if (index !== rollIndex && !choices[getDecisionKey(index)]) choices[getDecisionKey(index)] = "pass";
                });
            }
            return choices;
        }, {applyLocally: false});
    } catch (error) {
        showHomeMessage("Could not save choice: " + error.message, "error");
        alert("Could not save your choice. Please try again. " + error.message);
    } finally {
        decisionSaving = false;
        renderUpgradePanel(currentRoomData);
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
            !allUpgradeDecisionsReady(
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
                if (packageData.withdrawn) return;

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
                    getAppliedRollIndices(
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


        updates.upgradeUndo = {round, garages: cloneObject(currentRoomData.garages || {})};
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


        await hostTransaction(room => {
            if ((room.currentRound || 1) !== round) return;
            if (room.gamePhase !== "upgrades" || !allUpgradeDecisionsReady(room.upgradeRounds?.[roundKey])) return;
            const latestPackages = room.upgradeRounds[roundKey].players || {};
            if (Object.entries(upgradeRound.players || {}).some(([uid, pack]) =>
                !!pack.withdrawn !== !!latestPackages[uid]?.withdrawn ||
                normalizeRolls(pack.rolls).some((roll, index) =>
                    getRollDecision(pack, index) !== getRollDecision(latestPackages[uid] || {}, index)))) return;
            return applyRoomUpdates(room, updates);
        });

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


        await hostTransaction(room => {
            if (room.gamePhase !== "upgradeComplete" || (room.currentRound || 1) !== nextRound - 1) return;
            room.currentRound = nextRound;
            room.currentRace = room.queuedRace || pickNextRace(room.currentRace);
            delete room.queuedRace; delete room.upgradeUndo;
            room.gamePhase = "racing"; room.raceGeneratedAt = Date.now();
            return room;
        });

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

            // Once a race night is underway, keep the player's
            // room record/garage intact so they can reconnect.
            // In the pre-game lobby, Leave still removes the
            // player and frees the slot like before.
            if (
                currentRoomData &&
                currentRoomData.status ===
                    "playing"
            ) {

                returnToHome(
                    "You left the game screen. Re-enter the room code to reconnect.",
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

/* V9: one queued race, one undo snapshot, and browser-local reconnect. */
let editingResults = false;
function pickNextRace(current) {
    return randomFromArray(RACE_POOL.filter(race => RACE_POOL.length === 1 || race.name !== current?.name));
}
function rememberRoom(code) {
    try { localStorage.setItem("jart:lastRoom", code); } catch {}
    const button = document.getElementById("resumeGameBtn");
    button.textContent = "Resume Race Night · Room " + code;
    button.classList.remove("hidden");
}
function readLastRoom() {
    try { return localStorage.getItem("jart:lastRoom"); } catch { return null; }
}
function renderV9(room) {
    renderRosterControls(room);
    const round = room.currentRound || 1;
    const phase = room.gamePhase;
    const upgradeRound = room.upgradeRounds?.[getRoundKey(round)];
    const packs = Object.values(upgradeRound?.players || {}).filter(pack => !pack.withdrawn);
    const waiting = packs.filter(pack => !packageDecisionsReady(pack)).map(pack => pack.name);
    document.getElementById("decisionStatus").textContent = packs.map(pack =>
        (packageDecisionsReady(pack) ? "✓ " : "… ") + pack.name).join(" · ") +
        (waiting.length ? " — Waiting on: " + waiting.join(", ") : " — Everyone is ready");
    document.getElementById("nextRaceControls").classList.toggle("hidden", !currentPlayerIsHost || !["upgrades", "upgradeComplete"].includes(phase));
    document.getElementById("queueRaceBtn").disabled = !!room.queuedRace;
    const preview = document.getElementById("queuedRacePreview");
    preview.replaceChildren();
    if (room.queuedRace) {
        const race = room.queuedRace;
        const meta = getRaceMapMeta(race);
        const title = document.createElement("p");
        title.textContent = "NEXT RACE · " + race.type + " · " + race.name + " · " + race.distance;
        preview.append(title);
        if (meta) {
            const map = document.createElement("div"); map.className = "queue-map";
            const image = document.createElement("img"); image.src = RACE_MAP_IMAGE_URL; image.alt = "Approximate next race location: " + meta.region;
            const pin = document.createElement("span"); pin.className = "queue-pin map-" + getRaceThemeClass(race.type);
            pin.style.left = meta.x + "%"; pin.style.top = meta.y + "%";
            map.append(image, pin); preview.append(map);
            const note = document.createElement("p"); note.textContent = meta.region + " · " + meta.note; preview.append(note);
        }
    }
    document.getElementById("undoUpgradesBtn").disabled = phase !== "upgradeComplete" || room.upgradeUndo?.round !== round;
    document.getElementById("editResultsBtn").disabled = phase !== "results" || !!upgradeRound;
    const recap = document.getElementById("finalRecap"); recap.replaceChildren();
    const standings = calculateStandings(room.players, room.raceHistory);
    const totals = {};
    Object.values(room.upgradeRounds || {}).forEach(r => Object.entries(r.players || {}).forEach(([uid, pack]) => {
        Object.values(pack.applied || {}).forEach(result => {
            if (["UPGRADE", "SIDEGRADE"].includes(result.outcome)) totals[uid] = (totals[uid] || 0) + 1;
        });
    }));
    standings.forEach(player => {
        const row = document.createElement("p");
        const uid = player.uid;
        row.textContent = player.name + " · " + player.wins + " wins · " +
            (player.wins + player.seconds + player.thirds) + " podiums · " + (totals[uid] || 0) + " upgrades applied";
        recap.append(row);
    });
}
async function hostTransaction(change) {
    if (!currentPlayerIsHost || !currentRoomCode) return;
    try {
        return await runTransaction(ref(database, "rooms/" + currentRoomCode), room => {
            if (!room || room.hostUid !== currentUserUid) return;
            return change(room);
        }, {applyLocally: false});
    } catch (error) { alert("Could not save the change: " + error.message); }
}
document.getElementById("queueRaceBtn").addEventListener("click", async () => {
    const race = pickNextRace(currentRoomData?.currentRace);
    await hostTransaction(room => {
        if (!["upgrades", "upgradeComplete"].includes(room.gamePhase) || room.queuedRace) return;
        room.queuedRace = race; return room;
    });
});
document.getElementById("undoUpgradesBtn").addEventListener("click", async () => {
    await hostTransaction(room => {
        if (room.gamePhase !== "upgradeComplete" || room.upgradeUndo?.round !== room.currentRound) return;
        room.garages = room.upgradeUndo.garages || {};
        const upgradeRound = room.upgradeRounds[getRoundKey(room.currentRound)];
        Object.values(upgradeRound.players || {}).forEach(pack => {
            delete pack.decisions; delete pack.applied; pack.resolved = false;
        });
        delete upgradeRound.appliedAt; delete room.upgradeUndo;
        room.gamePhase = "upgrades"; return room;
    });
});
document.getElementById("editResultsBtn").addEventListener("click", () => {
    const key = getRoundKey(currentRoomData.currentRound || 1);
    if (!currentPlayerIsHost || currentRoomData.gamePhase !== "results" || currentRoomData.upgradeRounds?.[key]) return;
    editingResults = true; buildFinishOrderForm();
    const order = currentRoomData.raceHistory[key].finishOrder;
    finishOrderInputs.querySelectorAll("select").forEach((select, index) => { select.value = order[index + 1]?.uid || ""; });
    resultsEntryPanel.classList.remove("hidden"); resultsEntryPanel.scrollIntoView({behavior: "smooth"});
});
const resumeButton = document.getElementById("resumeGameBtn");
const lastRoom = readLastRoom();
if (lastRoom && /^[A-Z0-9]{4,8}$/.test(lastRoom)) {
    resumeButton.textContent = "Resume Race Night · Room " + lastRoom;
    resumeButton.classList.remove("hidden");
}
resumeButton.addEventListener("click", async () => {
    resumeButton.disabled = true;
    try {
        const user = await getCurrentPlayer();
        const snapshot = await get(ref(database, "rooms/" + readLastRoom()));
        const room = snapshot.val(); const player = room?.players?.[user.uid];
        if (!player) { showHomeMessage("Your previous player slot is unavailable. Join or create a room below.", "error"); return; }
        showLobby(readLastRoom(), player.name, player.isHost === true);
    } catch (error) { showHomeMessage("Could not resume: " + error.message, "error"); }
    finally { resumeButton.disabled = false; }
});

function applyRoomUpdates(room, updates) {
    Object.entries(updates).forEach(([path, value]) => {
        const keys = path.split("/"); let parent = room;
        keys.slice(0, -1).forEach(key => { parent = parent[key] ||= {}; });
        if (value === null) delete parent[keys.at(-1)]; else parent[keys.at(-1)] = value;
    });
    return room;
}

// Explicit loading keeps community cars separate from the reviewed random pool.
document.getElementById("loadCommunityCarsBtn").addEventListener("click", async () => {
    if (!currentPlayerIsHost) return;
    const button = document.getElementById("loadCommunityCarsBtn");
    const status = document.getElementById("communityCarsStatus");
    button.disabled = true; status.textContent = "Loading Community Cars…";
    try {
        await getCurrentPlayer();
        const snapshot = await get(query(ref(database, "communityCars"), orderByChild("createdAt"), limitToLast(100)));
        let skipped = 0;
        communityCars.clear();
        for (const [id, record] of Object.entries(snapshot.val() || {})) {
            try { communityCars.set(id, communityCarFromRecord(id, record)); }
            catch { skipped++; }
        }
        const selected = getSelectedCarDefinition(currentRoomData);
        if (selected?.communityId) communityCars.set(selected.communityId, selected);
        populateCarSelect();
        status.textContent = `${communityCars.size} Community Cars loaded (latest 100 submissions). Select one from the car list. Random selection uses reviewed cars only.${skipped ? ` ${skipped} invalid submissions were skipped.` : ""}`;
    } catch { status.textContent = "Community Cars could not be loaded. The reviewed lineup is still available. Community access may not be enabled yet; try again later."; }
    finally { button.disabled = false; }
});
