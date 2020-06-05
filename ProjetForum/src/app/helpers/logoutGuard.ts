import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';


@Injectable({
    providedIn: 'root'
})
export class LogoutGuard implements CanActivate {

    constructor(
        // private authService: AuthService,
        private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // if (!this.authService.isLoggedIn) {
        //   return true;
        // }
        if (isNullOrUndefined(localStorage.getItem('username'))) {
            return true;
        }
        this.router.navigate(['/']).then();
        return false;
    }
}
