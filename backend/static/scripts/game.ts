//@ts-ignore
type Socket = import('socket.io-client').Socket;
/** @type {Socket} */
//@ts-ignore
const socket: Socket = io('ws://localhost');

socket.on('connect', () => {
    console.log("Connected");
})

let wait = false;
socket.on('chatMessage', (m: string) => {
    if (wait) {
        wait = false;
    } else {
        postMessage(m);
    }
})

function postMessage(text: string, isOutcoming: boolean = false) {
    let message = document.createElement("span");
    message.classList.add("playerMessage", isOutcoming ? "outcoming" : "incoming");
    message.innerHTML = `${text}`;
    document.getElementById("chatbox")?.appendChild(message);
}

function sendMessage() {
    let messageInput = document.getElementById("messageInput") as HTMLInputElement;
    let text = messageInput?.value ?? "d";
    messageInput.value = "";
    postMessage(text, true);
    wait = true;
    socket.emit('sendMessage', text);
}