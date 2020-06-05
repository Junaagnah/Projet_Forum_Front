import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { IndexService } from '../services/index.service';
import { switchMap, catchError } from 'rxjs/operators';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private indexService: IndexService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let currentUser;
        this.authenticationService.currentUser.subscribe(value => {
          currentUser = value;
        });

        // Requêtes pour récupérer un nouveau token (sans bearer)
        if (request.url.split('?')[0].endsWith('api/Index/RenewToken')) {
            return next.handle(request);
            // Requêtes pour lesquelles on à un refreshToken et un username en localstorage mais pas de JWT ou un JWT invalide
            // (qui seront faites avec bearer une fois le JWT récupéré avec getNewToken)
        } else if (localStorage.getItem('refreshToken') !== null && localStorage.getItem('username') !== null &&
        (!currentUser || currentUser.tokenValidity <= new Date(Date.now()))) {
            return this.indexService.renewToken(localStorage.getItem('username'), localStorage.getItem('refreshToken'))
                .pipe(switchMap(result => {
                    this.authenticationService.checkBannedAndStoreJwt(result);
                    if (currentUser && currentUser.token) {
                        request = request.clone({
                            setHeaders: {
                                Authorization: `Bearer ${currentUser.token}`
                            }
                        });
                    }
                    return next.handle(request);
                }));
            // Requêtes pour lesquelles on à un refreshToken et un token valide (avec bearer)
        } else if (currentUser && currentUser.token && currentUser.tokenValidity > new Date(Date.now())) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
            return next.handle(request);
            // Autres requêtes (sans bearer)
        } else {
            return next.handle(request);
        }
    }
}
