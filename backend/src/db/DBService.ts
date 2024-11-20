import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/ConfigService.js';
import { Connection } from "mysql2/promise.js";
import { createConnection } from 'mysql2';

@Injectable()
export class DBService {
    private connection: Connection;

    constructor(config: ConfigService) {
        let cfg = config.getConfig();
        this.connection = createConnection({
            host: cfg.db.host,
            user: cfg.db.user,
            password: cfg.db.password,
            database: "own_game_db",
            port: cfg.db.port
        }).promise();
        console.log("DB provider loaded");
    }

    public getDb() {
        return this.connection;
    }
}
