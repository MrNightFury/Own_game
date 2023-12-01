import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { DBService } from '../../db/DBService.js';
import { User } from '../../db/model/User.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { Response } from 'express';
import { Request, Response } from 'express';

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

    @Put(":id")
    async updateUser(@Param("id") id: number, @Body() user: any, @Res({passthrough: true}) res: Response) {
        let oldUser = await this.repository.getUserById(id);
        if (!oldUser) {
            res.status(HttpStatus.NOT_FOUND).send();
            return;
        }
        for (let k in user) {
            oldUser[k] = user[k];
        }
        console.log(oldUser);
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
