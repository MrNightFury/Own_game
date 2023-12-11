import { Body, Controller, Get, Param, Render, Req, Res } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';
import { Request, Response } from 'express';
import { RoundsRepository } from '../../db/RoundsRepository.js';
import { CategoriesRepository } from '../../db/CategoriesRepository.js';
import { Category } from '../../db/model/Category.js';
import { Round } from '../../db/model/Round.js';
import { CanHelper } from '../../canHelper.js';

@Controller("sets")
export class SetsEditorController {
    constructor(private readonly setsRepository: SetsRepository,
                private readonly roundsRepository: RoundsRepository,
                private readonly categoriesRepository: CategoriesRepository) {
        console.log("Sets editor controller loaded");
    }

    @Get("list")
    @Render("setsList")
    async getUsersList(@Body() body: any) {
        return {
            sets: await this.setsRepository.getSetsListWithLogins(),
            logged: body.logged,
            userId: body.id
        }
    }

    @Get("new")
    @Render("setEdit")
    async createSetPage(@Req() req: Request, @Res() res: Response) {
        if (!req.body.logged) {
            res.status(401).redirect("/account");
        } else if (!await CanHelper.canCreate(req.body.id)) {
            res.status(403).redirect("/account");
        } else {
            return {
                id: -1
            }
        }
    }

    @Get(":id")
    @Render("set")
    async getSetPage(@Param("id") setId: number, @Req() req: Request, @Res() res: Response) {
        let set = await this.setsRepository.getSet(setId);
        if (!set || !set.set_id) {
            res.status(404).json({Message: "Set not found"});
            return;
        }
        let isAuthor = await CanHelper.canEditSet(req.body.id, set.set_id);
        console.log(isAuthor)

        let rounds = await this.roundsRepository.getRoundsList(set.set_id);
        let categories: {round: Round, categories: Category[]}[] = [];
        for (let i in rounds) {
            categories[i] = {
                round: rounds[i],
                categories: await this.categoriesRepository.getCategoriesListForRound(rounds[i].set_id, rounds[i].round_number)
            }
        }
        return {
            edit: req.query.edit ?? "",
            canEdit: isAuthor,
            set: set,
            rounds: categories
        }
    }

    @Get(":set_id/:round_number/add")
    @Render("addCategoryIntoSet")
    async addCategoryPage(@Param("set_id") setId: number, @Param("round_number") roundNumber: number, @Req() req: any, @Res() res: Response) {
        if (!await CanHelper.canEditSet(req.body.id, setId)) {
            res.redirect("/sets/list")
        }
        return {
            id: req.body.logged ? req.body.id : -1,
            categories: await this.categoriesRepository.getCategoriesWithData(req.query),
            setId: setId,
            roundNumber: roundNumber,
            displayAuthor: true
        }
    }
}
