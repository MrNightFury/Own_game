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

socket.on(MessageType.ADD_USER, m => {
    let data = JSON.parse(m);

    let playersContainer = document.getElementById("players");
    if (playersContainer?.innerHTML) {
        playersContainer.innerHTML += data.render;
    }
})

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

// SET_ADMIN
socket.on(MessageType.SET_ADMIN, (m) => {
    let data = JSON.parse(m);
    document.getElementById("players")?.children[data.index].remove();
    document.getElementById("becomeHost")?.style.setProperty("display", "none");
    document.getElementById("hostAvatar")?.setAttribute("src", "../files/" + data.user.user_avatar_id);
    let login = document.getElementById("hostLogin");
    if (login) {
        login.innerHTML = data.user.user_login;
    }
})

declare global {
    interface Window {
        user: any;
        sendMessage: () => void;
        becomeHost: () => void;
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

console.log("Engine loaded")