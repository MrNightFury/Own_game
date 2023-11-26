import fs from "fs";

export interface Config {
    db: DBConfig;
}

export interface DBConfig {
    user: string;
    host: string;
    password: string;
    port: number;
}

export function loadConfig() {
    let config = JSON.parse(fs.readFileSync("config.json", "utf8")) as Config;
    config = {
        db: {
            user: process.env.DB_USER || config.db.user,
            host: process.env.DB_HOST || config.db.host,
            password: process.env.DB_PASSWORD || config.db.password,
            port: Number(process.env.DB_PORT) || config.db.port,
        }
    }
    return config;
}