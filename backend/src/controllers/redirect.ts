import { All, Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response, response } from 'express';
import { ConfigService } from '../config/ConfigService.js';
import { FileStorageConfig } from '../config/Configs.js';
import path from 'path';

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
        res.redirect(url);
    }

    @Get("src/*")
    async getSrc(@Res() res: Response, @Req() req: Request) {
        let filename = req.url.split("/").slice(2).join("/");
        filename = path.join(process.cwd(), "dist", filename);
        res.sendFile(filename);
    }

    @Get("")
    async getSite(@Res() res: Response) {
        res.redirect("/sets/list");
    }
}
