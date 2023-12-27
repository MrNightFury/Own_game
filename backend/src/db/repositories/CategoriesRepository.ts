import { Injectable } from '@nestjs/common';
import { DBService } from '../DBService.js';
import { Category, CategoryWithData } from '../model/Category.js';
import { CategoryFilter } from '../Filters.js';

@Injectable()
export class CategoriesRepository {
    constructor(private dbService: DBService) {
        console.log("Rounds repository loaded");
    }

    public async getCategoriesListForRound(setId: number, roundNumber: number) {
        return await this.dbService.getDb()?.query<Category[]>(`
            select categories.category_id, category_name, category_author_id
            from categories inner join category_in_round
            on categories.category_id = category_in_round.category_id
            where set_id=? and round_number=?
            order by round_number;
        `, [setId, roundNumber]).then(res => {
            return res[0];
        }) ?? [];
    }

    public async getCategoriesList() {
        return await this.dbService.getDb()?.query<Category[]>("select * from categories;").then(res => {
            return res[0];
        }) ?? [];
    }
    
    public async getCategoriesWithData(filter?: CategoryFilter) {
        let query = `select
        category_id, user_id, user_login, category_name, category_author_id, countQuestionsByCategory(category_id) as questions_count
        from categories inner join users on categories.category_author_id = users.user_id`;
        if (filter) {
            let filters = [];
            if (filter.author)
                filters.push(`user_login='${filter.author}'`)
            if (filter.filterUp)
                filters.push(`countQuestionsByCategory(category_id)<=${filter.filterUp}`)
            if (filter.filterDown)
                filters.push(`countQuestionsByCategory(category_id)>=${filter.filterDown}`)
            if (filters.length > 0) {
                query += " where " + filters.join(" and ");
            }
        }
        return await this.dbService.getDb()?.query<CategoryWithData[]>(query).then(res => {
            return res[0];
        }) ?? [];
    }

    public async getCategoriesByAuthor(id: number) {
        return await this.dbService.getDb()?.query<Category[]>(`
            select * from categories
            where category_author_id=?;
        `, [id]).then(res => {
            return res[0];
        }) ?? [];
    }
    
    public async getCategoriesByAuthorWithData(id: number) {
        return await this.dbService.getDb()?.query<CategoryWithData[]>(`select
        category_id, user_id, user_login, category_name, category_author_id, countQuestionsByCategory(category_id) as questions_count
        from categories inner join users on categories.category_author_id = users.user_id where category_author_id=?;
        `, [id]).then(res => {
            return res[0];
        }) ?? [];
    }

    public async getCategory(id: number) {
        return await this.dbService.getDb()?.query<Category[]>(`
            select * from categories where category_id=?;
        `, [id]).then(res => {
            return res[0][0];
        });
    }

    public async createCategory(category: Category) {
        return await this.dbService.getDb()?.query(`
            insert into categories (category_name, category_author_id)
            values (?, ?);
        `, [category.category_name, category.category_author_id]).then(res => {
            return res[0];
        }) ?? [];
    }

    public async updateCategory(category: Category) {
        return await this.dbService.getDb()?.query(`
            update categories set category_name=?
            where category_id=?;
        `, [category.category_name, category.category_id]).then(res => {
            return res[0];
        }) ?? [];
    }

    public async deleteCategory(id: number) {
        return await this.dbService.getDb()?.query(`
            delete from categories where category_id=?;
        `, [id]).then(res => {
            const result = res[0] as any;
            return result.affectedRows;
        }) ?? [];
    }
}
