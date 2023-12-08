export interface SocketMessage {
    type: MessageType;
    data: any;
}

export enum MessageType {
    ADD_USER = "ADD_USER",
    SET_SCREEN = "SET_SCREEN",
    DEBUG = "DEBUG",
    CHAT_MESSAGE = "CHAT_MESSAGE",
    SET_ROUND = "SET_ROUND",
    SET_SCORE = "SET_SCORE",
    SET_ADMIN = "SET_ADMIN",
}