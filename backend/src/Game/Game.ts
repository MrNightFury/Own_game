import { Server, Socket } from "socket.io";
import { User } from "../db/model/User.js";
import { MessageType, SocketMessage } from "./DTO.js";
import * as ejs from "ejs";

export interface GameInfo {
    id?: number;
    title: string;
    setId: number;
}

export enum GameState {
    WAITING_FOR_START
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
    private players: Player[] = [];
    private server: Server;
    private round: number;
    private state: GameState;
    private admin?: User;

    constructor(id: number, info: GameInfo, server: Server) {
        this.roomId = id;
        this.info = info;
        this.server = server;

        this.state = GameState.WAITING_FOR_START;
        this.round = -1;
    }

    public getInfo() {
        return {...this.info, id: this.roomId} as GameInfo;
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

    public async join(user: User, connection: Socket) {
        for (let player of this.players) {
            console.log("Emitting " + MessageType.ADD_USER);
            connection.emit(MessageType.ADD_USER, JSON.stringify({
                user: {
                    id: player.user.user_id,
                    login: player.user.user_login,
                    avatar: player.user.user_avatar_id
                },
                render: await ejs.renderFile("./views/ingame/player.ejs", {user: player.user})
            }));
            if (this.admin) {
                this.notifyAll({
                    type: MessageType.SET_ADMIN, 
                    data: {
                        user: this.admin,
                        index: this.players.findIndex(player => player.user.user_id == this.admin?.user_id)
                    }
                })
            }
        }

        let player = this.players.find(player => player.user.user_id == user.user_id);
        if (player) {
            player.connection.disconnect();
            player.connection = connection;
            player.active = true;
        } else {
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

        connection.on("disconnect", () => {
            let i = this.players.findIndex(player => player.user.user_id == user.user_id);
            this.players[i].active = false;
        })

        connection.on(MessageType.SET_ADMIN, () => {
            console.log("asd")
            if (this.admin) {
                this.debug("Admin already set");
            }
            this.admin = user;
            let i = this.players.findIndex(player => player.user.user_id == user.user_id);
            this.notifyAll({
                type: MessageType.SET_ADMIN, 
                data: {
                    user: user,
                    index: i
                }
            });
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
        
        console.log(this.players.map(player => player.user.user_login))
    }
}