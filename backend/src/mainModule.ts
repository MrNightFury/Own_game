import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersController } from './controllers/api/UsersController.js';
import { DBService } from './db/DBService.js';
import { ConfigService } from './config/ConfigService.js';
import { UsersRepository } from './db/UsersRepository.js';
import { SetsEditorController } from './controllers/view/SetsEditorController.js';
import { SetsRepository } from './db/SetsRepository.js';
import { AccountControler } from './controllers/view/AccountController.js';
import { AuthControler } from './controllers/api/AuthController.js';
import { JWTService } from './JWTService.js';
import { RoundsRepository } from './db/RoundsRepository.js';
import { CategoriesRepository } from './db/CategoriesRepository.js';
import { SetsControler } from './controllers/api/SetsController.js';
import { CategoriesEditorController } from './controllers/view/CategoriesEditorController.js';

@Module({
    imports: [],
    controllers: [
        UsersController, AuthControler, SetsControler,
        AccountControler, SetsEditorController, CategoriesEditorController
    ],
    providers: [DBService, ConfigService, UsersRepository, SetsRepository, RoundsRepository, CategoriesRepository],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JWTService.middleware)
            .exclude("auth/(.*)")
            .forRoutes("/");
    }
}
