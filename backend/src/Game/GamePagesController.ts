import { Controller, Get, HttpStatus, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersRepository } from '../db/repositories/UsersRepository.js';
import { GameEngine } from './GameEngine.js';
import { SetsRepository } from '../db/repositories/SetsRepository.js';

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

    @Get("create")
    @Render("createGame")
    async createGameScreen(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        if (!req.body.logged) {
            res.redirect("/account/login?redirect=" + req.url);
            return;
        }
        return {
            sets: await this.setsRepository.getSetsListWithLogins(),
            userId: req.body.id
        };
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
            res.status(HttpStatus.NOT_FOUND).send();
            return;
        }
        return {
            user: user,
            game: game
        };
    }

    @Post()
    async postGameScreen(@Req() req: Request, @Res() res: Response) {
        if (!req.body.logged) {
            res.redirect("/account/login?redirect=" + req.url);
            return;
        }
        if (!req.body.title || !req.body.setId) {
            res.status(HttpStatus.BAD_REQUEST).send("Missing title or setId");
            return;
        }
        let id = this.engine.createGame({
            title: req.body.title,
            setId: req.body.setId,
        })
        res.json({id: id})
    }
}
