import { Body, Controller, Delete, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';
import { Request, Response } from 'express';
import { UsersRepository } from '../../db/UsersRepository.js';

@Controller("account")
export class AccountControler {
    constructor(private readonly listRepository: SetsRepository,
                private readonly userRepository: UsersRepository) {
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

    @Render("accountPage")
    @Get(":login")
    async getUserPage(@Param() params: any, @Req() req: Request, @Res() res: Response) {
        if (!req.body.logged) {
            res.redirect("/account/login");
            return;
        }
        let user = await this.userRepository.getUserById(req.body.id)
        if (!user || !user.user_id) {
            res.status(404).json({message: "User not found"});
            return;
        }
        return {
            user: user,
            sets: await this.listRepository.getSetsByAuthor(user.user_id),
        }
    }
}
