import { NestFactory } from "@nestjs/core";
import { AppModule } from "./mainModule.js";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule).catch(err => {
        console.log(err);
    }).then(res => {
        console.log("App created");
        return res;
    });
    if (!app) {
        return;
    }
    app.use(cookieParser.default());
    app.useStaticAssets('./static');
    app.setBaseViewsDir('./views');
    app.setViewEngine('ejs');
    app.useWebSocketAdapter(new IoAdapter(app))
    console.log("Starting app...");
    await app.listen(80).catch(err => {
        console.log(err);
    });
}
bootstrap();
  