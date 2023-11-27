import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export class JWTService {
    private static secretKey: jwt.Secret = "asd";

    public static setSecretKey(secretKey: string) {
        this.secretKey = secretKey;
    }

    public static async getLogin(token: string) {
        try {
            let decoded = jwt.verify(token, this.secretKey) as {login: string};
            return decoded?.login;
        } catch (error) {
            console.log(error);
        }
    }

    public static generateToken(login: string) {
        return jwt.sign({login: login}, this.secretKey, {expiresIn: "12h"});
    }

    public static encryptPassword(password: string) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    public static comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }
}