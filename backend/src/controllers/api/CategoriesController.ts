import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, Res } from '@nestjs/common';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Request, Response } from 'express';
import { CategoriesRepository } from '../../db/CategoriesRepository.js';
import { QuestionsRepository } from '../../db/QuestionsRepository.js';

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
        req.body.category_author_id = req.body.id;
        let result = (await this.categoriesepository.createCategory(req.body)) as {insertId: number};
        return {
            id: result.insertId ? result.insertId : req.body.set_id
        }
    }

    @Put(":id")
    async update (@Param("id") id: number, @Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged || req.body.id != (await this.categoriesepository.getCategory(id))?.category_author_id) {
            res.status(401).send();
            return;
        }
        req.body.category_id = id;
        return await this.categoriesepository.updateCategory(req.body);
    }

    @Delete(":id")
    async delete (@Param("id") id: number, @Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged || req.body.id != (await this.categoriesepository.getCategory(id))?.category_author_id) {
            res.status(401).send();
            return;
        }
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

    // @Put(":id/categories")
    // async addCategory(@Param("id") id: number, @Body() body: AddCategoryRequest) {
    //     body.setId = id;
    //     return await this.repository.addCategory(body);
    // }

    // @Delete(":id/categories")
    // async removeCategory(@Param("id") id: number, @Body() body: AddCategoryRequest) {
    //     body.setId = id;
    //     return await this.repository.removeCategory(body);
    // }

    // @Post(":id/rounds")
    // async addRound(@Param("id") id: number) {
    //     return await this.repository.addRound(id);
    // }
    // @Put(":id/rounds")
    // async updateRound(@Param("id") id: number, @Body() body: Round) {
    //     body.set_id = +id;
    //     return await this.repository.updateRound(body);
    // }
    // @Delete(":id/rounds")
    // async removeRound(@Param("id") id: number, @Body() body: {round_number: number}) {
    //     return await this.repository.deleteRound(id, body.round_number);
    // }
}
