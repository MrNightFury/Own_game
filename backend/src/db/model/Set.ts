import { RowDataPacket } from "mysql2/promise";

export interface Set extends RowDataPacket {
    set_id?: number,
    set_name: string,
    set_description: string,
    set_author_id: number
}

export interface SetWithAuthor extends Set {
    user_login: string
}