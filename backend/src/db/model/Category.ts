import { RowDataPacket } from "mysql2";

export interface Category extends RowDataPacket {
    category_id: number;
    category_author_id: number;
    category_name: string;
}

export interface CategoryWithData extends Category {
    questions_count: number;
    user_id: number;
    user_login: string;
}