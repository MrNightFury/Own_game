import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Role, User } from '../../db/model/User.js';
import { UsersRepository } from '../../db/repositories/UsersRepository.js';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '../../config/ConfigService.js';
import axios from 'axios';
import { JWTService } from '../../JWTService.js';
import { CanHelper } from '../../canHelper.js';

@Controller("api/users")
export class UsersController {
    constructor(private readonly repository: UsersRepository,
                private readonly configService: ConfigService) {
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

    @Post(":id/icon")
    @UseInterceptors(FileInterceptor("file"))
    async uploadIcon(@Param("id") id: number, @UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res({passthrough: true}) res: Response) {
        console.log("File got")
        let token = req.cookies["jwt"];
        if (!token) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }
        let result = JWTService.verify(token);
        if (result == false) {
            res.status(HttpStatus.UNAUTHORIZED).json({message: "Invalid token"});
            return;
        }
        if (result != id) {
            res.status(HttpStatus.FORBIDDEN).send();
            return;
        }
        if (!CanHelper.isValidFile(file)) {
            res.status(HttpStatus.BAD_REQUEST).send();
            return;
        }

        let cfg = this.configService.getConfig().fileStorage;
        let url = "http://" + cfg.host + ":" + cfg.port + "/files";
        let data = new FormData();
        let blob = new Blob([file.buffer], {type: file.mimetype});
        data.append("file", blob, file.originalname);
        let response = await axios.post(url, data, {
            headers: {
                ...req.headers
            }
        }).catch((err) => {
            return;
        }).then((response) => {
            if (!response) {
                return;
            }
            return response.data;
        });
        if (!response) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            return;
        }
        let user = await this.repository.getUserById(id);
        if (!user) {
            res.status(HttpStatus.NOT_FOUND).send();
            return;
        }
        user.user_avatar_id = response.id;
        console.log(response.id)
        return this.repository.updateUserInfo(user);
    }

    @Post(":id/becomeEditor")
    async becomeEditor(@Param("id") id: number, @Res({passthrough: true}) res: Response) {
        let user = await this.repository.getUserById(id);
        if (!user) {
            res.status(HttpStatus.NOT_FOUND).send();
            return;
        }
        return this.repository.setRole(id, Role.EDITOR);
    }

    @Post(":id/ban")
    async banUser(@Param("id") id: number, @Req() req: Request, @Res({passthrough: true}) res: Response) {
        let user = await this.repository.getUserById(req.body.id);
        if (user?.user_role != Role.MODERATOR && user?.user_role != Role.ADMIN) {
            res.status(HttpStatus.FORBIDDEN).send();
            return;
        }
        return this.repository.banUser(id, req.body.state);
    }
}
