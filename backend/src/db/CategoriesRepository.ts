import { Injectable } from '@nestjs/common';
import { DBService } from './DBService.js';
import { Round } from './model/Round.js';
import { Category } from './model/Category.js';

@Injectable()
export class CategoriesRepository {
    constructor(private dbService: DBService) {
        console.log("Rounds repository loaded");
    }

    public async getCategoriesListForRound(setId: number, roundNumber: number) {
        return await this.dbService.getDb()?.query<Category[]>(`
            select categories.category_id, category_name, category_author_id
            from categories left join category_in_round
            on categories.category_id = category_in_round.category_id
            where set_id=? and round_number=?;
        `, [setId, roundNumber]).then(res => {
            return res[0];
        }) ?? [];
    }
}