import { Server, Socket } from "socket.io";
import { User } from "../db/model/User.js";
import { QuestionIdentifier, MessageType, SocketMessage, RoundIdentifier } from "./DTO.js";
import * as ejs from "ejs";
import { Inject, Injectable } from "@nestjs/common";
import { GameDataProvider } from "./GameDataProvider.js";
import { FixedTimer } from "./Timer.js";

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
    CHECKING_ANSWER,
    USER_LOADING,
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
    private config = {
        timeForQuestion: 30,
    }

    private readonly provider: GameDataProvider;
    private server: Server;

    private round: number;
    private state: GameState;
    private solved: boolean[][] = [];

    private players: Player[] = [];
    private admin?: Player;

    private currentPlayer: number = -1;
    private currentChooser: number = -1;
    private currentQuestionPrice?: number;

    private qustionTimer: FixedTimer;

    private readyCounter: number = 0;
    private readyCallback?: () => void;

    private showAnswerScreen?: () => void;

    constructor(id: number, info: GameInfo, server: Server, provider: GameDataProvider) {
        this.roomId = id;
        this.info = info;
        this.server = server;
        this.provider = provider;

        this.state = GameState.WAITING_FOR_START;
        this.round = -1;
        this.qustionTimer = new FixedTimer(this.config.timeForQuestion);
        this.qustionTimer.setNotifyCallback((time) => {
            this.notifyAll({
                type: MessageType.SET_TIMER,
                data: {
                    time: time,
                    timePercent: time / this.config.timeForQuestion * 100
                }
            })
        });
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

    public async renderRoundMenu() {
        if (this.isRoundCompleted()) {
            console.log(await this.provider.getRoundsCount(this.info.setId), this.round)
            if (await this.provider.getRoundsCount(this.info.setId) > this.round) {
                await this.setRound(this.round + 1);
                await this.renderRoundMenu();
            } else {
                this.state = GameState.WAITING_FOR_START;
                this.notifyAll({
                    type: MessageType.SET_SCREEN,
                    data: {
                        render: await ejs.renderFile("./views/ingame/screenText.ejs", {text: "Game over", hint: "Create new game to play again"})
                    }
                })
            }   
        } else {
            this.setScreen(this.provider.getRoundMenuScreen(this.getRound(), this.solved), () => {
                this.state = GameState.CHOOSING_QUESTION;
            });
        }
    }

    public async setRound(round: number) {
        this.round = round;
        await this.provider.loadDataForRound(this.getRound());
        this.solved = this.provider.getSolvedTemplate(this.getRound());
        this.notifyAll({
            type: MessageType.SET_ROUND,
            data: this.provider.getRoundTitle(this.getRound())
        })
        if (round != 1) {
            this.provider.deleteDataForRound({
                set: this.info.setId,
                round: round - 1
            });
        }
    }

    public async startGame() {
        this.state = GameState.ACTION;
        await this.setRound(1);
        await this.renderRoundMenu();
    }

    public async selectQuestion(coords: QuestionIdentifier) {
        this.state = GameState.USER_LOADING;
        if (this.solved[coords.category] == undefined || this.solved[coords.category][coords.question] == undefined) {
            return;
        }
        this.solved[coords.category][coords.question] = true;
        this.currentQuestionPrice = (await this.provider.getQuestionPrice(this.getRound(), coords)) ?? -1;
        this.setScreen(this.provider.getQuestionScreen(this.getRound(), coords), () => {
            this.state = GameState.WAITING_FOR_ANSWER;
            this.showAnswerScreen = () => {
                this.notifyAll({
                    type: MessageType.SET_TIMER,
                    data: {
                        time: this.config.timeForQuestion,
                        timePercent: 100
                    }
                })
                this.setScreen(this.provider.getAnswerScreen(this.getRound(), coords), () => {
                    setTimeout(() => {
                        this.renderRoundMenu();
                    }, 5000);
                });
            }
            this.qustionTimer.start(() => {
                this.showAnswerScreen?.();
            });
        })
    }

    public isRoundCompleted() {
        for (let i = 0; i < this.solved.length; i++) {
            for (let j = 0; j < this.solved[i].length; j++) {
                if (!this.solved[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    public addScore(userId: number, score: number) {
        let player = this.getPlayer(userId);
        if (player) {
            player.score += score;
            this.notifyAll({
                type: MessageType.SET_SCORE,
                data: {
                    userId: userId,
                    score: player.score
                }
            })
        }
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
        this.admin.connection.on(MessageType.IS_ANSWER_CORRECT, (m: string) => {
            let data = JSON.parse(m);
            let player = this.getPlayer(this.currentPlayer);
            console.log(player);
            if (!player) {
                return;
            }
            this.notifyAll({
                type: MessageType.SET_ACTIVE_USER,
                data: {
                    userId: -1
                }
            })
            if (data.isCorrect) {
                this.addScore(player.user.user_id ?? -1, this.currentQuestionPrice ?? -1);
                this.currentChooser = player.user.user_id ?? -1;
                this.showAnswerScreen?.();
            } else {
                this.state = GameState.WAITING_FOR_ANSWER;
                this.qustionTimer.resume();
                this.addScore(player.user.user_id ?? -1, -(this.currentQuestionPrice ?? -1));
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
            connection.emit(MessageType.SET_SCORE, JSON.stringify({
                    userId: user.user_id,
                    score: player.score
            }))
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
            if (this.state == GameState.CHOOSING_QUESTION &&
                (user.user_id == this.currentChooser || user.user_id == this.admin?.user.user_id || this.currentChooser == -1)) {
                let coords = JSON.parse(m) as QuestionIdentifier;
                this.currentChooser = user.user_id ?? -1;
                this.selectQuestion(coords);
            }
        })

        connection.on(MessageType.WANT_TO_ANSWER, () => {
            if (this.state == GameState.WAITING_FOR_ANSWER) {
                this.state = GameState.CHECKING_ANSWER;
                this.qustionTimer?.pause();
                this.currentPlayer = user.user_id ?? -1;
                this.notifyAll({
                    type: MessageType.SET_ACTIVE_USER,
                    data: {
                        userId: user.user_id
                    }
                })
            }
        })
        
        console.log(this.players.map(player => player.user.user_login))
    }
}