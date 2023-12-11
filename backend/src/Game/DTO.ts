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
    LOADED = "LOADED",
    START_GAME = "START_GAME",
    SELECT_QUESTION = "SELECT_QUESTION",
    REMOVE_USER = "REMOVE_USER",
    IS_ANSWER_CORRECT = "IS_CORRECT",
    SET_ACTIVE_USER = "SET_ACTIVE_USER",
    WANT_TO_ANSWER = "WANT_TO_ANSWER",
    SET_TIMER = "SET_TIMER",
}

export interface QuestionIdentifier {
    category: number,
    question: number
}

export interface RoundIdentifier {
    set: number,
    round: number
}