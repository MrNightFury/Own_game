import { Injectable } from '@nestjs/common';
import { DBService } from '../DBService.js';
import { Question } from '../model/Question.js';

@Injectable()
export class QuestionsRepository {
    constructor(private dbService: DBService) {
        console.log("Sets repository loaded");
    }

    public async getQuestionsListForCategory (id: number) {
        return await this.dbService.getDb()?.query<Question[]>(
            "select * from questions where category_id=? order by question_number", [id]).then(res => {
            return res[0];
        }) ?? [];
    }

    public async createQuestion (question: Question) {
        console.log(question);
        return await this.dbService.getDb()?.query(`insert into questions(
            category_id, question_number, question_text, question_answer) value (?, ?, ?, ?)`, 
            [question.category_id, question.question_number, question.question_text, question.question_answer]);
    }

    public async pushQuestion (question: Question) {
        console.log(question);
        let questions = await this.dbService.getDb()?.query<Question[]>(
            "select * from questions where category_id=? order by question_number desc limit 1", [question.category_id]).then(res => {
            return res[0];
        }) ?? [];
        let questionNumber = questions.length > 0 ? questions[0].question_number + 1 : 1;
        question.question_number = questionNumber;
        return await this.createQuestion(question);
    }

    public async updateQuestion(question: Question) {
        return await this.dbService.getDb()?.query(`update questions set
            question_text = ?, question_answer = ?, question_title = ?
            where category_id=? and question_number=?`, 
        [question.question_text, question.question_answer, question.question_title, question.category_id, question.question_number]);
    }

    public async deleteQuestion(categoryId: number, questionNumber: number) {
        return await this.dbService.getDb()?.query("call deleteQuestion(?, ?)", [categoryId, questionNumber]);
    }

    public async swapQuestions(categoryId: number, number: number) {
        return await this.dbService.getDb()?.query("call swapQuestions(?, ?)", [categoryId, number]);
    }

    public async getQuestion(categoryId: number, questionNumber: number) {
        return await this.dbService.getDb()?.query<Question[]>("select * from questions where category_id=? and question_number=?", [categoryId, questionNumber]).then(res => {
            return res[0][0];
        });
    }
}
