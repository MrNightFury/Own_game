import { NestFactory } from "@nestjs/core";
import { AppModule } from "./mainModule.js";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as cookieParser from 'cookie-parser';
// import * as WebSocket from "ws";

// const app = Express();

// const server = http.createServer(app);

// const webSocketServer = new WebSocket.WebSocketServer({ server });

// webSocketServer.on('connection', ws => {
//    ws.on('message', m => {
//         webSocketServer.clients.forEach(client => client.send(m.toString()));
//    });

//    ws.on("error", e => ws.send(e as any));

//    ws.send('Hi there, I am a WebSocket server');
// });

// app.get("/test", (req, res) => {
//     res.send("asd");
// })

// server.listen(8999, () => console.log("Server started"))

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule).catch(err => {
        console.log(err);
    }).then(res => {
        console.log("App created");
        return res;
    });
    if (!app) {
        return;
    }
    app.use(cookieParser.default());
    app.useStaticAssets('./static');
    app.setBaseViewsDir('./views');
    app.setViewEngine('ejs');
    console.log("Starting app...");
    await app.listen(80).catch(err => {
        console.log(err);
    });
}
bootstrap();
  