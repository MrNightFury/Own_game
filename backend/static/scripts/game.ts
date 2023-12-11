import { MessageType } from './../../src/Game/DTO.js';
// @ts-ignore
type Socket = import('socket.io-client').Socket;
let url = location.href.split("/");
/** @type {Socket} */
//@ts-ignore
const socket: Socket = io('ws://localhost', {query: { gameId: url[url.length - 1] }});

socket.on('connect', () => {
    console.log("Connected");
})

socket.on('disconnect', () => {
    console.log("Disconnected");
})

socket.on("error", (m: string) => {
    console.log(m);
})

socket.on(MessageType.DEBUG, (m) => {
    console.log("DEBUG " + JSON.parse(m));
})

// SET_ROUND
socket.on(MessageType.SET_ROUND, m => {
    let roundTitle = document.getElementById("roundTitle");
    if (roundTitle) {
        roundTitle.innerHTML = m;
    }
})

// ADD_USER
socket.on(MessageType.ADD_USER, m => {
    console.log("Adding user");
    let data = JSON.parse(m);
    let playersContainer = document.getElementById("players");
    if (playersContainer?.innerHTML) {
        playersContainer.innerHTML += data.render;
    }
})

// CHAT_MESSAGE
let chatbox = document.getElementById("chatbox");
socket.on(MessageType.CHAT_MESSAGE, m => {
    let data = JSON.parse(m);
    if (chatbox && window.user.user_login != data.sender) {
        chatbox.innerHTML += data.render;
    }
})

function postMessage(text: string, isOutcoming: boolean = false) {
    let message = document.createElement("span");
    message.classList.add("playerMessage", isOutcoming ? "outcoming" : "incoming");
    message.innerHTML = `${text}`;
    document.getElementById("chatbox")?.appendChild(message);
}

socket.on(MessageType.REMOVE_USER, m => {
    let data = JSON.parse(m);
    document.getElementById("players")?.children[data].remove();
})

// SET_ADMIN
socket.on(MessageType.SET_ADMIN, (m) => {
    console.log("Setting admin")
    let data = JSON.parse(m);
    // document.getElementById("players")?.children[data.index].remove();
    document.getElementById("becomeHost")?.style.setProperty("display", "none");
    document.getElementById("hostAvatar")?.setAttribute("src", "../files/" + data.user.user_avatar_id);
    let login = document.getElementById("hostLogin");
    if (login) {
        login.innerHTML = data.user.user_login;
    }
    if (data.user.user_id == window.user.user_id) {
        document.getElementById("controlPanel")?.style.setProperty("display", "flex");
    }
})

// SET_SCREEN
socket.on(MessageType.SET_SCREEN, (m) => {
    let data = JSON.parse(m);
    let screen = document.getElementById("screen");
    if (screen) {
        screen.innerHTML = data.render;
    }
    socket.emit(MessageType.LOADED, "");
})

// SET_ACTIVE_USER
socket.on(MessageType.SET_ACTIVE_USER, (m) => {
    let users = document.querySelectorAll("#players > div");
    users.forEach((user) => {
        user.classList.remove("active");
        console.log(user.classList)
    })

    let data = JSON.parse(m);
    let activeUser = document.getElementById("player" + data.userId);
    if (activeUser) {
        activeUser.classList.add("active");
    }
})

socket.on(MessageType.SET_SCORE, (m) => {
    let data = JSON.parse(m);
    let score = document.querySelector("#player" + data.userId + " > .score");
    if (score) {
        score.innerHTML = data.score;
    }
})

// SET_TIMER
socket.on(MessageType.SET_TIMER, (m) => {
    let data = JSON.parse(m);
    console.log(data);
    // let timer = document.getElementById("timer");
    // if (timer) {
    //     timer.innerHTML = data.time;
    // }
})

declare global {
    interface Window {
        user: any;
        sendMessage: () => void;
        becomeHost: () => void;
        start: () => void;
        chooseQuestion: (category: number, question: number) => void;
        isAnswerCorrect: (isCorrect: boolean) => void;
    }
}

window.sendMessage = function() {
    let messageInput = document.getElementById("messageInput") as HTMLInputElement;
    let text = messageInput?.value ?? "d";
    messageInput.value = "";
    postMessage(text, true);
    console.log("Emitting")
    socket.emit(MessageType.CHAT_MESSAGE, text);
}

window.becomeHost = function() {
    console.log("Become admin request");
    socket.emit(MessageType.SET_ADMIN, "");
}

window.start = function() {
    console.log("Start game request")
    socket.emit(MessageType.START_GAME, "");
}

window.chooseQuestion = function(category: number, question: number) {
    console.log("Choose question " + category + " " + question);
    socket.emit(MessageType.SELECT_QUESTION, JSON.stringify({category: category, question: question}));
}

window.isAnswerCorrect = function(isCorrect: boolean) {
    console.log("Is answer correct " + isCorrect);
    socket.emit(MessageType.IS_ANSWER_CORRECT, JSON.stringify({isCorrect: isCorrect}));
}

document.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
        socket.emit(MessageType.WANT_TO_ANSWER, "");
    }
  });

console.log("Engine loaded")