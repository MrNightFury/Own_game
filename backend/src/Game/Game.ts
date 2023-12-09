import { Server, Socket } from "socket.io";
import { User } from "../db/model/User.js";
import { QuestionIdentifier, MessageType, SocketMessage, RoundIdentifier } from "./DTO.js";
import * as ejs from "ejs";
import { Inject, Injectable } from "@nestjs/common";
import { GameDataProvider } from "./GameDataProvider.js";

export interface GameInfo {
    id?: number;
    title: string;
    setId: number;
}

export enum GameState {
    WAITING_FOR_START,
    ACTION,
    CHOOSING_QUESTION,
    WAITING_FOR_ANSWER,
}

export interface Player {
    user: User;
    connection: Socket;
    score: number;
    active: boolean;
}

export class Game {
    private roomId: number;
    private info: GameInfo;

    private readonly provider: GameDataProvider;
    private server: Server;

    private round: number;
    private state: GameState;
    private solved: boolean[][] = [];

    private players: Player[] = [];
    private admin?: Player;
    private currentPlayer: number = -1;

    private readyCounter: number = 0;
    private readyCallback?: () => void;

    constructor(id: number, info: GameInfo, server: Server, provider: GameDataProvider) {
        this.roomId = id;
        this.info = info;
        this.server = server;
        this.provider = provider;

        this.state = GameState.WAITING_FOR_START;
        this.round = -1;
    }

    public getInfo() {
        return {...this.info, id: this.roomId} as GameInfo;
    }

    public getRound() {
        return {
            set: this.info.setId,
            round: this.round
        } as RoundIdentifier;
    }

    public notifyAll(message: SocketMessage) {
        this.server.to("game" + this.roomId).emit(message.type, JSON.stringify(message.data));
    }

    private debug(message: string) {
        this.notifyAll({
            type: MessageType.DEBUG,
            data: message
        })
    }

    public async setScreen(text: string | Promise<string>, callback: () => void) {
        if (typeof text != "string") {
            text = await text;
        }
        this.notifyAll({
            type: MessageType.SET_SCREEN,
            data: {
                render: text
            }
        });
        this.readyCounter = 0;
        this.readyCallback = callback;
    }

    public renderRoundMenu() {
        this.setScreen(this.provider.getRoundMenuScreen(this.getRound(), this.solved), () => {
            this.state = GameState.CHOOSING_QUESTION;
        });
    }

    public async setRound(round: number) {
        this.round = round;
        await this.provider.loadDataForRound(this.getRound());
        this.solved = this.provider.getSolvedTemplate(this.getRound());
        this.notifyAll({
            type: MessageType.SET_ROUND,
            data: this.provider.getRoundTitle(this.getRound())
        })
    }

    public async startGame() {
        this.state = GameState.ACTION;
        await this.setRound(1);
        this.renderRoundMenu();
    }

    public selectQuestion(coords: QuestionIdentifier) {
        this.state = GameState.WAITING_FOR_ANSWER;
        this.solved[coords.category][coords.question] = true;
        this.setScreen(this.provider.getQuestionScreen(this.getRound(), coords), () => {
            this.state = GameState.CHOOSING_QUESTION;
            setTimeout(() => this.renderRoundMenu(), 5000);
        })
    }

    public async setAdmin(user: User, connection: Socket) {
        if (this.admin && this.admin.user.user_id != user.user_id) {
            this.debug("Admin already set");
            return;
        }

        if (!this.admin) {
            let i = this.players.findIndex(player => player.user.user_id == user.user_id);
            this.admin = this.players[i];
            this.players.splice(i, 1);
            this.notifyAll({
                type: MessageType.REMOVE_USER,
                data: i
            })
            this.notifyAll({
                type: MessageType.SET_ADMIN, 
                data: {
                    user: user,
                    // render: await ejs.renderFile("./views/ingame/player.ejs", {user: user})
                }
            });
        } else {
            this.admin.connection = connection;
        }

        console.log("Setting admin listeners to " + user.user_login)
        this.admin.connection.on(MessageType.START_GAME, () => {
            if (this.state == GameState.WAITING_FOR_START) {
                this.startGame();
            }
        })
    }

