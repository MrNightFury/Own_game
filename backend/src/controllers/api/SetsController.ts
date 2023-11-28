import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, Res } from '@nestjs/common';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Request, Response } from 'express';
import { Set } from '../../db/model/Set.js';
import { SetsRepository } from '../../db/SetsRepository.js';
import { AddCategoryRequest } from '../dto/setDTO.js';

@Controller("api/sets")
export class SetsControler {
    constructor(private readonly repository: SetsRepository) {
        console.debug("Auth controller loaded")
    }

    @Get()
    async show() {
        return await this.repository.getSetsList();
    }

    @Post()
    async save(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged) {
            res.status(401).send();
            return;
        }
        req.body.set_author_id = req.body.id;
        let result = (await this.repository.saveSet(req.body))?.[0] as {insertId: number};
        return {
            id: result.insertId ? result.insertId : req.body.set_id
        }
    }

    @Put(":id/categories")
    async addCategory(@Param("id") id: number, @Body() body: AddCategoryRequest) {
        body.setId = 1;
        return await this.repository.addCategory(body);
    }

    @Delete(":id/categories")
    async removeCategory(@Param("id") id: number, @Body() body: AddCategoryRequest) {
        body.setId = id;
        return await this.repository.removeCategory(body);
    }
}
