import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/ConfigService.js';
import { Connection } from "mysql2/promise.js";
import { createConnection } from 'mysql2/promise.js';

@Injectable()
export class DBService {
    private connection?: Connection;

    constructor(config: ConfigService) {
        let cfg = config.getConfig();
        createConnection({
            host: cfg.db.host,
            user: cfg.db.user,
            password: cfg.db.password,
            database: "own_game_db"
        }).catch(err => {
            console.log(err);
        }).then(res => {
            console.log("Connected to db")
            this.connection = res ?? undefined;
        })
        console.log("DB provider loaded");
    }

    public getDb() {
        return this.connection;
    }
}
