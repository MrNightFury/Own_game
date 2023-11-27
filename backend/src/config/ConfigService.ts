import { Injectable, Logger } from '@nestjs/common';
import { Config, loadConfig } from './Configs.js';
import { JWTService } from '../JWTService.js';

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);
    private config: Config;
    constructor() {
        this.config = loadConfig();
        JWTService.setSecretKey(this.config.jwt.secret);
        console.log("Configs loaded")
    }

    public getConfig() {
        return this.config;
    }
}
