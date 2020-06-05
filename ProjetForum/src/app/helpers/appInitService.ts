import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AppInitService {

    constructor(private authenticationService: AuthenticationService) { }

    Init() {
        return new Promise<void>(async (resolve, reject) => {
            await this.authenticationService.init().toPromise();
            resolve();
        });
    }
}
