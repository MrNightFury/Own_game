import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from "mysql2";
import { DBService } from './DBService.js';
import { User } from './model/User.js';
import { Set } from './model/Set.js';
import { Round } from './model/Round.js';

@Injectable()
export class RoundsRepository {
    constructor(private dbService: DBService) {
        console.log("Rounds repository loaded");
    }

    public async getRoundsList(setId: number) {
        return await this.dbService.getDb()?.query<Round[]>("select * from rounds where set_id=?", [setId]).then(res => {
            return res[0];
        });
    }

    public async getRound(setId: number, roundNumber: number) {
        return await this.dbService.getDb().query<Round[]>(`
            select * from rounds where set_id=? and round_number=?
        `, [setId, roundNumber]).then(res => {
            return res[0][0];
        })
    }
}
