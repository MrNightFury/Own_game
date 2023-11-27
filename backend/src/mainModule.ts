import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersController } from './controllers/api/UsersController.js';
import { DBService } from './db/DBService.js';
import { ConfigService } from './config/ConfigService.js';
import { UsersRepository } from './db/UsersRepository.js';
import { SetsEditorController } from './controllers/view/SetsEditorController.js';
import { SetsRepository } from './db/SetsRepository.js';
import { AccountControler } from './controllers/view/AccountController.js';
import { AuthControler } from './controllers/api/AuthController.js';
import { AuthCheckMiddleware } from './controllers/AuthCheckMiddleware.js';

@Module({
    imports: [],
    controllers: [UsersController, SetsEditorController, AccountControler, AuthControler],
    providers: [DBService, ConfigService, UsersRepository, SetsRepository],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthCheckMiddleware).forRoutes("/");
    }
}
