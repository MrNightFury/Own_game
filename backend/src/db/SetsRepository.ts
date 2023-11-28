import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from "mysql2";
import { DBService } from './DBService.js';
import { User } from './model/User.js';
import { Set } from './model/Set.js';
import { AddCategoryRequest } from '../controllers/dto/setDTO.js';

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

    public async getSetsListWithLogins() {
        return await this.dbService.getDb()?.query<Set[]>(`
            select set_id, set_name, set_description, set_author_id, user_login
            from sets inner join users on sets.set_author_id=users.user_id
            order by set_id`).then(res => {
            return res[0];
        }) ?? [];
    }

    public async getSet(id: number) {
        return await this.dbService.getDb()?.query<Set[]>("select * from sets where set_id=?", [id]).then(res => {
            return res[0][0];
        });
    }

    public async getSetsByAuthor(id: number) {
        return await this.dbService.getDb()?.query<Set[]>("select * from sets where set_author_id=?", [id]).then(res => {
            return res[0]
        }) ?? [];
    }

    public async saveSet(set: Set) {
        if (set.set_id) {
            return await this.dbService.getDb()?.query(`update sets set
                set_name = ?, set_description = ?
            where set_id=?`, [set.set_name, set.set_description, set.set_id]);
        } else {
            return await this.dbService.getDb()?.query(`insert into sets(set_name, set_description, set_author_id)
            value (?, ?, ?)`, [set.set_name, set.set_description, set.set_author_id]);
        }
    }

    public async addCategory(req: AddCategoryRequest) {
        console.log(req);
        return await this.dbService.getDb()?.query("insert into category_in_round value (?, ?, ?);", 
                                                    [req.setId, req.roundNumber, req.categoryId]);
    }

    public async removeCategory(req: AddCategoryRequest) {
        return await this.dbService.getDb()?.query("delete from category_in_round where set_id=? and round_number=? and category_id=?", 
                                                    [req.setId, req.roundNumber, req.categoryId]);
    }
}
