import { RowDataPacket } from "mysql2";

export interface Round extends RowDataPacket {
    set_id: number;
    round_number: number;
    round_name?: string;
}