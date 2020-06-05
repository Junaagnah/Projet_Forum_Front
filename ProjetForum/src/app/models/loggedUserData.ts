export class LoggedUserData {

    username: string;
    role: number;
    token: string;
    tokenValidity: Date;

    constructor(username: string, role: number, token: string, tokenValidity: Date) {
        this.username = username;
        this.role = role;
        this.token = token;
        this.tokenValidity = tokenValidity;
    }
}