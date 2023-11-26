// import { loadConfig } from "./Configs.js";
// import { App } from "./app.js";
// console.log("Loading config...");
// let config = loadConfig();
// console.log(JSON.stringify(config));
// var app = new App(config);
// console.log("Starting");
// app.start();
import * as http from "http";
import Express from "express";
import * as WebSocket from "ws";
const app = Express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.WebSocketServer({ server });
webSocketServer.on('connection', ws => {
    ws.on('message', m => {
        webSocketServer.clients.forEach(client => client.send(m.toString()));
    });
    ws.on("error", e => ws.send(e));
    ws.send('Hi there, I am a WebSocket server');
});
app.get("/test", (req, res) => {
    res.send("asd");
});
server.listen(8999, () => console.log("Server started"));
