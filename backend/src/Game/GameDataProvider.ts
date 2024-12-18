import { Injectable } from "@nestjs/common";
import { SetsRepository } from "../db/repositories/SetsRepository.js";
import { RoundsRepository } from "../db/repositories/RoundsRepository.js";
import { CategoriesRepository } from "../db/repositories/CategoriesRepository.js";
import { QuestionsRepository } from "../db/repositories/QuestionsRepository.js";
import { Question } from "../db/model/Question.js";
import { Category } from "../db/model/Category.js";
import { QuestionIdentifier, RoundIdentifier } from "./DTO.js";
import ejs from "ejs";

export interface CategoryWithQuestions {
    category: Category,
    questions: Question[]
}

export interface RoundData {
    title: string,
    categories: CategoryWithQuestions[]
}

function key(id: RoundIdentifier){
    return id.set + "_" + id.round;
}

@Injectable()
export class GameDataProvider {
    private cache: Map<string, RoundData> = new Map()

    constructor(private readonly setsRepository: SetsRepository,
                private readonly roundsRepository: RoundsRepository,
                private readonly categoriesRepository: CategoriesRepository,
                private readonly questionsRepository: QuestionsRepository){}

    public async loadDataForRound(id: RoundIdentifier) {
        this.getRoundsCount(id.set);
        
        if (this.cache.get(key(id))) {
            return;
        }
        console.log("Loading round " + JSON.stringify(id));
        let round = await this.roundsRepository.getRound(id.set, id.round);

        let data: RoundData = {
            title: round.round_name ?? "Round " + id.round,
            categories: []
        };

        let categories = await this.categoriesRepository.getCategoriesListForRound(id.set, id.round);
        for (let category of categories) {
            data.categories.push({
                category: category,
                questions: (await this.questionsRepository.getQuestionsListForCategory(category.category_id)).map(question => {
                    return question.question_price ? question : {...question, 
                        question_price: question.question_number * id.round * 100};
                })
            })
        }
        this.cache.set(key(id), data);
        console.log("Round " + JSON.stringify(id) + " loaded");
    }

    deleteDataForRound(id: RoundIdentifier) {
        this.cache.delete(key(id));
    }

    public async getRoundsCount(setId: number): Promise<number> {
        return this.setsRepository.getRoundsCount(setId);
    }

    public getRoundTitle(id: RoundIdentifier) {
        return this.cache.get(key(id))?.title ?? "Error getting round title";
    }

    public async getRoundMenuScreen(id: RoundIdentifier, solvedQuestions: boolean[][]) {
        if (!this.cache.get(key(id))) {
            return "Data not loaded";
        }
        return ejs.renderFile("./views/ingame/screenTable.ejs", {
            categories: this.cache.get(key(id))?.categories,
            solved: solvedQuestions });
    }

    public getIdsByCoords(id: RoundIdentifier, coords: QuestionIdentifier) {
        let round = this.cache.get(key(id));
        if (!round) {
            return undefined;
        }
        let category = round.categories[coords.category];
        if (!category) {
            return undefined;
        }
        let question = category.questions[coords.question];
        if (!question) {
            return undefined;
        }
        return {
            categoryId: category.category.category_id,
            questionNumber: question.question_number
        }
    }


    public getSolvedTemplate(round: RoundIdentifier): boolean[][] {
        let roundData = this.cache.get(key(round));
        if (!roundData) {
            return [];
        }
        let result: boolean[][] = [];
        for (let i = 0; i < roundData.categories.length; i++) {
            result.push([]);
            for (let j = 0; j < roundData.categories[i].questions.length; j++) {
                result[i].push(false);
            }
        }
        return result;
    }

    public async getQuestionScreen(round: RoundIdentifier, id: QuestionIdentifier) {
        let ids = this.getIdsByCoords(round, id);
        if (!ids) {
            return "Error getting question";
        }
        let question = await this.questionsRepository.getQuestion(ids?.categoryId, ids.questionNumber);
        return ejs.renderFile("./views/ingame/screenText.ejs", {text: question.question_text, hint: "Press 'Space' to answer"});
    }

    public async getAnswerScreen(round: RoundIdentifier, id: QuestionIdentifier) {
        let question = this.getQuestion(round, id);
        return ejs.renderFile("./views/ingame/screenText.ejs", {text: question?.question_answer ?? "Error getting answer", hint: ""});
    }

    public getQuestion(round: RoundIdentifier, id: QuestionIdentifier) {
        return this.cache.get(key(round))?.categories[id.category]?.questions[id.question];
    }

    public async getQuestionPrice(round: RoundIdentifier, id: QuestionIdentifier) {
        let question = this.getQuestion(round, id);
        return question?.question_price ?? -1;
    }
}