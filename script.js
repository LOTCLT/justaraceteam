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
   CAR LIBRARY
   ========================================================= */

const CAR_LIBRARY = [

    {
        name:
            "2024 Ford Mustang GT",

        startingPI:
            "A628"
    },

    {
        name:
            "1986 Honda Civic Si",

        startingPI:
            "D253"
    }

];



/* =========================================================
   RACE DATABASE

   TRACK_EQUAL behavior:
   Every individual race has equal odds.
   ========================================================= */

const RACE_POOL = [


    /* STREET */

    {
        type: "Street",
        name: "Cedar Run Street Race",
        distance: "4.2 mi"
    },

    {
        type: "Street",
        name: "Daikoku Chase Street Race",
        distance: "4.2 mi"
    },

    {
        type: "Street",
        name: "Festival Chase Street Race",
        distance: "4.1 mi"
    },

    {
        type: "Street",
        name: "Hokubu Ascent Street Race",
        distance: "4.2 mi"
    },

    {
        type: "Street",
        name: "Kita Ine Street Race",
        distance: "4.1 mi"
    },

    {
        type: "Street",
        name: "Matsumi Climb Street Race",
        distance: "4.6 mi"
    },

    {
        type: "Street",
        name: "Minami Chase Street Race",
        distance: "4.6 mi"
    },

    {
        type: "Street",
        name: "Nachi Run Street Race",
        distance: "3.9 mi"
    },

    {
        type: "Street",
        name: "Norikura Descent Street Race",
        distance: "3.6 mi"
    },

    {
        type: "Street",
        name: "Okishinaimura Run Street Race",
        distance: "3.2 mi"
    },

    {
        type: "Street",
        name: "Rainbow Bridge Descent Street Race",
        distance: "5.3 mi"
    },

    {
        type: "Street",
        name: "River Descent Street Race",
        distance: "3.8 mi"
    },

    {
        type: "Street",
        name: "Shimanoyama Charge Street Race",
        distance: "5.2 mi"
    },

    {
        type: "Street",
        name: "Sunflower Charge Street Race",
        distance: "3.8 mi"
    },

    {
        type: "Street",
        name: "Tokyo City Docks Charge Street Race",
        distance: "4.0 mi"
    },



    /* ROAD */

    {
        type: "Road",
        name: "Coastline Sprint",
        distance: "5.0 mi"
    },

    {
        type: "Road",
        name: "Daikoku Circuit",
        distance: "3.3 mi"
    },

    {
        type: "Road",
        name: "Electric Town Circuit",
        distance: "5.5 mi"
    },

    {
        type: "Road",
        name: "Festival Sprint",
        distance: "4.9 mi"
    },

    {
        type: "Road",
        name: "Highway Circuit",
        distance: "8.7 mi"
    },

    {
        type: "Road",
        name: "Hokubu Circuit",
        distance: "4.7 mi"
    },

    {
        type: "Road",
        name: "Irokawa Circuit Road Race",
        distance: "3.5 mi"
    },

    {
        type: "Road",
        name: "Ito Sprint",
        distance: "5.8 mi"
    },

    {
        type: "Road",
        name: "Legend Island Circuit",
        distance: "8.8 mi"
    },

    {
        type: "Road",
        name: "Narai-Juku Circuit",
        distance: "4.4 mi"
    },

    {
        type: "Road",
        name: "Satta Sprint",
        distance: "5.1 mi"
    },

    {
        type: "Road",
        name: "Seaside Park Sprint",
        distance: "4.5 mi"
    },

    {
        type: "Road",
        name: "Shikisai Sprint",
        distance: "4.8 mi"
    },

    {
        type: "Road",
        name: "Shimanoyama Circuit",
        distance: "3.4 mi"
    },

    {
        type: "Road",
        name: "Shimanoyama Sprint",
        distance: "4.0 mi"
    },

    {
        type: "Road",
        name: "Shirakawa Circuit",
        distance: "4.0 mi"
    },

    {
        type: "Road",
        name: "Tateyama Kurobe Sprint",
        distance: "3.8 mi"
    },

    {
        type: "Road",
        name: "The Colossus",
        distance: "23.4 mi"
    },

    {
        type: "Road",
        name: "The Goliath",
        distance: "53.1 mi"
    },

    {
        type: "Road",
        name: "Venus Sprint",
        distance: "5.0 mi"
    },



    /* DRAG */

    {
        type: "Drag",
        name: "Horizon Festival Drag Strip",
        distance: "0.6 mi"
    },

    {
        type: "Drag",
        name: "Irokawa Space Center Drag Strip",
        distance: "0.2 mi"
    },

    {
        type: "Drag",
        name: "Ito Airfield Drag Strip",
        distance: "0.5 mi"
    },



    /* DIRT / RALLY */

    {
        type: "Dirt / Rally",
        name: "Airfield Trail",
        distance: "4.2 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Bamboo Forest Scramble",
        distance: "9.3 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Cherry Field Trail",
        distance: "4.5 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Chiheisen Scramble",
        distance: "4.9 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Hirosaki Scramble",
        distance: "5.1 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Hokubu Trail",
        distance: "3.6 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Horizon Stadium Scramble",
        distance: "7.3 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Ine Scramble",
        distance: "5.7 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Ito Trail",
        distance: "4.4 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Kawazu Nanadaru Scramble",
        distance: "7.8 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Kinkaku-ji Trail",
        distance: "3.4 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Legend Island Trail",
        distance: "3.3 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Nukabira Trail",
        distance: "5.0 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Oyashirazu Trail",
        distance: "3.2 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Sekibe Scramble",
        distance: "4.0 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Sotoyama Scramble",
        distance: "5.5 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Sunflower Scramble",
        distance: "5.3 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Taiyaki Scramble",
        distance: "6.7 mi"
    },

    {
        type: "Dirt / Rally",
        name: "Takashiro Trail",
        distance: "3.6 mi"
    },

    {
        type: "Dirt / Rally",
        name: "The Gauntlet",
        distance: "18.7 mi"
    }

];



