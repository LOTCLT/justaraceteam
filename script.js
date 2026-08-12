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
    onValue,
    serverTimestamp
}
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



/* =========================================================
   FIREBASE SETUP
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



/* =========================================================
   CURRENT LOCAL GAME STATE
   ========================================================= */

let currentRoomCode = null;

let currentPlayerName = null;

let currentPlayerIsHost = false;



/* =========================================================
   FIREBASE PLAYER LOGIN
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
   ROOM CODE GENERATOR
   ========================================================= */

function generateRoomCode() {

    /*
        We skip confusing characters such as:

        I
        O
        0
        1
    */

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
   HOME SCREEN MESSAGES
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
   PLAYER NAME VALIDATION
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
   REAL-TIME PLAYER LIST
   ========================================================= */

function listenToPlayers(roomCode) {

    const playersReference =
        ref(
            database,
            "rooms/" +
            roomCode +
            "/players"
        );


    onValue(
        playersReference,

        function (snapshot) {

            /*
                snapshot.val() gives us the player
                data currently stored in Firebase.

                If there are somehow no players,
                use an empty object instead.
            */

            const players =
                snapshot.val() || {};


            /*
                Remove the old visual player list
                before rebuilding it.
            */

            playerList.innerHTML = "";


            /*
                Convert the Firebase object into
                an array so we can sort it.

                Host should normally appear first
                because they joined first.
            */

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


            /*
                Build one HTML row for
                every player in Firebase.
            */

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


                    /*
                        Add HOST badge only
                        to the host.
                    */

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


                    playerList.appendChild(
                        playerRow
                    );

                }
            );


            /*
                Update waiting message based
                on player count.
            */

            const playerCount =
                sortedPlayers.length;


            if (currentPlayerIsHost) {

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
   SHOW LOBBY
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


    /*
        Only the host gets the
        Start Game button.
    */

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


    /*
        Begin watching Firebase for
        player changes.
    */

    listenToPlayers(
        roomCode
    );


    /*
        Switch screens.
    */

    homeScreen.classList.add(
        "hidden"
    );

    lobbyScreen.classList.remove(
        "hidden"
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

            /*
                Get this browser's anonymous
                Firebase user.
            */

            const user =
                await getCurrentPlayer();


            let newRoomCode;

            let roomReference;

            let roomSnapshot;


            /*
                Keep generating codes until
                we find one that doesn't exist.
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
                Create the room.
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


            /*
                Room successfully exists
                in Firebase.

                Show the lobby.
            */

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


        /*
            Room codes must contain
            exactly five characters.
        */

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


            /*
                Find the requested room.
            */

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


            /*
                Reject invalid room codes.
            */

            if (!roomSnapshot.exists()) {

                showHomeMessage(
                    "Room not found.",
                    "error"
                );


                return;

            }


            const roomData =
                roomSnapshot.val();


            /*
                Don't allow players to join
                after the game starts.
            */

            if (roomData.status !== "lobby") {

                showHomeMessage(
                    "That game has already started.",
                    "error"
                );


                return;

            }


            /*
                Create this player's record
                inside the room.
            */

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


            /*
                Successful join.
            */

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
   LEAVE GAME
   ========================================================= */

leaveGameButton.addEventListener(
    "click",

    function () {

        /*
            For now this returns the browser
            to the home screen.

            Later we'll also remove the player
            from Firebase automatically.
        */

        currentRoomCode =
            null;

        currentPlayerName =
            null;

        currentPlayerIsHost =
            false;


        lobbyScreen.classList.add(
            "hidden"
        );


        homeScreen.classList.remove(
            "hidden"
        );


        playerList.innerHTML =
            "";


        showHomeMessage(
            "",
            ""
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

);



/* =========================================================
   START GAME
   ========================================================= */

startGameButton.addEventListener(
    "click",

    function () {

        /*
            Placeholder for our next step.

            Eventually this will change:

            status: "lobby"

            to:

            status: "playing"

            inside Firebase.
        */

        lobbyNote.textContent =
            "Game starting! Game setup comes next.";

    }

);



/* =========================================================
   ROOM CODE INPUT
   ========================================================= */

roomCodeInput.addEventListener(
    "input",

    function () {

        /*
            Automatically force room codes
            to uppercase.
        */

        roomCodeInput.value =
            roomCodeInput
                .value
                .toUpperCase();

    }

);



/* =========================================================
   PRESS ENTER TO JOIN
   ========================================================= */

roomCodeInput.addEventListener(
    "keydown",

    function (event) {

        if (event.key === "Enter") {

            joinGameButton.click();

        }

    }

);