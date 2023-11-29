import { User } from "./db/model/User";

export class CanHelper {
    public static can(user: User | undefined, id: number): boolean {
        return (user && (user.user_id == id || user.is_admin)) ?? false;
    }
}