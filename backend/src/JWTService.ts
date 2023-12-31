import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

export class JWTService {
    private static secretKey: jwt.Secret = "asd";

    public static setSecretKey(secretKey: string) {
        this.secretKey = secretKey;
    }

    public static middleware(req: Request, res: Response, next: NextFunction) {
        let token = req.cookies["jwt"];
        if (token) {
            let result = JWTService.verify(token);
            console.log(result);
            if (result == false) {
                console.log(req.url)
                if (req.url.indexOf("api") == 1) {
                    res.status(401).json({message: "Invalid token"});
                } else if (req.url != "/account/login"){
                    res.redirect("/account/login?redirect=" + req.url);
                    req.body.logged = false;
                } else {
                    next();
                }
                return;
            } else {
                req.body.logged = true;
                req.body.id = result;
            }
        } else {
            req.body.logged = false;
        }
        next();
    }

    public static verify(token: string): false | number {
        let decoded;
        try {
            decoded = jwt.verify(token, this.secretKey);
        } catch (err) {
            console.log(err);
            return false;
        }
        if (!decoded) {
            return false;
        } else {
            if (typeof decoded == "string") {
                console.log("Error: " + decoded)
                return false;
            }
            return decoded.id;
        }
    }

    public static generateToken(id: number) {
        return jwt.sign({id: id}, this.secretKey, {expiresIn: "12h"});
    }

    public static async getLogin(token: string) {
        try {
            let decoded = jwt.verify(token, this.secretKey) as {login: string};
            return decoded?.login;
        } catch (error) {
            console.log(error);
        }
    }

    public static encryptPassword(password: string) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    public static comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }
}