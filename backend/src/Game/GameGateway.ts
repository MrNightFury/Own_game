import { GameEngine } from "./GameEngine.js";
import { WebSocketGateway, WebSocketServer,
    OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameHelper } from "./GameHelper.js";
import { JWTService } from "../JWTService.js";
import { UsersRepository } from "../db/repositories/UsersRepository.js";


@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly engine: GameEngine,
                private readonly usersRepository: UsersRepository){}
    @WebSocketServer() server: Server = new Server();
    
    handleDisconnect(client: any) {
        console.log("Disconnect")
    }

    async handleConnection(client: Socket, ...args: any[]) {
        let token = GameHelper.parseToken(client.handshake.headers.cookie ?? "");
        if (!token) {
            client.emit("error", "No token provided in handshake");
            client.disconnect();
            return;
        }
        let result = JWTService.verify(token);
        if (result === false) {
            client.emit("error", "Incorrect token provided in handshake");
            client.disconnect();
            return;
        }
        let gameId = client.handshake.query.gameId ?? "";
        if (!gameId) {
            client.emit("error", "Game id did not specified");
            client.disconnect();
            return;
        }
        let game = this.engine.getGameById(+gameId);
        if (!game) {
            client.emit("error", "Game not found");
            client.disconnect();
            return;
        }
        let user = await this.usersRepository.getUserById(result);
        if (!user) {
            client.emit("error", "User not found");
            client.disconnect();
            return;
        }
        client.join("game" + game.getInfo().id);
        game.join(user, client);
        this.server.to("")
        console.log(`Connect on ${JSON.stringify(client.handshake.query.gameId)}`)
    }

    afterInit(server: Server) {
        this.engine.setSocket(server);
    }
}