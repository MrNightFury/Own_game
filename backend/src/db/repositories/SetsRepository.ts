import { Injectable } from '@nestjs/common';
import { DBService } from '../DBService.js';
import { Set } from '../model/Set.js';
import { AddCategoryRequest } from '../../controllers/dto/setDTO.js';
import { Round } from '../model/Round.js';

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

    public async deleteSet(id: number) {
        return await this.dbService.getDb()?.query("delete from sets where set_id=?", [id]);
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

    public async addRound(setId: number) {
        let rounds = await this.dbService.getDb()?.query<Round[]>(
            "select * from rounds where set_id=? order by round_number desc limit 1", [setId]).then(res => {
            return res[0];
        }) ?? [];
        let roundNumber = rounds.length > 0 ? rounds[0].round_number + 1 : 1;
        return await this.dbService.getDb()?.query(
            "insert into rounds(set_id, round_number) value (?, ?)", [setId, roundNumber]);
    }

    public async updateRound(round: Round) {
        return await this.dbService.getDb()?.query("update rounds set round_name=? where set_id=? and round_number=?", [round.round_name, round.set_id, round.round_number]);
    }

    public async deleteRound(setId: number, roundNumber: number) {
        return await this.dbService.getDb()?.query(
            "call deleteRound(?, ?)", [setId, roundNumber]);
    }

    public async getRoundsCount(setId: number) {
        return await this.dbService.getDb()?.query<any>(
            "select count(*) as count from rounds where set_id=?", [setId]).then(res => {
            return res[0][0].count;
        }) ?? 0;
    }
}
