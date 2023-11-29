import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, Res } from '@nestjs/common';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Request, Response } from 'express';
import { Set } from '../../db/model/Set.js';
import { SetsRepository } from '../../db/SetsRepository.js';
import { AddCategoryRequest } from '../dto/setDTO.js';
import { Round } from '../../db/model/Round.js';

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

    @Delete(":id")
    async delete(@Param("id") id: number, @Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged || req.body.id != (await this.repository.getSet(id))?.set_author_id) {
            res.status(401).send();
            return;
        }
        if (await this.repository.deleteSet(id)) {
            res.status(200).send();
        } else {
            res.status(404).send();
        }
    }

    @Put(":id/categories")
    async addCategory(@Param("id") id: number, @Body() body: AddCategoryRequest) {
        body.setId = id;
        return await this.repository.addCategory(body);
    }

    @Delete(":id/categories")
    async removeCategory(@Param("id") id: number, @Body() body: AddCategoryRequest) {
        body.setId = id;
        return await this.repository.removeCategory(body);
    }

    @Post(":id/rounds")
    async addRound(@Param("id") id: number) {
        return await this.repository.addRound(id);
    }
    @Put(":id/rounds")
    async updateRound(@Param("id") id: number, @Body() body: Round) {
        body.set_id = +id;
        return await this.repository.updateRound(body);
    }
    @Delete(":id/rounds")
    async removeRound(@Param("id") id: number, @Body() body: {round_number: number}) {
        return await this.repository.deleteRound(id, body.round_number);
    }
}
