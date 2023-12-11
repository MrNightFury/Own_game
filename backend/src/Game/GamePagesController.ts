import { Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersRepository } from '../db/UsersRepository.js';
import { GameEngine } from './GameEngine.js';
import { HttpStatusCode } from 'axios';
import { SetsRepository } from '../db/SetsRepository.js';

@Controller("game")
export class GamePagesController {
    constructor(private readonly repository: UsersRepository,
                private readonly engine: GameEngine,
                private readonly setsRepository: SetsRepository) {
        console.log("Account controller loaded");
    }

    @Get("list")
    @Render("gamesListPage")
    async getGamesList() {
        return {
            games: this.engine.getGamesList()
        }
    }

    @Get(":id")
    @Render("game")
    async getGameScreen(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged) {
            res.redirect("/account/login?redirect=" + req.url);
            return;
        }
        let user = await this.repository.getUserById(req.body.id);
        let game = this.engine.getGameById(+req.params.id)?.getInfo()
        if (!game) {
            res.status(HttpStatusCode.NotFound).send();
            return;
        }
        return {
            user: user,
            game: game
        };
    }
}
