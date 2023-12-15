import { Body, Controller, Get, Param, Render, Req, Res } from '@nestjs/common';
import { SetsRepository } from '../../db/repositories/SetsRepository.js';
import { UsersRepository } from '../../db/repositories/UsersRepository.js';
import { Request, Response } from 'express';
import { RoundsRepository } from '../../db/repositories/RoundsRepository.js';
import { CategoriesRepository } from '../../db/repositories/CategoriesRepository.js';
import { CanHelper } from '../../canHelper.js';
import { QuestionsRepository } from '../../db/repositories/QuestionsRepository.js';

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
            categories: await this.categoriesRepository.getCategoriesWithData(),
            id: body.id
        }
    }

    @Get(":id")
    @Render("category")
    async getCategoryPage(@Param("id") categoryId: number, @Req() req: Request, @Res() res: Response) {
        let category = await this.categoriesRepository.getCategory(categoryId);
        if (!category || !category.category_id) {
            res.status(404).json({Message: "Category not found"});
            return;
        }

        let user = await this.usersRepository.getUserById(req.body.id);
        let canEdit = CanHelper.canEdit(user, category.category_author_id);

        return {
            edit: req.query.edit ?? "",
            canEdit: canEdit,
            category: category,
            questions: await this.questionsRepository.getQuestionsListForCategory(category.category_id)
        }
    }
}