    public getPlayer(id?: number) {
        console.log("Getting player " + id)
        let player = this.players.find(player => player.user.user_id == id);
        console.log(player)
        player = player ?? this.admin;
        console.log(player ?? this.admin?.user.user_id == id)
        return this.players.find(player => player.user.user_id == id) ?? (this.admin?.user.user_id == id ? this.admin : undefined);
    }

    public async join(user: User, connection: Socket) {
        // Current room state
        for (let player of this.players) {
            console.log("Emitting " + player.user.user_login);
            connection.emit(MessageType.ADD_USER, JSON.stringify({
                user: {
                    id: player.user.user_id,
                    login: player.user.user_login,
                    avatar: player.user.user_avatar_id
                },
                render: await ejs.renderFile("./views/ingame/player.ejs", {user: player.user})
            }));
        }
        if (this.admin) {
            connection.emit(MessageType.SET_ADMIN,
                JSON.stringify({
                    user: this.admin.user,
                    // render: await ejs.renderFile("./views/ingame/player.ejs", {user: this.admin.user})
                })
            );
        }
        
        // Debug
        if (this.state == GameState.CHOOSING_QUESTION) {
            connection.emit(MessageType.SET_SCREEN, JSON.stringify({
                render: await this.provider.getRoundMenuScreen(this.getRound(), this.solved)
            }))
        }

        let player = this.getPlayer(user.user_id);
        // console.log("Player: ", player)
        if (player) {
            // If user was in game before
            console.log("Reconnecting " + user.user_login)
            player.connection.disconnect();
            player.connection = connection;
            player.active = true;
            if (this.admin?.user.user_login == user.user_login) {
                this.setAdmin(user, connection);
            }
        } else {
            // If user is new
            console.log("Adding " + user.user_login)
            this.players.push({
                user: user,
                connection: connection,
                score: 0,
                active: true
            });
            this.notifyAll({
                type: MessageType.ADD_USER,
                data: {
                    user: {
                        id: user.user_id,
                        login: user.user_login,
                        avatar: user.user_avatar_id
                    },
                    render: await ejs.renderFile("./views/ingame/player.ejs", {user: user})
                }
            })
        }

        // Setting up listeners
        connection.on("disconnect", () => {
            let player = this.getPlayer(user.user_id);
            if (!player) {
                return;
            }
            player.active = false;
            // let i = this.players.findIndex(player => player.user.user_id == user.user_id);
            // this.players[i].active = false;
        })

        connection.on(MessageType.SET_ADMIN, () => {
            console.log("Admin set request")
            this.setAdmin(user, connection);
        })

        connection.on(MessageType.CHAT_MESSAGE, async (message: string) => {
            console.log("Chat message: " + message + " from " + user.user_login);
            this.notifyAll({
                type: MessageType.CHAT_MESSAGE,
                data: {
                    sender: user.user_login,
                    render: await ejs.renderFile("./views/ingame/message.ejs", {user: user, message: message})
                }
            })
        })

        connection.on(MessageType.LOADED, () => {
            this.readyCounter++;
            if (this.readyCounter == this.players.length) {
                this.readyCallback?.();
            }
        })

        connection.on(MessageType.SELECT_QUESTION, (m: string) => {
            let coords = JSON.parse(m) as QuestionIdentifier;
            if (this.state != GameState.CHOOSING_QUESTION
                || this.currentPlayer != -1 && this.currentPlayer != user.user_id && this.admin?.user.user_id != user.user_id
                || this.solved[coords.category][coords.question]) {
                return;
            }
            this.selectQuestion(coords);
        })
        
        console.log(this.players.map(player => player.user.user_login))
    }
}