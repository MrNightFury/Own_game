import { Injectable } from "@nestjs/common";
import { Game, GameInfo } from "./Game.js";
import { Server } from "socket.io";
import { GameDataProvider } from "./GameDataProvider.js";

@Injectable()
export class GameEngine {
    private lastId = -1;
    private games: Game[] = [];
    private server: any;
    
    constructor(private readonly provider: GameDataProvider){}

    public setSocket(socket: Server) {
        this.server = socket;
    }

    public createGame(info: GameInfo): number {
        this.lastId++;
        this.games.push(new Game(this.lastId, info, this?.server, this.provider));
        return this.lastId;
    }

    public getGamesList(): GameInfo[] {
        return this.games.map(game => game.getInfo());
    }

    public getGameById(id: number) {
        return this.games.find(game => game.getInfo().id == id);
    }
}