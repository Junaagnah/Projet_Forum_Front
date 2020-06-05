import { Injectable } from '@angular/core';
import { AuthenticationService } from "../services/authentication.service";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // @ts-ignore
    if (!isNullOrUndefined(this.authenticationService.currentUserValue) && this.authenticationService.currentUserValue.role === "3") {
      return true;
    }
    // Retain the attempted URL for redirection
    // this.authService.redirectUrl = url;
    this.router.navigate(['/']).then();
    return false;
  }
}
