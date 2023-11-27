import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/ConfigService.js';
import { ResultSetHeader } from "mysql2";
import { DBService } from './DBService.js';
import { User } from './model/User.js';
import { UserDeleteRequest } from '../controllers/dto/UserDTOs.js';

@Injectable()
export class UsersRepository {
    constructor(private dbService: DBService) {
        console.log("Users repository loaded");
    }

    public async getUsersList() {
        return await this.dbService.getDb()?.query<User[]>("select * from users").then(res => {
            return res[0];
        }) ?? [];
    }

    public async getUser(login: string) {
        return await this.dbService.getDb()?.query<User[]>("select * from users where user_login=?", [login]).then(res => {
            return res[0][0];
        })
    }

    public async createUser(user: User) {
        return await this.dbService.getDb()?.query<ResultSetHeader>(
            "insert into users(user_id, user_login, user_password, user_avatar_path) value(?, ?, ?, ?)",
            [user.user_id, user.user_login, user.user_password, user.user_avatar_path]
        ).catch(err => {
            return {"message": err.message};
        }).then(res => {
            return res
        });
    }

    public async deleteUser(id: number) {
        return this.dbService.getDb()?.query<ResultSetHeader>(
            "delete from users where user_id=?", [id]
        ).catch(err => {
            return {"message": err.message};
        }).then(res => {
            return res
        });
    }
}
