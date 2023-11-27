import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from "mysql2";
import { DBService } from './DBService.js';
import { User } from './model/User.js';
import { Set } from './model/Set.js';

@Injectable()
export class SetsRepository {
    constructor(private dbService: DBService) {
        console.log("Sets repository loaded");
    }

    public async getSetsList() {
        return await this.dbService.getDb()?.query<Set[]>("select * from sets").then(res => {
            return res[0];
        }) ?? [];
    }

    // public async createUser(user: User) {
    //     return await this.dbService.getDb()?.query<ResultSetHeader>(
    //         "insert into users(user_id, user_name, user_password, user_avatar_path) value(?, ?, ?, ?)",
    //         [user.user_id, user.user_name, user.user_password, user.user_avatar_path]
    //     ).catch(err => {
    //         return {"message": err.message};
    //     }).then(res => {
    //         return res
    //     });
    // }

    // public async deleteUser(id: number) {
    //     return this.dbService.getDb()?.query<ResultSetHeader>(
    //         "delete from users where user_id=?", [id]
    //     ).catch(err => {
    //         return {"message": err.message};
    //     }).then(res => {
    //         return res
    //     });
    // }
}
