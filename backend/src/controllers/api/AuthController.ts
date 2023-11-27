import { Body, Controller, Delete, Get, Logger, Post, Res } from '@nestjs/common';
import { User } from '../../db/model/User.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { AuthRequest, UserDeleteRequest } from '../dto/UserDTOs.js';
import { Response } from 'express';
import { JWTService } from '../../JWTService.js';

@Controller("auth")
export class AuthControler {
    private readonly logger = new Logger(AuthControler.name);
    
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
        if (!user) {
            res.status(404).json({message: "User not found"});
        } else {
            res.status(200).cookie("jwt", JWTService.generateToken(user.user_login));
        }
    }
}
