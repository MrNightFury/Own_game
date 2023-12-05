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
    // user_id int auto_increment,
	// user_name varchar(50) not null,
	// user_password varchar(50) not null,
	// user_avatar_path tinytext,
	// primary key (user_id)
}