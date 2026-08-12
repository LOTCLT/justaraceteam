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
    serverTimestamp
}
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyBRBaBatRkK5sz8ag4iY5RYzz8rzU9Sds8",
    authDomain: "justaraceteam-c53eb.firebaseapp.com",

    databaseURL:
        "https://justaraceteam-c53eb-default-rtdb.firebaseio.com",

    projectId: "justaraceteam-c53eb",
    storageBucket: "justaraceteam-c53eb.firebasestorage.app",
    messagingSenderId: "491124011414",
    appId: "1:491124011414:web:92f33c31cc2366f5bdedb7"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);
async function getCurrentPlayer() {

    if (auth.currentUser) {
        return auth.currentUser;
    }

    const result =
        await signInAnonymously(auth);

    return result.user;
}
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

const playerListName =
    document.getElementById("playerListName");

const hostBadge =
    document.getElementById("hostBadge");

const lobbyNote =
    document.getElementById("lobbyNote");



function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let roomCode = "";

    for (let i = 0; i < 5; i++) {

        const randomNumber =
            Math.floor(
                Math.random() * characters.length
            );

        roomCode += characters[randomNumber];

    }

    return roomCode;

}



function showHomeMessage(message, type) {

    homeMessage.textContent = message;

    homeMessage.classList.remove(
        "error",
        "success"
    );

    if (type) {
        homeMessage.classList.add(type);
    }

}



function getPlayerName() {

    const playerName =
        playerNameInput.value.trim();

    if (playerName.length < 2) {

        showHomeMessage(
            "Enter your name first.",
            "error"
        );

        return null;

    }

    return playerName;

}



function showLobby(
    roomCode,
    playerName,
    isHost
) {

    lobbyRoomCode.textContent =
        roomCode;

    lobbyPlayerName.textContent =
        playerName;

    playerListName.textContent =
        playerName;


    if (isHost) {

        hostBadge.classList.remove(
            "hidden"
        );

        startGameButton.classList.remove(
            "hidden"
        );

        lobbyNote.textContent =
            "Share the room code with the other players.";

    } else {

        hostBadge.classList.add(
            "hidden"
        );

        startGameButton.classList.add(
            "hidden"
        );

        lobbyNote.textContent =
            "Waiting for the host to start the game.";

    }


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



createGameButton.addEventListener(
    "click",
    async function () {

        const playerName =
            getPlayerName();

        if (!playerName) {
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
                        "rooms/" + newRoomCode
                    );

                roomSnapshot =
                    await get(roomReference);

            }
            while (roomSnapshot.exists());


            await set(
                roomReference,
                {

                    hostUid: user.uid,

                    status: "lobby",

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



joinGameButton.addEventListener(
    "click",
    function () {

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


        showLobby(
            enteredCode,
            playerName,
            false
        );

    }
);



leaveGameButton.addEventListener(
    "click",
    function () {

        lobbyScreen.classList.add(
            "hidden"
        );

        homeScreen.classList.remove(
            "hidden"
        );

        showHomeMessage("", "");

    }
);



startGameButton.addEventListener(
    "click",
    function () {

        lobbyNote.textContent =
            "Game starting! Our game setup screen comes next.";

    }
);



roomCodeInput.addEventListener(
    "input",
    function () {

        roomCodeInput.value =
            roomCodeInput
                .value
                .toUpperCase();

    }
);