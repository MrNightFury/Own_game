import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { DBService } from '../../db/DBService.js';
import { User } from '../../db/model/User.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Response } from 'express';

@Controller("api/users")
export class UsersController {
    constructor(private readonly repository: UsersRepository) {
        console.log("Users controller loaded");
    }

    @Get()
    async getUsersList() {
        return this.repository.getUsersList();
    }

    @Post()
    async createUser(@Body() user: User) {
        return this.repository.addUser(user);
    }

    }

    @Delete(":id")
    async deleteUser(@Param("id") id: number, @Body() body: any, @Res({passthrough: true}) res: Response) {
        if (!body.logged || body.id != id) {
            res.status(HttpStatus.FORBIDDEN).send();
            return;
        }
        return this.repository.deleteUser(body.id);
    }
}
