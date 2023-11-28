import { Body, Controller, Delete, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Request, Response } from 'express';
import { Set } from '../../db/model/Set.js';
import { SetsRepository } from '../../db/SetsRepository.js';

@Controller("api/sets")
export class SetsControler {
    constructor(private readonly repository: SetsRepository) {
        console.debug("Auth controller loaded")
    }

    @Post()
    async create(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged) {
            res.status(401).send();
            return;
        }
        req.body.set_author_id = req.body.id;
        this.repository.saveSet(req.body)
    }
}
