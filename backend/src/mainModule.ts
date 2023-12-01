import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
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
import { CategoriesControler } from './controllers/api/CategoriesController.js';
import { QuestionsRepository } from './db/QuestionsRepository.js';
import { RedirectController } from './controllers/redirect.js';
import { CanHelper } from './canHelper.js';

@Module({
    imports: [],
    controllers: [
        UsersController, AuthControler, SetsControler, CategoriesControler,
        AccountControler, SetsEditorController, CategoriesEditorController,
        RedirectController
    ],
    providers: [
        DBService, ConfigService, UsersRepository, SetsRepository, RoundsRepository, CategoriesRepository, QuestionsRepository, CanHelper
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JWTService.middleware)
            .exclude("auth/(.*)")
            .forRoutes("/");
        consumer.apply(CanHelper.setEditMiddleware)
            .exclude({path: "*", method: RequestMethod.GET})
            .forRoutes(
                { path: "api/sets/:id", method: RequestMethod.ALL },
                { path: "api/sets/:id/rounds", method: RequestMethod.ALL },
            )
        consumer.apply(CanHelper.categoryEditMiddleware)
            .exclude({path: "*", method: RequestMethod.GET})
            .forRoutes(
                { path: "api/categories/:id", method: RequestMethod.ALL },
                { path: "api/categories/:id/questions", method: RequestMethod.ALL },
            )
        consumer.apply(CanHelper.userIdCheck)
            .exclude({path: "*", method: RequestMethod.GET})
            .forRoutes(
                { path: "api/users/:id", method: RequestMethod.ALL },
            )
    }
}
