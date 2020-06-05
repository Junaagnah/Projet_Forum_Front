import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import * as jwt_decode from 'jwt-decode';
import { DecodedJwt } from '../models/decodedJwt';
import { LoggedUserData } from '../models/loggedUserData';
import { IndexService } from './index.service';
import { MyResponse } from './forumApiTypeScriptClient';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<LoggedUserData>;
    public currentUser: Observable<LoggedUserData>;

    constructor(private IndexService: IndexService) {
        this.currentUserSubject = new BehaviorSubject<LoggedUserData>(null);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): LoggedUserData {
        return this.currentUserSubject.value;
    }

    init(): Observable<boolean> {
        return from(new Promise<boolean>(async (resolve) => {
            if (localStorage.getItem('refreshToken') !== null && localStorage.getItem('username') !== null) {
                await this.IndexService.renewToken( localStorage.getItem('username'), localStorage.getItem('refreshToken'))
                    .toPromise().then(authResponse => {
                    if (authResponse && authResponse.result) {
                        this.checkBannedAndStoreJwt(authResponse);
                    } else {
                        this.removeLocalDataAndGoToHome();
                    }
                }).catch(error => {
                    console.log(error);
                });
                return resolve(true);
            } else {
                return resolve(true);
            }
        }));
    }

    checkBannedAndStoreJwt(authResponse: MyResponse) {
        if (authResponse.result !== null && !authResponse.result.isBanned) {
            this.currentUserSubject.next(this.decodeJwt(authResponse.result.token));
            localStorage.setItem('refreshToken', authResponse.result.refreshToken);
            localStorage.setItem('username', this.currentUserSubject.value.username);
        } else {
            this.removeLocalDataAndGoToHome();
        }
    }

    removeLocalDataAndGoToHome() {
        localStorage.clear();
        this.currentUserSubject.next(null);
        location.replace('/');
    }

    signin(email: string, password: string): Observable<MyResponse> {
        return from(new Promise<MyResponse>(async (resolve) => {
            await this.IndexService.signin(email, password).toPromise().then(authResult => {
                if (authResult.result !== null && !authResult.result.isBanned) {
                    this.checkBannedAndStoreJwt(authResult);
                }
                return resolve(authResult);
            }).catch(error => {
                console.log(error);
                return resolve(null);
            });
        }));
    }

    signout() {
        return from(new Promise<boolean>(async (resolve) => {
            await this.IndexService.disconnect().toPromise();
            this.removeLocalDataAndGoToHome();
            return resolve(true);
        }));
    }

    decodeJwt(token: string): LoggedUserData {
        const jsonDecodedJwt = jwt_decode(token);
        const decodedJwt: DecodedJwt = new DecodedJwt();

        Object.keys(jsonDecodedJwt).forEach(k => {
            decodedJwt[k] = jsonDecodedJwt[k];
        });

        return new LoggedUserData(decodedJwt.username, decodedJwt.role, token, new Date(decodedJwt.exp * 1000));
    }
}
