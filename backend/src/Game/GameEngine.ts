import { Injectable } from "@nestjs/common";
import { Game, GameInfo } from "./Game.js";
import { GameGateway } from "./GameGateway.js";
import { Server, Socket } from "socket.io";
import { UsersRepository } from "../db/UsersRepository.js";

@Injectable()
export class GameEngine {
    private lastId = -1;
    private games: Game[] = [];
    private server: any;
    
    constructor(private readonly usersRepository: UsersRepository){}

    public setSocket(socket: Server) {
        this.server = socket;
        let data: GameInfo[] = [{
            title: "Game 1",
            setId: 0
        }, {
            title: "Game 2",
            setId: 0
        }, {
            title: "Game 3",
            setId: 0
        }, {
            title: "Game 4",
            setId: 0
        }];
        data.forEach(info => this.createGame(info));
    }

    public createGame(info: GameInfo): number {
        this.lastId++;
        this.games.push(new Game(this.lastId, info, this?.server));
        return this.lastId;
    }

    public getGamesList(): GameInfo[] {
        return this.games.map(game => game.getInfo());
    }

    public getGameById(id: number) {
        return this.games.find(game => game.getInfo().id == id);
    }
}