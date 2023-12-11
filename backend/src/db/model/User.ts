import { RowDataPacket } from "mysql2/promise";

export enum Role {
    USER = 'user',
    EDITOR = 'editor',
    ADMIN = 'admin',
    MODERATOR = 'moderator'
}

export interface User extends RowDataPacket {
    user_id?: number,
    user_login: string,
    user_password: string,
    user_avatar_id?: string,
    user_role: Role,
    isBanned: boolean
}