import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthCheckMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        let token = req.signedCookies["jqt"];
        console.log(token);
        next();
    }
}
    // public static async loginCheckMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    //     let token = req.headers["authorization"];
    //     if (token) {
    //         jwt.verify(token, Login.secretKey, (err, decoded) => {
    //             if (err || !decoded) {
    //                 res.status(401).json({message: "Invalid token: " + JSON.stringify(err)});
    //                 return;
    //             } else {
    //                 let body = decoded as {login: string};
    //                 console.log("Login: " + body.login)
    //                 req.body.login = body.login;
    //                 req.body.logged = true;
    //             }
    //         })
    //     } else {
    //         req.body.logged = false;
    //     }
    //     next();
    // }