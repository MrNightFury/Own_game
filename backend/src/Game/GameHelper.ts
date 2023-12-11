export class GameHelper {
    public static parseToken(cookieString: string): string | undefined {
        let cookies;
        if (cookieString) {
            cookieString.split(';').forEach((cookie) => {
                const parts = cookie.split('=');
                const name = parts[0].trim();
                const value = parts[1].trim();
                if (name == "jwt") {
                    cookies = value;
                }
            });
        }
        return cookies;
      }
}