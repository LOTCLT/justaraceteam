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
   PAGE ELEMENTS
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



/* =========================================================
   LOCAL GAME STATE
   ========================================================= */

let currentRoomCode = null;

let currentPlayerName = null;

let currentPlayerIsHost = false;


let stopPlayerListener = null;

let stopRoomListener = null;



/* =========================================================
   FIREBASE LOGIN
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
   ROOM CODE
   ========================================================= */

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let roomCode = "";


    for (let i = 0; i < 5; i++) {

        const randomNumber =
            Math.floor(
                Math.random() *
                characters.length
            );


        roomCode +=
            characters[randomNumber];

    }


    return roomCode;

}



/* =========================================================
   MESSAGES
   ========================================================= */

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



/* =========================================================
   PLAYER NAME
   ========================================================= */

function getPlayerName() {

    const playerName =
        playerNameInput
            .value
            .trim();


    if (playerName.length < 2) {

        showHomeMessage(
            "Enter your name first.",
            "error"
        );


        return null;

    }


    return playerName;

}



/* =========================================================
   STOP FIREBASE LISTENERS
   ========================================================= */

function clearListeners() {

    if (stopPlayerListener) {

        stopPlayerListener();

        stopPlayerListener =
            null;

    }


    if (stopRoomListener) {

        stopRoomListener();

        stopRoomListener =
            null;

    }

}



/* =========================================================
   PLAYER LIST DISPLAY
   ========================================================= */

function renderPlayers(
    targetElement,
    players
) {

    targetElement.innerHTML =
        "";


    const sortedPlayers =
        Object.entries(players)
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


            const playerRow =
                document.createElement(
                    "div"
                );


            playerRow.classList.add(
                "player-row"
            );


            const playerName =
                document.createElement(
                    "span"
                );


            playerName.textContent =
                player.name;


            playerRow.appendChild(
                playerName
            );


            if (player.isHost) {

                const hostBadge =
                    document.createElement(
                        "span"
                    );


                hostBadge.classList.add(
                    "host-badge"
                );


                hostBadge.textContent =
                    "HOST";


                playerRow.appendChild(
                    hostBadge
                );

            }


            targetElement.appendChild(
                playerRow
            );

        }
    );


    return sortedPlayers.length;

}



/* =========================================================
   REAL-TIME PLAYER LISTENER
   ========================================================= */

function listenToPlayers(roomCode) {

    const playersReference =
        ref(
            database,
            "rooms/" +
            roomCode +
            "/players"
        );


    stopPlayerListener =
        onValue(
            playersReference,

            function (snapshot) {

                const players =
                    snapshot.val() || {};


                const playerCount =
                    renderPlayers(
                        playerList,
                        players
                    );


                renderPlayers(
                    gamePlayerList,
                    players
                );


                if (
                    currentPlayerIsHost &&
                    !gameScreen.classList.contains(
                        "hidden"
                    ) === false
                ) {

                    return;

                }


                if (
                    currentPlayerIsHost &&
                    !lobbyScreen.classList.contains(
                        "hidden"
                    )
                ) {

                    if (playerCount === 1) {

                        lobbyNote.textContent =
                            "Share the room code with the other players.";

                    }
                    else {

                        lobbyNote.textContent =
                            playerCount +
                            " players connected.";

                    }

                }

            }
        );

}



/* =========================================================
   REAL-TIME ROOM STATUS LISTENER
   ========================================================= */

function listenToRoom(roomCode) {

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


                /*
                    If the host deleted the room,
                    send everyone home.
                */

                if (!snapshot.exists()) {

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


                /*
                    This is the multiplayer
                    START GAME trigger.
                */

                if (
                    roomData.status ===
                    "playing"
                ) {

                    showGameScreen();

                }

            }
        );

}



/* =========================================================
   SHOW LOBBY
   ========================================================= */

function showLobby(
    roomCode,
    playerName,
    isHost
) {

    clearListeners();


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


    listenToPlayers(
        roomCode
    );


    listenToRoom(
        roomCode
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* =========================================================
   SHOW GAME
   ========================================================= */

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

    gameScreen.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* =========================================================
   RETURN HOME
   ========================================================= */

function returnToHome(
    message = "",
    type = ""
) {

    clearListeners();


    currentRoomCode =
        null;

    currentPlayerName =
        null;

    currentPlayerIsHost =
        false;


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
   CREATE GAME
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



            /*
                Find an unused room code.
            */

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



            /*
                Create Firebase room.
            */

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
   JOIN GAME
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


        if (enteredCode.length !== 5) {

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


            if (!roomSnapshot.exists()) {

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

                    startedAt:
                        serverTimestamp()

                }

            );


            /*
                We do NOT manually show
                the game screen here.

                Firebase will notify every
                browser, including the host.
            */

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
   LEAVE ROOM
   ========================================================= */

async function leaveCurrentRoom() {


    if (!currentRoomCode) {

        return;

    }


    const roomCode =
        currentRoomCode;


    const wasHost =
        currentPlayerIsHost;


    try {


        const user =
            await getCurrentPlayer();


        /*
            Stop our own listeners before
            deleting anything.
        */

        clearListeners();



        /*
            If the host leaves,
            delete the entire room.
        */

        if (wasHost) {

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


        /*
            Normal player only removes
            their own player entry.
        */

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
   ROOM CODE INPUT
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



/* =========================================================
   ENTER KEY
   ========================================================= */

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