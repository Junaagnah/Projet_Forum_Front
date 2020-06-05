import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';


@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(
        // private authService: AuthService,
        private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
            if (!isNullOrUndefined(localStorage.getItem('username'))) {
                return true;
            }
            // Retain the attempted URL for redirection
            // this.authService.redirectUrl = url;
            this.router.navigate(['/signin']).then();
            return false;
    }
}
