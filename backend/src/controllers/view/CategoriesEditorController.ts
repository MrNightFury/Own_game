import { Body, Controller, Delete, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Request, Response } from 'express';
import { RoundsRepository } from '../../db/RoundsRepository.js';
import { CategoriesRepository } from '../../db/CategoriesRepository.js';
import { Category } from '../../db/model/Category.js';
import { Round } from '../../db/model/Round.js';
import { CanHelper } from '../../canHelper.js';
import { Question } from '../../db/model/Question.js';
import { QuestionsRepository } from '../../db/QuestionsRepository.js';

@Controller("categories")
export class CategoriesEditorController {
    constructor(private readonly setsRepository: SetsRepository,
                private readonly usersRepository: UsersRepository,
                private readonly roundsRepository: RoundsRepository,
                private readonly categoriesRepository: CategoriesRepository,
                private readonly questionsRepository: QuestionsRepository) {
        console.log("Sets editor controller loaded");
    }

    @Get("list")
    @Render("categoriesList")
    async getCategoriesList(@Body() body: any) {
        return {
            categories: await this.categoriesRepository.getCategoriesWithLogins(),
            id: body.id
        }
    }

    // @Get("new")
    // @Render("setEdit")
    // async createSetPage() {
    //     return {
    //         id: -1
    //     }
    // }

    @Get(":id")
    @Render("category")
    async getCategoryPage(@Param("id") categoryId: number, @Req() req: Request, @Res() res: Response) {
        let category = await this.categoriesRepository.getCategory(categoryId);
        if (!category || !category.category_id) {
            res.status(404).json({Message: "Category not found"});
            return;
        }
        // let author = await this.usersRepository.getUserById(set.set_author_id);

        let user = await this.usersRepository.getUserById(req.body.id);
        let canEdit = CanHelper.can(user, category.category_author_id);
        // let isAuthor = req.body.logged && req.body.login == author?.user_login;

        // let rounds = await this.roundsRepository.getRoundsList(category.category_author_id);
        // let categories: {round: Round, categories: Category[]}[] = [];
        // for (let i in rounds) {
        //     categories[i] = {
        //         round: rounds[i],
        //         categories: await this.categoriesRepository.getCategoriesListForRound(rounds[i].set_id, rounds[i].round_number)
        //     }
        // }
        console.log(canEdit);
        return {
            edit: req.query.edit ?? "",
            canEdit: canEdit,
            category: category,
            questions: await this.questionsRepository.getQuestionsListForCategory(category.category_id)
        }
    }
}
