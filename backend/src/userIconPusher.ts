import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UsersRepository } from "./db/UsersRepository.js";

@Injectable()
export class UserIconPusher implements NestMiddleware {
    constructor(private readonly usersRepository: UsersRepository){}

    async use(req: Request, res: Response, next: NextFunction) {
        let id = (await this.usersRepository.getUserById(req.body.id))?.user_avatar_id;
        res.locals.userIcon = id ? "files/" + id : "images/profile_icon.png";
        next();
    }
}