import { Body, Controller, Delete, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Request, Response } from 'express';
import { RoundsRepository } from '../../db/RoundsRepository.js';
import { CategoriesRepository } from '../../db/CategoriesRepository.js';
import { Category } from '../../db/model/Category.js';
import { Round } from '../../db/model/Round.js';

@Controller("categories")
export class CategoriesEditorController {
    constructor(private readonly setsRepository: SetsRepository,
                private readonly usersRepository: UsersRepository,
                private readonly roundsRepository: RoundsRepository,
                private readonly categoriesRepository: CategoriesRepository) {
        console.log("Sets editor controller loaded");
    }

    @Get("list")
    @Render("categoriesList")
    async getCategoriesList(@Body() body: any) {
        return {
            // sets: await this.categoriesRepository.,
            logged: body.logged,
            userId: body.id
        }
    }

    // @Get("new")
    // @Render("setEdit")
    // async createSetPage() {
    //     return {
    //         id: -1
    //     }
    // }

    // @Get(":id")
    // @Render("set")
    // async getSetPage(@Param("id") setId: number, @Req() req: Request, @Res() res: Response) {
    //     let set = await this.setsRepository.getSet(setId);
    //     if (!set || !set.set_id) {
    //         res.status(404).json({Message: "Set not found"});
    //         return;
    //     }
    //     let author = await this.usersRepository.getUserById(set.set_author_id);
    //     let isAuthor = req.body.logged && req.body.login == author?.user_login;

    //     let rounds = await this.roundsRepository.getRoundsList(set.set_id);
    //     let categories: {round: Round, categories: Category[]}[] = [];
    //     for (let i in rounds) {
    //         categories[i] = {
    //             round: rounds[i],
    //             categories: await this.categoriesRepository.getCategoriesListForRound(rounds[i].set_id, rounds[i].round_number)
    //         }
    //     }
    //     return {
    //         edit: req.query.edit ?? "",
    //         canEdit: isAuthor,
    //         set: set,
    //         rounds: categories
    //     }
    // }
}
