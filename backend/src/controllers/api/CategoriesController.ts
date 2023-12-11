import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CategoriesRepository } from '../../db/CategoriesRepository.js';
import { QuestionsRepository } from '../../db/QuestionsRepository.js';
import { CanHelper } from '../../canHelper.js';

@Controller("api/categories")
export class CategoriesControler {
    constructor(private readonly categoriesepository: CategoriesRepository,
                private readonly questionsRepository: QuestionsRepository) {
        console.debug("Auth controller loaded")
    }

    @Get()
    async show() {
        return await this.categoriesepository.getCategoriesList();
    }

    @Post()
    async create (@Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged) {
            res.status(401).send();
            return;
        }
        if (!await CanHelper.canCreate(req.body.id)) {
            res.status(403).send();
            return;
        }
        req.body.category_author_id = req.body.id;
        let result = (await this.categoriesepository.createCategory(req.body)) as {insertId: number};
        return {
            id: result.insertId ? result.insertId : req.body.set_id
        }
    }

    @Put(":id")
    async update (@Param("id") id: number, @Req() req: Request) {
        req.body.category_id = id;
        return await this.categoriesepository.updateCategory(req.body);
    }

    @Delete(":id")
    async delete (@Param("id") id: number, @Req() req: Request) {
        return await this.categoriesepository.deleteCategory(id);
    }

    @Post(":id/questions")
    async createQuestion(@Param("id") id: number, @Body() body: any) {
        body.category_id = id;
        return await this.questionsRepository.pushQuestion(body);
    }

    @Put(":id/questions")
    async updateQuestion(@Param("id") id: number, @Body() body: any) {
        body.category_id = id;
        return await this.questionsRepository.updateQuestion(body);
    }

    @Delete(":id/questions")
    async deleteQuestion(@Param("id") id: number, @Body() body: any) {
        return await this.questionsRepository.deleteQuestion(id, body.question_number);
    }

    @Patch(":id/questions")
    async swapQuestions(@Param("id") id: number, @Body() body: any) {
        return await this.questionsRepository.swapQuestions(id, body.number);
    }
}
