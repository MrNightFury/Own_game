import { All, Body, Controller, Delete, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '../config/ConfigService.js';
import { FileStorageConfig } from '../config/Configs.js';

@Controller()
export class RedirectController {
    private cfg: FileStorageConfig;
    constructor(private readonly configService: ConfigService) {
        console.log("Redirect controller loaded");
        this.cfg = this.configService.getConfig().fileStorage;
    }

    @All("files*")
    async getFile(@Res() res: Response, @Req() req: Request) {
        let url = "http://" + this.cfg.host + ":" + this.cfg.port + req.url;
        console.log("Redirecting to " + url);
        res.redirect(url);
    }
}
