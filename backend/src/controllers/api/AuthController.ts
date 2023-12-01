import { Body, Controller, Delete, Get, Logger, Post, Res } from '@nestjs/common';
import { User } from '../../db/model/User.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { AuthRequest } from '../dto/UserDTOs.js';
import { Response } from 'express';
import { JWTService } from '../../JWTService.js';
import { CanHelper } from '../../canHelper.js';

@Controller("auth")
export class AuthControler {
    constructor(private readonly repository: UsersRepository) {
        console.debug("Auth controller loaded")
    }

    @Post("login")
    async login(@Body() req: AuthRequest, @Res({passthrough: true}) res: Response) {
        let user = await this.repository.getUser(req.login).catch(err => {
            console.log(err);
        }).then(res => {
            return res;
        });
        if (!user || !user.user_id) {
            res.status(404).json({message: "User not found"});
        } else if (user.user_password != req.password) {
            res.status(401).json({message: "Incorrect password"});
        } else {
            res.status(200).cookie("jwt", JWTService.generateToken(user.user_id));
        }
    }

    @Post("register")
    async register(@Body() body: AuthRequest, @Res({passthrough: true}) res: Response) {
        if (!CanHelper.validLogin(body.login)) {
            res.status(403).json({
                message: "Incorrect login"
            })
            return;
        }
        let user = await this.repository.getUser(body.login);
        if (user) {
            res.status(409).json({
                message: "User already exist"
            })
            return;
        }
        let result = await this.repository.createUser(body.login, body.password);
        if (result?.affectedRows) {
            res.status(201).cookie("jwt", JWTService.generateToken(result.insertId));
        } else {
            res.sendStatus(400);
        }
    }
}
