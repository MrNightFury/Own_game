import { HttpStatus, Injectable } from "@nestjs/common";
import { Role, User } from "./db/model/User.js";
import { UsersRepository } from "./db/UsersRepository.js";
import { SetsRepository } from "./db/SetsRepository.js";
import { CategoriesControler } from "./controllers/api/CategoriesController.js";
import { CategoriesRepository } from "./db/CategoriesRepository.js";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class CanHelper {
    private static usersRepo: UsersRepository;
    private static setsRepo: SetsRepository;
    private static catsRepo: CategoriesRepository;
    constructor(userRepo: UsersRepository, setsRepository: SetsRepository, categoriesRepository: CategoriesRepository) {
        CanHelper.usersRepo = userRepo;
        CanHelper.setsRepo = setsRepository;
        CanHelper.catsRepo = categoriesRepository;
    }

    public static canEdit(user: User | undefined, id: number): boolean {
        return (user && (user.user_role == Role.ADMIN || user.user_id == id)) ?? false;
    }
    
    public static async canCreate(userId: number) {
        if (userId == undefined) {
            return false;
        }
        let user = await this.usersRepo.getUserById(userId);
        return (user && (user.user_role == Role.EDITOR || user.user_role == Role.ADMIN)) ?? false;
    }
    public static async canEditSet(userId: number, setId: number) {
        if (userId == undefined) {
            return false;
        }
        let user = await this.usersRepo.getUserById(userId);
        let set = await this.setsRepo.getSet(setId);
        return (user && (user.user_role == Role.ADMIN || user.user_id == set?.set_author_id)) ?? false;
    }
    public static async canEditCategory(userId: number, categoryId: number) {
        if (userId == undefined) {
            return false;
        }
        let user = await this.usersRepo.getUserById(userId);
        let category = await this.catsRepo.getCategory(categoryId);
        return (user && (user.user_role == Role.ADMIN || user.user_id == category?.category_author_id)) ?? false;
    }

    public static async checkSetEdit(req: Request, res: Response, setId: number) {
        if (!req.body.logged) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return false;
        }
        if (!await CanHelper.canEditSet(req.body.id, setId)) {
            res.status(HttpStatus.FORBIDDEN).send();
            return false;
        }
        return true;
    }

    public static async setEditMiddleware(req: Request, res: Response, next: NextFunction) {
        console.log("Set Edit Middleware");
        if (!req.body.logged) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }
        if (!await CanHelper.canEditSet(req.body.id, +req.params.id)) {
            res.status(HttpStatus.FORBIDDEN).send();
            return;
        }
        next();
    }
    public static async categoryEditMiddleware(req: Request, res: Response, next: NextFunction) {
        console.log("Category Edit Middleware");
        if (!req.body.logged) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }
        if (!await CanHelper.canEditCategory(req.body.id, +req.params.id)) {
            res.status(HttpStatus.FORBIDDEN).send();
            return;
        }
        next();
    }
    public static async userIdCheck(req: Request, res: Response, next: NextFunction) {
        console.log("User Edit Middleware");
        if (!req.body.logged) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }
        if (!await CanHelper.canEditCategory(req.body.id, +req.params.id)) {
            res.status(HttpStatus.FORBIDDEN).send();
            return;
        }
        next();
    }

    private static restrictedLogins = ["login", "register"];
    public static validLogin(login: string) {
        for (let l of this.restrictedLogins) {
            if (login == l) {
                return false;
            }
        }
        return true;
    }
}