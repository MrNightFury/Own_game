import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { DBService } from '../../db/DBService.js';
import { User } from '../../db/model/User.js';
import { UsersRepository } from '../../db/UsersRepository.js';
import { UserDeleteRequest } from '../dto/UserDTOs.js';

@Controller("api/users")
export class UsersController {
    constructor(private readonly repository: UsersRepository) {
        console.log("Users controller loaded");
    }

    @Get()
    getUsersList() {
        return this.repository.getUsersList();
    }

    @Post()
    createUser(@Body() user: User) {
        return this.repository.createUser(user);
    }

    @Delete()
    async deleteUser(@Body() req: UserDeleteRequest) {
        return this.repository.deleteUser(req.id);
    }
}
