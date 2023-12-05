import { Body, Controller, Delete, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';
import { Request, Response } from 'express';
import { UsersRepository } from '../../db/UsersRepository.js';
import { CategoriesRepository } from '../../db/CategoriesRepository.js';

@Controller("account")
export class AccountControler {
    constructor(private readonly setsRepository: SetsRepository,
                private readonly userRepository: UsersRepository,
                private readonly categoriesRepository: CategoriesRepository) {
        console.log("Account controller loaded");
    }

    @Get("login")
    @Render("loginPage")
    async getLoginPage(@Req() req: Request, @Res() res: Response) {
        let user = await this.userRepository.getUserById(req.body.id);
        if (req.body.logged) {
            res.redirect("./" + user?.user_login);
        }
    }

    @Get("register")
    @Render("registrationPage")
    async getRegisterPage(@Req() req: Request, @Res() res: Response) {
        if (req.body.logged) {
            let user = await this.userRepository.getUserById(req.body.id);
            res.redirect("./" + user?.user_login);
        }
    }

    @Get()
    async rediderctToAccount(@Req() req: Request, @Res() res: Response) {
        if (!req.body.logged) {
            res.redirect("/account/login");
        } else {
            res.redirect("/account/" + (await this.userRepository.getUserById(req.body.id))?.user_login);
        }
    }

    @Render("accountPage")
    @Get(":login")
    async getUserPage(@Param() params: any, @Req() req: Request, @Res() res: Response) {
        // if (!req.body.logged) {
        //     res.redirect("/account/login");
        //     return;
        // }
        let viewer
        if (req.body.id) {
            viewer = await this.userRepository.getUserById(req.body.id);
        }
        
        let user = await this.userRepository.getUser(params.login);
        if (!user || !user.user_id) {
            res.status(404).json({message: "User not found"});
            return;
        }
        return {
            user: user,
            sets: await this.setsRepository.getSetsByAuthor(user.user_id),
            categories: await this.categoriesRepository.getCategoriesByAuthorWithData(user.user_id),
            canEdit: user.user_id == req.body.id,
            canBan: viewer?.user_role == 'moderator' || viewer?.user_role == 'admin',
            viewer: viewer ?? -1,
            edit: req.query.edit ? req.query.edit : false
        }
    }
}
