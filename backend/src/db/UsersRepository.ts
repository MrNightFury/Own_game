import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from "mysql2";
import { DBService } from './DBService.js';
import { Role, User } from './model/User.js';

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

    public async getUserById(id: number) {
        if (!id) {
            return undefined;
        }
        return await this.dbService.getDb()?.query<User[]>("select * from users where user_id=?", [id]).then(res => {
            return res[0][0];
        })
    }

    public async getUser(login: string) {
        return await this.dbService.getDb()?.query<User[]>("select * from users where user_login=?", [login]).then(res => {
            return res[0][0];
        })
    }

    public async createUser(login: string, password: string) {
        return await this.dbService.getDb()?.query<ResultSetHeader>(
            "insert into users(user_login, user_password) value(?, ?)",
            [login, password]
        ).then(res => {
            return res[0];
        });
    }

    public async addUser(user: User) {
        return await this.dbService.getDb()?.query<ResultSetHeader>(
            "insert into users(user_login, user_password) value(?, ?)",
            [user.user_login, user.user_password]
        ).catch(err => {
            return {"message": err.message};
        }).then(res => {
            return res
        });
    }

    public async updateUserInfo(user: User) {
        return await this.dbService.getDb()?.query<ResultSetHeader>(
            "update users set user_login=?, user_avatar_id=? where user_id=?",
            [user.user_login, user.user_avatar_id, user.user_id]
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

    public async setRole(id: number, role: Role) {
        return this.dbService.getDb()?.query<ResultSetHeader>(
            "update users set user_role=? where user_id=?", [role, id]
        ).catch(err => {
            return {"message": err.message};
        }).then(res => {
            return res
        });
    }

    public async banUser(userId: number, state: boolean) {
        return await this.dbService.getDb()?.query("update users set isBanned = ? where user_id=?", [state, userId]);
    }
}
