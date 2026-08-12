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
    function () {

        const playerName =
            getPlayerName();

        if (!playerName) {
            return;
        }


        const newRoomCode =
            generateRoomCode();


        showLobby(
            newRoomCode,
            playerName,
            true
        );

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