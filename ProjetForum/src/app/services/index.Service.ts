import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { IndexClient, RegisterViewModel } from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IndexService {

    forumApiUrl: string;

    // Tentatives d'appel avant erreur
    serviceConnectionRetries = 3;

    // On injecte l'url du service
    constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
      this.forumApiUrl = serviceUrl;
    }

    /**
     * @description Permet d'afficher les catégories et les 10 derniers posts sur la page d'accueil
     */
    index() {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.index().pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    /**
     * @description Enregistrement d'un nouvel utilisateur
     * @param RegisterViewModel
     * @returns ReturnModel
     */
    register(user: RegisterViewModel) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.register(user).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    /**
     * @description Connexion d'un utilisateur
     * @param email
     * @param password
     * @returns IdentityUser
     */
    signin(email: string, password: string) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.signin(email, password).pipe(
            retry(0),
            catchError(this.handleError)
        );
    }

    /**
     * @description Validation du compte d'un utilisateur
     * @param id
     * @param token
     * @returns ReturnModel
     */
    confirmEmail(userId: string, token: string) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.confirmEmail(userId, token).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    /**
     * @description Envoi du mail de récupération de compte
     * @param email
     * @returns ReturnModel
     */
    askPasswordRecovery(email: string) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.askPasswordRecovery(email).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        )
    }

    /**
     * @description Modifiation du mot de passe de l'utilisateur via token
     * @param userId
     * @param password
     * @param token
     * @returns ReturnModel
     */
    recoverPassword(userId: string, password: string, token: string) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.recoverPassword(userId, password, token).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        )
    }

    /**
     * @description Permet à l'utilisateur d'envoyer un message à l'administrateur
     * @param email
     * @param message
     * @returns ReturnModel
     */
    contact(email: string, message: string) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.contact(email, message).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        )
    }

    /**
     * @description Renouvellement du refreshToken
     * @param username
     * @param refreshToken
     * @returns ReturnModel
     */
    renewToken(username: string, refreshToken: string) {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.renewToken(username, refreshToken).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        )
    }

    /**
     * @description Déconnecte un utilisateur et supprime son refreshToken
     */
    disconnect() {
        const client: IndexClient = new IndexClient(this.httpClient, this.forumApiUrl);
        return client.disconnect().pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    // Gestion des erreurs
    handleError(errorResponse: HttpErrorResponse) {
        console.log(errorResponse);
        return throwError(errorResponse);
    }
}