/* =========================================================
   ELEMENTS
   ========================================================= */

const homeScreen =
    document.getElementById("homeScreen");

const lobbyScreen =
    document.getElementById("lobbyScreen");

const gameScreen =
    document.getElementById("gameScreen");


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

const leaveGameButton =
    document.getElementById("leaveGameBtn");

const leaveGameButtonGame =
    document.getElementById("leaveGameBtnGame");

const startGameButton =
    document.getElementById("startGameBtn");


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

    const index =
        Math.floor(
            Math.random() *
            array.length
        );


    return array[index];

}



function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let roomCode =
        "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        roomCode +=
            characters[
                Math.floor(
                    Math.random() *
                    characters.length
                )
            ];

    }


    return roomCode;

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
        playerName.length <
        2
    ) {

        showHomeMessage(
            "Enter your name first.",
            "error"
        );


        return null;

    }


    return playerName;

}



/* =========================================================
   PLAYER DISPLAY
   ========================================================= */

function renderPlayers(
    targetElement,
    players
) {

    targetElement.innerHTML =
        "";


    const sortedPlayers =
        Object.entries(
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
   GAME SETUP DISPLAY
   ========================================================= */

function updateGameSetupDisplay(
    roomData
) {

    currentRoomData =
        roomData;


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



    /* READY */

    const setupReady =
        Boolean(
            roomData.selectedCar &&
            roomData.currentRace
        );


    if (setupReady) {

        roundReadyBadge.classList.remove(
            "hidden"
        );


        gameNote.textContent =
            "Round " +
            round +
            " is ready. Head into Forza and run the race!";

    }
    else {

        roundReadyBadge.classList.add(
            "hidden"
        );


        if (
            currentPlayerIsHost
        ) {

            gameNote.textContent =
                "Choose a car and generate the race.";

        }
        else {

            gameNote.textContent =
                "Waiting for the host to finish the round setup.";

        }

    }



    /* HOST CONTROLS */

    if (
        currentPlayerIsHost
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



                /* PLAYERS */

                const playerCount =
                    renderPlayers(
                        playerList,
                        roomData.players
                    );


                renderPlayers(
                    gamePlayerList,
                    roomData.players
                );



                /* LOBBY */

                if (
                    roomData.status ===
                    "lobby"
                ) {

                    if (
                        currentPlayerIsHost
                    ) {

                        if (
                            playerCount ===
                            1
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



                /* PLAYING */

                if (
                    roomData.status ===
                    "playing"
                ) {

                    showGameScreen();


                    updateGameSetupDisplay(
                        roomData
                    );

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


    if (
        isHost
    ) {

        startGameButton.classList.remove(
            "hidden"
        );


        lobbyNote.textContent =
            "Share the room code with the other players.";

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


    const wasHidden =
        gameScreen.classList.contains(
            "hidden"
        );


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

    gameScreen.classList.remove(
        "hidden"
    );


    if (
        wasHidden
    ) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

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


    playerList.innerHTML =
        "";

    gamePlayerList.innerHTML =
        "";


    lobbyScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.add(
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
                "Could not create the room. Try again.",
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


            const playerReference =
                ref(
                    database,

                    "rooms/" +
                    enteredCode +
                    "/players/" +
                    user.uid
                );


            await set(
                playerReference,

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
                "Could not join the room. Try again.",
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
            !currentRoomCode ||
            !currentPlayerIsHost
        ) {

            return;

        }


        try {


            const roomReference =
                ref(
                    database,
                    "rooms/" +
                    currentRoomCode
                );


            await update(
                roomReference,

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
        catch (error) {

            console.error(
                "Could not start game:",
                error
            );


            lobbyNote.textContent =
                "Could not start the game.";

        }

    }
);



/* =========================================================
   SET CAR
   ========================================================= */

async function saveSelectedCar(
    car
) {

    if (
        !currentPlayerIsHost ||
        !currentRoomCode
    ) {

        return;

    }


    const roomReference =
        ref(
            database,
            "rooms/" +
            currentRoomCode
        );


    await update(
        roomReference,

        {
            selectedCar: car
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
            !car
        ) {

            return;

        }


        try {

            await saveSelectedCar(
                car
            );

        }
        catch (error) {

            console.error(
                "Could not set car:",
                error
            );

        }

    }
);



randomCarButton.addEventListener(
    "click",

    async function () {


        try {


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
        catch (error) {

            console.error(
                "Could not randomize car:",
                error
            );

        }

    }
);



/* =========================================================
   GENERATE RACE
   ========================================================= */

generateRaceButton.addEventListener(
    "click",

    async function () {


        if (
            !currentPlayerIsHost ||
            !currentRoomCode
        ) {

            return;

        }


        try {


            let race =
                randomFromArray(
                    RACE_POOL
                );


            /*
                Try to avoid generating the
                exact same race twice in a row.
            */

            if (
                currentRoomData &&
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


            const roomReference =
                ref(
                    database,
                    "rooms/" +
                    currentRoomCode
                );


            await update(
                roomReference,

                {

                    currentRace:
                        race,

                    raceGeneratedAt:
                        serverTimestamp()

                }
            );

        }
        catch (error) {

            console.error(
                "Could not generate race:",
                error
            );

        }

    }
);



/* =========================================================
   RANDOMIZE FULL SETUP
   ========================================================= */

randomSetupButton.addEventListener(
    "click",

    async function () {


        if (
            !currentPlayerIsHost ||
            !currentRoomCode
        ) {

            return;

        }


        try {


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


            const roomReference =
                ref(
                    database,
                    "rooms/" +
                    currentRoomCode
                );


            await update(
                roomReference,

                {

                    selectedCar:
                        car,

                    currentRace:
                        race,

                    setupGeneratedAt:
                        serverTimestamp()

                }
            );

        }
        catch (error) {

            console.error(
                "Could not randomize setup:",
                error
            );

        }

    }
);



/* =========================================================
   LEAVE GAME
   ========================================================= */

async function leaveCurrentRoom() {


    if (
        !currentRoomCode
    ) {

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

            const roomReference =
                ref(
                    database,
                    "rooms/" +
                    roomCode
                );


            await remove(
                roomReference
            );


            returnToHome(
                "Room ended.",
                "success"
            );

        }
        else {

            const playerReference =
                ref(
                    database,

                    "rooms/" +
                    roomCode +
                    "/players/" +
                    user.uid
                );


            await remove(
                playerReference
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


        returnToHome(
            "You left the game.",
            ""
        );

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