import { RegisterViewModel } from '../services/forumApiTypeScriptClient';

export class RegisterViewModelBuilder extends RegisterViewModel {
    constructor(username: string, email: string, password: string) {
        super();
        this.username = username;
        this.email = email;
        this.password = password;
    }
}