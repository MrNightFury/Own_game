import { RowDataPacket } from "mysql2";

export interface Question extends RowDataPacket {
    category_id: number;
    question_number: number;
    question_text: string;
    question_answer: string;
    
    question_price?: number;
    question_title?: string;
}